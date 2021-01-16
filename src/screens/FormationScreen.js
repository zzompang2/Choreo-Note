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

	selectPositionBox = (time) => {
		this.setState({ selectedPosTime: time });
	}

	changePositionboxLength = (time, duration) => {
		const { noteInfo, times, positions, selectedPosTime } = this.state;

		// 노래 밖을 나가는 경우
		if(time < 0 || noteInfo.musicLength <= time + duration) return;

		let i=0;
		let newTimeEntry;
		let isTimeChange;

		// 선택되어 있는 time entry 찾기
		for(; i<times.length; i++)
			if(times[i].time == selectedPosTime) {
				isTimeChange = times[i].time != time;
				newTimeEntry = { nid: noteInfo.nid, time, duration };
				break;
			}

		// 유효하지 않은 time 값인 경우
		if(newTimeEntry == undefined) 
			return;

		// 왼쪽 블럭과 닿거나 넘어가는 경우
		if(i != 0 && time <= times[i-1].time + times[i-1].duration)
			return;

		// 오른쪽 블럭과 닿거나 넘어가는 경우
		if(i != times.length-1 && times[i+1].time <= time + duration)
			return;

		// times 없데이트
		const newTimes = [...times.slice(0, i), newTimeEntry, ...times.slice(i+1)];

		// positions 업데이트
		let newPositions = positions;
		if(isTimeChange) {
			const newPositionsEntry = [];
			positions[i].forEach(pos => {
				newPositionsEntry.push({...pos, time});
			});
			newPositions = [...positions.slice(0, i), newPositionsEntry, ...positions.slice(i+1)];
		}

		this.setState({ times: newTimes, positions: newPositions, selectedPosTime: time });
	}

	setScrollEnable = (scrollEnable) => {
		this.setState({ scrollEnable });
	}

	setDancerPosition = (did, newX, newY) => {
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

	setCurTime = (time) => {
		const { noteInfo: { musicLength }} = this.state;
		if(time < 0 || musicLength <= time)
			return;

		this.setState({ curTime: time });
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
			setDancerPosition,
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
				setDancerPosition={setDancerPosition}
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