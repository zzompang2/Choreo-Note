import React from 'react';
import {
  Dimensions, SafeAreaView, View, Text, TouchableOpacity, Animated, Easing, TextInput, Alert, Keyboard
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import Sound from 'react-native-sound';
import IconIonicons from 'react-native-vector-icons/Ionicons';

import getStyleSheet, { getDancerColors } from '../values/styles';
import Stage from '../components/Stage';
import Timeline from '../components/Timeline';
import ToolBar from '../components/ToolBar';
import PlayerBar from '../components/PlayerBar';
import DancerScreen from '../components/DancerScreen';
import ToolBarForFormation from '../components/ToolBarForFormation';

const { width } = Dimensions.get('window');

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });
const TAG = 'FormationScreen/';
const unitTime = 250;			// 최소 시간단위 (millisecond)

export default class FormationScreen extends React.Component {
	state = {
		noteInfo: undefined,				// musicLength 단위 sec
		dancers: [],
		times: [],									// 단위 msec
		positions: [],
		curTime: 0,									// 단위 msec
		selectedPosTime: undefined,	// 단위 msec
		isPlay: false,
		titleOnFocus: false,
		dancerScreenPop: false,
		coordinateGap: 40,
		alignWithCoordinate: false,
		unitBoxWidth: 10,						// 한 단위시간 박스의 가로 길이
	}
	
	pressPlayButton = () => {
		if(!this.state.isPlay)
		this.play();
		else
		this.pause();
	}

	play = () => {
		const { isPlay, curTime, noteInfo: { musicLength }, unitBoxWidth } = this.state;
		if(!isPlay) {
			const startTime = new Date().getTime();
			this.interval = setInterval(() => {
				const musicTime = curTime + Math.floor((new Date().getTime() - startTime)/unitTime)*unitTime;
				
				if(this.state.curTime != musicTime) {
					console.log(TAG, "play/", `${musicTime}/${musicLength*1000}`);
					if(musicTime >= musicLength * 1000) {
						clearInterval(this.interval);
						this.timelineScroll.scrollTo({x: 0, animated: true});
						this.setState({ curTime: 0, isPlay: false });
					}
					else {
						this.timelineScroll.scrollTo({x: musicTime / unitTime * unitBoxWidth, animated: true});
						this.setState({ curTime: musicTime });
					}
				}
			},
			100);
			this.setState({ isPlay: true, selectedPosTime: undefined });
			this.musicPlay();
		}
	}

	pause = () => {
		clearInterval(this.interval);
		this.timelineScroll.scrollTo({x: this.state.curTime / unitTime * this.state.unitBoxWidth, animated: false});
		this.setState({ isPlay: false });
		this.sound.pause();
	}

	/**
	 * 현재 시간을 변경한다.
	 * @param {number} msec 단위 millisecond
	 */
	setCurTime = (msec) => {
		if(this.state.isPlay)
		return;

		if(msec < 0)
		msec = 0;
		else if(this.state.noteInfo.musicLength*1000 <= msec)
		msec = this.state.noteInfo.musicLength*1000 - unitTime;

		this.setState({ curTime: msec });
	}
	
	/**
	 * Formation box 를 선택한 상태로 만든다.
	 * @param {number} msec 선택된 box 의 time 값
	 */
	selectFormationBox = (msec) => {
		if(!this.state.isPlay)
		this.setState({ selectedPosTime: msec });
	}

	/**
	 * note 의 title 을 변경한다.
	 * @param {*} event 
	 */
	changeTitle = (event) => {
		const { noteInfo: { nid } } = this.state;
		const title = event.nativeEvent.text.trim();

		console.log("title:", title);
		if(title == '')
		Alert.alert('노트 제목', '제목은 공백일 수 없어요.', [
			{text: '네', onPress: () => this.titleInput.focus()}
		]);

		else {
			const noteInfo = {...this.state.noteInfo, title};
			this.setState({ noteInfo, titleOnFocus: false });

			db.transaction(txn => {
				txn.executeSql(
					"UPDATE notes " +
					"SET title=? " +
					"WHERE nid=?",
					[title, nid]);
			},
			e => console.log("DB ERROR", e),
			() => console.log("DB SUCCESS"));
		}
	}

