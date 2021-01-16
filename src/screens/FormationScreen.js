import React from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import getStyleSheet from '../values/styles';
import Stage from '../components/Stage';
import Timeline from '../components/Timeline';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class FormationScreen extends React.Component {
	
	state = {
		noteInfo: undefined,
		dancers: [],
		times: [],
		positions: [],
		curTime: 0,
		scrollEnable: true,
		selectedPosTime: undefined
	}
	
	/**
	 * 현재 시간을 변경한다.
	 * @param {number} time 새로운 time
	 */
	setCurTime = (time) => {
		if(0 <= time && time < this.state.noteInfo.musicLength)
			this.setState({ curTime: time });
	}
	
	/**
	 * Position box 를 선택한 상태로 만든다.
	 * @param {number} time 선택된 box 의 time 값
	 */
	selectPositionBox = (time) => this.setState({ selectedPosTime: time })

	/**
	 * ScrollView 들의 scroll 을 가능하게 또는 불가능하게 조절한다.
	 * @param {boolean} scrollEnable true 인 경우 scroll 가능
	 */
	setScrollEnable = (scrollEnable) => this.setState({ scrollEnable })

	/**
	 * 선택되어 있는 Position box 의 정보를 주어진 time, duration 값으로 업데이트 한다.
	 * (반드시 선택되어 있는 박스가 있어야 하고, 선택된 박스만 수정할 수 있음)
	 * @param {number} time 변경된 새로운 time 값
	 * @param {number} duration 변경된 새로운 duration 값
	 */
	changePositionboxLength = (newTime, newDuration) => {
		const { noteInfo: { nid, musicLength }, times, positions, selectedPosTime } = this.state;

		// 노래 밖을 나가는 경우
		if(newTime < 0 || musicLength <= newTime + newDuration)
			return;

		let newTimes;
		let newPositions = positions;
		const isTimeChanged = selectedPosTime != newTime;
		let i = 0;

		// 선택되어 있는 Position box 의 index 찾기
		for(; i<times.length; i++)
			if(times[i].time == selectedPosTime)
				break;

		// 유효하지 않은 time 값인 경우
		if(i == times.length) 
			return;

		// 왼쪽 블럭과 닿거나 넘어가는 경우
		if(i != 0 && newTime <= times[i-1].time + times[i-1].duration)
			return;

		// 오른쪽 블럭과 닿거나 넘어가는 경우
		if(i != times.length-1 && times[i+1].time <= newTime + newDuration)
			return;

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
	}

	/**
	 * 선택되어 있는 Position box 의 formation 에서 Dancer 의 위치를 수정한다.
	 * (반드시 선택되어 있는 박스가 있어야 하고, 선택된 박스의 댄서 위치만 수 있음)
	 * @param {number} did 수정할 Dancer 의 id
	 * @param {number} newX 새로운 X 좌표
	 * @param {number} newY 새로운 Y 좌표
	 */
	changeDancerPosition = (did, newX, newY) => {
		const { noteInfo: { nid }, times, positions, selectedPosTime } = this.state;

		if(selectedPosTime === undefined)		// ERROR
			return;

		let i = 0;
		for(; i<times.length; i++)
			if(times[i].time == selectedPosTime)
				break;

		const newPositionsEntry = [...positions[i].slice(0, did), {...positions[i][did], x: newX, y: newY}, ...positions[i].slice(did+1)];
		const newPositions = [...positions.slice(0, i), newPositionsEntry, ...positions.slice(i+1)];

		this.setState({ positions: newPositions });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE positions " +
				"SET x=?, y=? " +
				"WHERE nid=? AND time=? AND did=?",
				[newX, newY, nid, times[i].time, did],
				() => console.log("DB SUCCESS"),
				e => console.log("DB ERROR", e));
		});
	}

	componentDidMount() {
		const nid = this.props.route.params.nid;

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM notes WHERE nid = ?",
				[nid],
        (txn, result) => {
					const noteInfo = result.rows.item(0);
					txn.executeSql(
						"SELECT * FROM dancers WHERE nid = ?",
						[nid],
						(txn, result) => {
							const dancers = [];
							for (let i = 0; i < result.rows.length; i++)
								dancers.push({...result.rows.item(i), key: i});
							txn.executeSql(
								"SELECT * FROM times WHERE nid = ?",
								[nid],
								(txn, result) => {
									const times = [];
									for (let i = 0; i < result.rows.length; i++)
										times.push({...result.rows.item(i), key: i});
									txn.executeSql(
										"SELECT * FROM positions WHERE nid = ?",
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
											console.log(noteInfo);
											this.setState({ noteInfo, dancers, times, positions });
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

	render() {
		const { noteInfo, dancers, times, positions, curTime,
						scrollEnable, selectedPosTime } = this.state;
		const styles = getStyleSheet();
		const { 
			changeDancerPosition,
			setCurTime,
			setScrollEnable,
			selectPositionBox,
			changePositionboxLength,
		} = this;

		if(noteInfo === undefined)
			return null;

		return(
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<Text numberOfLines={1} style={styles.toolbarTitle}>{noteInfo.title}</Text>
					<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
						<Text style={styles.toolbarButton}>뒤로</Text>
					</TouchableOpacity>
				</View>

				{/* Stage: Coordinate & Dancer */}
				<Stage
				stageRatio={noteInfo.stageRatio}
				dancers={dancers}
				times={times}
				positions={positions}
				curTime={curTime}
				changeDancerPosition={changeDancerPosition}
				selectedPosTime={selectedPosTime} />

				{/* Music Bar */}

				{/* Timeline */}
				<Timeline
				musicLength={noteInfo.musicLength}
				dancers={dancers}
				times={times}
				positions={positions}
				curTime={curTime}
				setCurTime={setCurTime}
				scrollEnable={scrollEnable}
				setScrollEnable={setScrollEnable}
				selectedPosTime={selectedPosTime}
				selectPositionBox={selectPositionBox}
				changePositionboxLength={changePositionboxLength} />

			</SafeAreaView>
			</View>
		)
	}
}