	/**
	 * 선택되어 있는 Formation box 의 정보를 주어진 time, duration 값으로 업데이트 한다.
	 * (반드시 선택되어 있는 박스가 있어야 하고, 선택된 박스만 수정할 수 있음)
	 * @param {number} newTime 변경된 새로운 time 값
	 * @param {number} newDuration 변경된 새로운 duration 값
	 */
	changeFormationBoxLength = (newTime, newDuration) => {
		console.log(TAG, "changeFormationBoxLength/", newTime, newDuration);
		const { noteInfo: { nid, musicLength }, times, positions, selectedPosTime } = this.state;

		// 노래 밖을 나가는 경우
		if(newTime < 0 || musicLength * 1000 <= newTime + newDuration)
			return;

		let newTimes;
		let newPositions = positions;
		const isTimeChanged = selectedPosTime != newTime;
		let i = 0;

		// 선택되어 있는 Formation box 의 index 찾기
		for(; i<times.length; i++)
			if(times[i].time == selectedPosTime)
				break;

		// 유효하지 않은 time 값인 경우
		if(i == times.length) 
			return;

		// 왼쪽 블럭과 닿거나 넘어가는 경우
		if(i != 0 && newTime <= times[i-1].time + times[i-1].duration) {
			const temp = times[i-1].time + times[i-1].duration + unitTime;
			newDuration -= (temp - newTime);
			newTime = temp;
		}

		// 오른쪽 블럭과 닿거나 넘어가는 경우
		else if(i != times.length-1 && times[i+1].time <= newTime + newDuration)
		newDuration = times[i+1].time - newTime - unitTime;

		// times 없데이트
		newTimes = [
			...times.slice(0, i),
			{ nid, time: newTime, duration: newDuration },
			...times.slice(i+1)
		];

		// time 이 수정된 경우 positions 의 time 값도 업데이트
		if(isTimeChanged) {
			const newPositionsEntry = [];
			positions[i].forEach(pos => {
				newPositionsEntry.push({...pos, time: newTime});
			});
			newPositions = [
				...positions.slice(0, i),
				newPositionsEntry,
				...positions.slice(i+1)
			];
		}

		this.setState({ times: newTimes, positions: newPositions, selectedPosTime: newTime });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE times " +
				"SET time=?, duration=? " +
				"WHERE nid=? AND time=?",
				[newTime, newDuration, nid, selectedPosTime]);

			if(isTimeChanged) {
				txn.executeSql(
					"UPDATE positions " +
					"SET time=? " +
					"WHERE nid=? AND time=?",
					[newTime, nid, selectedPosTime]);
			}
		});
		this.updateEditDate();
	}

	/**
	 * 선택되어 있는 Formation box 의 formation 에서 Dancer 의 위치를 수정한다.
	 * (반드시 선택되어 있는 박스가 있어야 하고, 선택된 박스의 댄서 위치만 수 있음)
	 * @param {number} did 수정할 Dancer 의 id
	 * @param {number} newX 새로운 X 좌표
	 * @param {number} newY 새로운 Y 좌표
	 */
	changeDancerPosition = (did, newX, newY) => {
		const { noteInfo: { nid, stageRatio }, times, positions, selectedPosTime, coordinateGap, alignWithCoordinate } = this.state;
		const { transDeviceToStandardXY } = this;

		if(selectedPosTime === undefined)		// ERROR
			return;

		let i = 0;
		for(; i<times.length; i++)
			if(times[i].time == selectedPosTime)
			break;

		const standXY = transDeviceToStandardXY({x: newX, y: newY});

		if(alignWithCoordinate) {
			standXY.x = Math.round(standXY.x / coordinateGap) * coordinateGap;
			standXY.y = Math.round(standXY.y / coordinateGap) * coordinateGap;
		}

		if(standXY.x < -480)
		standXY.x = -480;
		else if(standXY.x > 480)
		standXY.x = 480;

		if(standXY.y < -500/stageRatio+20)
		standXY.y = -500/stageRatio+20;
		else if(standXY.y > 500/stageRatio-20)
		standXY.y = 500/stageRatio-20;

		const newPositionsEntry = [
			...positions[i].slice(0, did),
			{...positions[i][did], ...standXY},
			...positions[i].slice(did+1)
		];
		const newPositions = [...positions.slice(0, i), newPositionsEntry, ...positions.slice(i+1)];

		this.setState({ positions: newPositions });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE positions " +
				"SET x=?, y=? " +
				"WHERE nid=? AND time=? AND did=?",
				[standXY.x, standXY.y, nid, times[i].time, did],
				() => console.log("DB SUCCESS"),
				e => console.log("DB ERROR", e));
		});
		this.updateEditDate();
	}

	transDeviceToStandardXY({ x, y }) {
		const standX = x * 1000 / width;
		const standY = y * 1000 / width;
		return { x: standX, y: standY };
	}

	transStandardToDeviceXY({ x, y }) {
		const deviceX = x / 1000 * width;
		const deviceY = y / 1000 * width;
		return { x: deviceX, y: deviceY };
	}

	transStandardToDevice(x) {
		const deviceX = x / 1000 * width;
		return deviceX;
	}

	transDeviceToStandard(x) {
		const standX = x * 1000 / width;
		return standX;
	}
	/**
	 * state 상태에서 각 Dancer 의 위치를 계산한다
	 */
	getCurDancerPositions = (state) => {
		const { times, positions, curTime, selectedPosTime } = state;
		const { transStandardToDeviceXY } = this;

		if(times.length == 0)
		return;

		// case 0: 어떤 Formation box 가 선택된 상태인 경우: 선택된 대열을 보여줌
		if(selectedPosTime !== undefined) {
			for(let i=0; i<times.length; i++)
			if(times[i].time == selectedPosTime) {
				positions[i].forEach((pos, idx) =>
				this.positionsAtCurTime[idx].setValue(transStandardToDeviceXY({ x: pos.x, y: pos.y })));
				break;
			}
		}
		// case 1: 첫 번째 블록보다 앞에 있는 경우
		else if(curTime < times[0].time)
		positions[0].forEach((pos, idx) =>
		this.positionsAtCurTime[idx].setValue(transStandardToDeviceXY({ x: pos.x, y: pos.y })));

		// case 2: 마지막 블록보다 뒤에 있는 경우
		else if(times[times.length-1].time + times[times.length-1].duration < curTime)
		positions[times.length-1].forEach((pos, idx) =>
		this.positionsAtCurTime[idx].setValue(transStandardToDeviceXY({ x: pos.x, y: pos.y })));

		else {
			for(let i=0; i < times.length; i++) {
				const time = times[i];
				if(curTime <= time.time + time.duration) {
					// case 3: times[i] 내에 포함된 경우
					if(time.time <= curTime)
					positions[i].forEach((pos, idx) =>
					this.positionsAtCurTime[idx].setValue(transStandardToDeviceXY({ x: pos.x, y: pos.y })));

					// case 4: times[i-1] ~ [i] 사이에 있는 경우
					else {
						for(let did=0; did<positions[i].length; did++) {
							const prevDuration = times[i-1].duration;
							const prev = positions[i-1][did];
							const post = positions[i][did];
							const x = prev.x + (post.x - prev.x) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
							const y = prev.y + (post.y - prev.y) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
							this.positionsAtCurTime[did].setValue(transStandardToDeviceXY({ x, y }));
						}
					}
					break;
				}
			}
		}
	}

	/**
	 * state 상태에서 새로운 formation 을 추가할 수 있는지 여부를 체크한다.
	 * @param {object} state 기준 state
	 */
	checkFormationAddable = (state) => {
		const { noteInfo: { musicLength }, times, curTime } = state;
		this.formationAddable = false;

		// curTime 유효성 검사
		if(curTime < 0 || musicLength * 1000 <= curTime + unitTime)
		return;

		// times 에서 curTime 을 포함하거나 바로 오른쪽에 있는 블록을 찾는다
		let i = 0;
		for(; i<times.length; i++)
		if(curTime <= times[i].time + times[i].duration)
		break;

		// duration 은 최소 1 unitTime 이어야 하므로 curTime+unitTime	까지 공간이 있어야 한다
		if(i != times.length && times[i].time <= curTime + unitTime)
		return;

		this.formationAddable = true;
	}

	/**
	 * curTime 시간에 새로운 formation 을 추가한다.
	 */
	addFormation = () => {
		const { noteInfo: { nid, musicLength }, dancers, times, positions, curTime } = this.state;

		if(!this.formationAddable)
		return;

		// times 에서 curTime 을 포함하거나 바로 오른쪽에 있는 블록을 찾는다
		let i = 0;
		for(; i<times.length; i++)
		if(curTime <= times[i].time + times[i].duration)
		break;

		let duration;
		// 오른쪽에 기존 블록이 있는 경우, (사이 공간-1) 만큼 duration 을 설정한다 (최대 5)
		if(i != times.length)
		duration = times[i].time - curTime > 5*unitTime ? 5*unitTime : times[i].time - curTime - unitTime;
		else
		duration = musicLength*1000 - curTime > 5*unitTime ? 5*unitTime : musicLength*1000 - curTime - unitTime;

		const newTimeEntry = { nid, time: curTime, duration };
		const newPositionEntry = [];

		// position 계산하기
		// case 0: 기존에 블록이 하나도 없던 경우
		if(times.length == 0)
		for(let did=0; did<dancers.length; did++)
		newPositionEntry.push({nid, time: curTime, did, x: 0, y: 0});
		// case 1: 모든 블록보다 왼쪽에 있는 경우
		else if(i == 0)
		for(let did=0; did<dancers.length; did++)
		newPositionEntry.push({...positions[0][did]});
		// case 2: 모든 블록보다 오른쪽에 있는 경우
		else if(i == times.length)
		for(let did=0; did<dancers.length; did++)
		newPositionEntry.push({...positions[i-1][did]});
		// case 3: 두 블록 사이에 있는 경우
		else {
			for(let did=0; did<dancers.length; did++) {
				const prevDuration = times[i-1].duration;
				const prev = positions[i-1][did];
				const post = positions[i][did];
				const x = prev.x + (post.x - prev.x) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
				const y = prev.y + (post.y - prev.y) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
				newPositionEntry.push({ did, time: curTime, x, y });
			}
		}

		const newTimes = [...times.slice(0, i), newTimeEntry, ...times.slice(i)];
		const newPositions = [...positions.slice(0, i), newPositionEntry, ...positions.slice(i)];
		this.setState({ times: newTimes, positions: newPositions, selectedPosTime: undefined });

		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO times VALUES (?, ?, ?)",
				[nid, curTime, duration]);

			for(let did=0; did<dancers.length; did++)
			txn.executeSql(
				"INSERT INTO positions VALUES (?, ?, ?, ?, ?)",
				[nid, curTime, did, newPositionEntry[did].x, newPositionEntry[did].y]);
		});
		this.updateEditDate();
	}

	/**
	 * 선택된 formation 을 삭제한다.
	 */
	deleteFormation = () => {
		const { noteInfo: { nid }, dancers, times, positions, selectedPosTime } = this.state;

		// 유효성 검사
		if(selectedPosTime == undefined)
		return;

		// 선택된 블럭을 찾는다
		let i = 0;
		for(; i<times.length; i++)
		if(selectedPosTime == times[i].time)
		break;

		if(i == times.length)
		return;

		console.log(times, i);
		const newTimes = [...times.slice(0, i), ...times.slice(i+1)];
		const newPositions = [...positions.slice(0, i), ...positions.slice(i+1)];
		console.log(newTimes);
		this.setState({ times: newTimes, positions: newPositions, selectedPosTime: undefined });

		db.transaction(txn => {
			txn.executeSql(
				"DELETE FROM times WHERE nid=? AND time=?",
				[nid, selectedPosTime]);

			for(let did=0; did<dancers.length; did++)
			txn.executeSql(
				"DELETE FROM positions WHERE nid=? AND time=?",
				[nid, selectedPosTime]);
		});
		this.updateEditDate();
	}

	setDancerScreen = (isOpen) => this.setState({ dancerScreenPop: isOpen })

	setAlignWithCoordinate = () => {
		const { alignWithCoordinate } = this.state;
		this.setState({ alignWithCoordinate: !alignWithCoordinate });
	}

	changeCoordinateGap = (gapInDevice) => {
		const { coordinateGap } = this.state;
		const gap = Math.round(this.transDeviceToStandard(gapInDevice) / 20) * 20;
		if(coordinateGap != gap && gap <= 100 && gap >= 40)
		this.setState({ coordinateGap: gap });
	}

	changeUnitBoxWidth = (width) => {
		const { unitBoxWidth, curTime } = this.state;
		const newWidth = Math.round(width / 3) * 3;
		if(unitBoxWidth != newWidth && newWidth <= 20 && newWidth >= 5) {
			this.timelineScroll.scrollTo({x: curTime / unitTime * newWidth, animated: false});		// 너비 조절 후 현재 시간 위치로 이동
			this.setState({ unitBoxWidth: newWidth });
		}
	}

	/**
	 * DB 가 수정될 때 마다 edit date 를 업데이트 한다.
	 * state 의 정보는 업데이트 하지 않으니 조심하자.
	 */
	updateEditDate = () => {
		const { noteInfo: { nid } } = this.state;
		const { getTodayDate } = this.props.route.params;
		const newDate = getTodayDate();

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE notes " +
				"SET editDate=? " +
				"WHERE nid=?",
				[newDate, nid]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	musicLoad = (name) => {
		this.sound = new Sound(encodeURI(name), Sound.DOCUMENT, (error) => {
			if (error)
			console.log('MUSIC LOAD FAIL', error);
			else
			console.log('MUSIC LOAD SUCCESS:', Math.ceil(this.sound.getDuration()));
		});
	}

	musicPlay = () => {
		const { curTime } = this.state;

		if(this.sound.isLoaded()) {
			this.sound.setCurrentTime(curTime/1000);
			this.sound.play(() => {
				this.sound.pause();
				this.sound.setCurrentTime(0);
			});
		}
	}

	/**
	 * curTime 이 formation box 를 벗어나는 순간이라면 다음 formation 위치로
	 * 이동하는 애니메이션을 실행한다.
	 * @param {object} state 
	 */
	playDancerMove = (state) => {
		const { times, positions, curTime } = state;
		const animatedList = [];
		for(let i=0; i<times.length-1; i++) {
			const rightEnd = times[i].time + times[i].duration;		// formation box 의 오른쪽 끝
			if(rightEnd < curTime)
			continue;
			// formation box 를 벗어나려는 순간인 경우
			if(rightEnd == curTime) {
				const position = positions[i+1];
				for(let did=0; did<position.length; did++) {
					animatedList.push(
						Animated.timing(
							this.positionsAtCurTime[did], {
								toValue: this.transStandardToDeviceXY({x: position[did].x, y: position[did].y}),
								duration: times[i+1].time - rightEnd,
								easing: Easing.linear,
								useNativeDriver: true,	// false 로 하면 1초 간격으로 끊기는 느낌 있음
							}
						)
					);
				}
				Animated.parallel(animatedList).start();
			}
			break;
		}
	}

	playDancerMoveStart = (state) => {
		const { times, positions, curTime } = state;
		const animatedList = [];
		for(let i=0; i<times.length; i++) {
			const rightEnd = times[i].time + times[i].duration;		// formation box 의 오른쪽 끝
			if(rightEnd < curTime)
			continue;
			// formation box 를 벗어나려는 순간인 경우
			if(curTime < rightEnd && curTime < times[i].time) {
				const position = positions[i];
				for(let did=0; did<position.length; did++) {
					animatedList.push(
						Animated.timing(
							this.positionsAtCurTime[did], {
								toValue: this.transStandardToDeviceXY({x: position[did].x, y: position[did].y}),
								duration: times[i].time - curTime,
								easing: Easing.linear,
								useNativeDriver: true,
							}
						)
					);
				}
				Animated.parallel(animatedList).start();
			}
			break;
		}
	}

	setTimelineScroll = (ref) => {
		this.timelineScroll = ref;
	}

	onTimelineScroll = (event) => {
		if(!this.state.isPlay) {
			const scrollX = event.nativeEvent.contentOffset.x;
			const centerTime = Math.floor(scrollX / this.state.unitBoxWidth) * unitTime;
			
			this.setState({ curTime: centerTime });
		}
	}

	addDancer = (colorIdx) => {
		const { noteInfo: { nid }, dancers, times, positions } = this.state;
		const did = dancers.length;
		const name = `Dancer ${did+1}`;

		// dancers 업데이트
		const newKey = dancers.length == 0 ? 0 : dancers[dancers.length-1].key + 1;
		const newDancer = { nid, did, name, color: colorIdx, key: newKey };
		const newDancers = dancers.concat(newDancer);

		// 새로운 dancer 의 위치 지정을 위한 Animated 객체 추가
		this.positionsAtCurTime.push(new Animated.ValueXY());

		// positions 업데이트
		const newPositions = [];
		for(let i=0; i<positions.length; i++) {
			const newPosition = positions[i].concat({ nid, did, time: times[i].time, x: 0, y: 0 });
			newPositions.push(newPosition);
		}

		this.setState({ dancers: newDancers, positions: newPositions });

		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO dancers VALUES (?, ?, ?, ?)",
				[nid, did, name, colorIdx]);

			for(let i=0; i < times.length; i++) {
				const time = times[i];
				txn.executeSql(
					"INSERT INTO positions VALUES (?, ?, ?, 0, 0)",
					[nid, time.time, did]);
			}
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.updateEditDate();
	}

	deleteDancer = (did) => {
		const { noteInfo: { nid }, dancers, positions } = this.state;
		const afterDeletedEntry = [...dancers.slice(did+1)];
		afterDeletedEntry.forEach(dancer => dancer.did -= 1);
		const newDancers = [...dancers.slice(0, did), ...afterDeletedEntry];

		// positions 업데이트
		const newPositions = [];
		for(let i=0; i<positions.length; i++) {
			const afterDeleted = [...positions[i].slice(did+1)];
			afterDeleted.forEach(pos => pos.did -= 1);
			const newPosition = [...positions[i].slice(0, did), ...afterDeleted];
			newPositions.push(newPosition);
		}
		// 사용했던 Animated 객체 삭제
		this.positionsAtCurTime.splice(did, 1);

		this.setState({ dancers: newDancers, positions: newPositions });

		db.transaction(txn => {
			txn.executeSql(
				"DELETE FROM dancers WHERE nid=? AND did=?",
				[nid, did]);

			txn.executeSql(
				"DELETE FROM positions WHERE nid=? AND did=?",
				[nid, did]);

			for(;did < dancers.length; did++) {
				txn.executeSql(
					"UPDATE dancers SET did=? WHERE nid=? AND did=?",
					[did-1, nid, did]);
				txn.executeSql(
					"UPDATE positions SET did=? WHERE nid=? AND did=?",
					[did-1, nid, did]);
				}
		},
		e => console.log("DB ERROR", e),
		() => {
			console.log("DB SUCCESS!!");
		});
		this.updateEditDate();
	}

	changeDisplayType = () => {
		const { noteInfo } = this.state;
		const newNoteInfo = { ...noteInfo, displayName: !noteInfo.displayName };
		this.setState({ noteInfo: newNoteInfo });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE notes SET displayName=? WHERE nid=?",
				[Number(!noteInfo.displayName), noteInfo.nid]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.updateEditDate();
	}

	changeName = (text, did) => {
		const { noteInfo: { nid }, dancers } = this.state;

		const dancer = {...dancers[did]};
		dancer.name = text;
		const newDancers = [...dancers.slice(0, did), dancer, ...dancers.slice(did+1)];

		this.setState({ dancers: newDancers });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE dancers SET name=? WHERE nid=? AND did=?",
				[text, nid, did]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.updateEditDate();
	}

	changeColor = (did) => {
		const dancerColors = getDancerColors();
		const { noteInfo: { nid }, dancers } = this.state;

		const dancer = {...dancers[did]};
		dancer.color = dancer.color+1 >= dancerColors.length ? 0 : dancer.color+1;
		const newDancers = [...dancers.slice(0, did), dancer, ...dancers.slice(did+1)];

		this.setState({ dancers: newDancers });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE dancers SET color=? WHERE nid=? AND did=?",
				[dancer.color, nid, did]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.updateEditDate();
	}

	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	componentDidMount() {
		const { nid } = this.props.route.params;

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM notes WHERE nid = ?",
				[nid],
        (txn, result) => {
					const noteInfo = result.rows.item(0);
					txn.executeSql(
						"SELECT * FROM dancers WHERE nid = ? ORDER BY did",
						[nid],
						(txn, result) => {
							const dancers = [];
							this.positionsAtCurTime = [];	// curTime 에 Dancer 들의 위치 및 play 애니메이션을 위한..
							for (let i = 0; i < result.rows.length; i++) {
								dancers.push({...result.rows.item(i), key: i});
								// dancer 들의 현재 위치 및 dnd, animation 을 위한 Animated 객체
								this.positionsAtCurTime.push(new Animated.ValueXY());
							}
							txn.executeSql(
								"SELECT * FROM times WHERE nid = ? ORDER BY time",
								[nid],
								(txn, result) => {
									const times = [];
									for (let i = 0; i < result.rows.length; i++)
										times.push({...result.rows.item(i), key: i});
									txn.executeSql(
										"SELECT * FROM positions WHERE nid = ? ORDER BY time, did",
										[nid],
										(txn, result) => {
											const positions = [];
											for (let i = 0; i < result.rows.length;) {
												const positionsAtSameTime = [];
												for(let j=0; j<dancers.length; j++) {
													positionsAtSameTime.push({...result.rows.item(i), key: i});
													i++;
												}
												positions.push(positionsAtSameTime);
											}
											console.log("노트 정보:", noteInfo);
											this.setState({ noteInfo, dancers, times, positions });
											this.musicLoad(noteInfo.music);
										}
									);
								}
							);
						}
					);
				}
			);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	shouldComponentUpdate(nextProps, nextState) {
		if(nextState.isPlay) {
			// play 중일 때 formation 추가 금지
			this.formationAddable = false;
			
			// box 가 선택되어 있었다면 일단 curTime 위치로 돌아간다
			if(this.state.selectedPosTime != undefined)
			this.getCurDancerPositions(nextState);

			// play 하는 순간 두 대열 사이에 있는 경우
			if(!this.state.isPlay)
			this.playDancerMoveStart(nextState);

			// curTime 업데이트 될 때 마다 애니메이션 실행 여부 확인 및 실행
			this.playDancerMove(nextState);
		}
		
		// state 가 바뀔 때 마다 Dancer 위치, formationAddable 을 업데이트한다
		else if(this.state.curTime != nextState.curTime ||
			this.state.times != nextState.times ||
			this.state.positions != nextState.positions ||
			this.state.selectedPosTime != nextState.selectedPosTime ||
			this.state.isPlay != nextState.isPlay) {
				this.checkFormationAddable(nextState);
				this.getCurDancerPositions(nextState);
			}
		return true;
	}

	componentWillUnmount() {
		if(this.state.isPlay)
		this.pause();

		this.props.route.params.updateMainStateFromDB(this.state.noteInfo.nid);
	}

	render() {
		const { noteInfo, dancers, times, positions, curTime,
						selectedPosTime, isPlay, titleOnFocus, dancerScreenPop,
						coordinateGap, alignWithCoordinate, unitBoxWidth } = this.state;
		const styles = getStyleSheet();
		const { 
			changeTitle,
			changeDancerPosition,
			setCurTime,
			selectFormationBox,
			changeFormationBoxLength,
			addFormation,
			deleteFormation,
			setDancerScreen,
			pressPlayButton,
			setTimelineScroll,
			onTimelineScroll,
			addDancer,
			deleteDancer,
			changeDisplayType,
			changeName,
			changeColor,
			setAlignWithCoordinate,
			changeCoordinateGap,
			changeUnitBoxWidth,
			listViewItemSeparator,
		} = this;

		return(
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
			{/* Dancer Screen 을 SafeAreaView 에 넣기 위한 View */}
			<View style={{flex: 1}}>
				{/* Tool Bar */}
				<View style={styles.navigationBar}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('Main')}>
							<IconIonicons name="chevron-back" size={20} style={styles.navigationBar__button} />
						</TouchableOpacity>
						<TextInput
						numberOfLines={1} 
						style={[styles.navigationBar__title, {flex: 1}]}
						ref={ref => (this.titleInput = ref)}
						placeholder={noteInfo == undefined ? '' : noteInfo.title}
						onFocus={() => this.setState({ titleOnFocus: true })}
						onEndEditing={event => changeTitle(event)}>
							{noteInfo == undefined ? '' : noteInfo.title}
						</TextInput>
						{titleOnFocus ?
						<TouchableOpacity onPress={() => Keyboard.dismiss()}>
							<Text style={styles.navigationBarText}>확인</Text>
						</TouchableOpacity>
						: null}
					</View>
				</View>

				{listViewItemSeparator()}

				{noteInfo === undefined ? null :
				<View style={{flex: 1}}>
				{/* Stage: Coordinate & Dancer */}
				<Stage
				stageRatio={noteInfo.stageRatio}
				positionsAtCurTime={this.positionsAtCurTime}
				changeDancerPosition={changeDancerPosition}
				selectedPosTime={selectedPosTime}
				dancers={dancers}
				displayName={noteInfo.displayName}
				coordinateGapInDevice={this.transStandardToDevice(coordinateGap)}
				changeCoordinateGap={changeCoordinateGap} />

				{/* Music Bar */}
				<PlayerBar
				curTime={curTime}
				musicLength={noteInfo.musicLength}
				unitBoxWidth={unitBoxWidth} />

				{/* Timeline */}
				<Timeline
				musicLength={noteInfo.musicLength}
				dancers={dancers}
				times={times}
				positions={positions}
				curTime={curTime}
				setCurTime={setCurTime}
				selectedPosTime={selectedPosTime}
				selectFormationBox={selectFormationBox}
				changeFormationBoxLength={changeFormationBoxLength}
				isPlay={isPlay}
				unitBoxWidth={unitBoxWidth}
				unitTime={unitTime}
				setTimelineScroll={setTimelineScroll}
				onTimelineScroll={onTimelineScroll}
				addFormation={addFormation}
				formationAddable={this.formationAddable}
				changeUnitBoxWidth={changeUnitBoxWidth} />

				{/* Tool bar */}
				{ selectedPosTime == undefined ?
				<ToolBar
				setDancerScreen={setDancerScreen}
				isPlay={isPlay}
				alignWithCoordinate={alignWithCoordinate}
				setAlignWithCoordinate={setAlignWithCoordinate}
				pressPlayButton={pressPlayButton}
				changeDisplayType={changeDisplayType}
				displayName={noteInfo.displayName}
				/>	
				:
				<ToolBarForFormation
				deleteFormation={deleteFormation} />}

				</View>
				}

				{dancerScreenPop ?
				<DancerScreen
				nid={noteInfo.nid}
				dancers={dancers}
				displayName={noteInfo.displayName}
				setDancerScreen={setDancerScreen}
				addDancer={addDancer}
				deleteDancer={deleteDancer}
				changeName={changeName}
				changeColor={changeColor} /> : null}
			</View>
			</SafeAreaView>
			</View>
		)
	}
}