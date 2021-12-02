import React, { useEffect, useState } from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList, LogBox, Alert
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import NoteItem from '../components/NoteItem';
import getStyleSheet, { COLORS } from '../values/styles';
import Svg, {Rect, SvgUri} from 'react-native-svg';
import Add from '../assets/icons/X_large(48)/Add';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const TAG = 'MainScreen/';
const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });
const styles = getStyleSheet();

export default function MainScreen(props) {
	const [ notes, setNotes ] = useState([]);
	const [ positionsForEachNote, setPositionsForEachNote ] = useState([]);
	const [ dancersForEachNote, setDancersForEachNote ] = useState([]);
	const [ isEditMode, setEditMode ] = useState(false);

	function getDatabaseData() {
		db.transaction(txn => {
			/*=== 기존 TABLE 초기화(for debug) ===*/
			// txn.executeSql('DROP TABLE IF EXISTS metadata');
			// txn.executeSql('DROP TABLE IF EXISTS notes');
			// txn.executeSql('DROP TABLE IF EXISTS dancers');
			// txn.executeSql('DROP TABLE IF EXISTS times');
			// txn.executeSql('DROP TABLE IF EXISTS positions');

			/*=== TABLE 생성 ===*/
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS metadata(' +
				'id INTEGER NOT NULL, ' +
				'nidMax INTEGER NOT NULL, ' +
				'PRIMARY KEY(id))'
			);

			txn.executeSql(
				"SELECT * FROM metadata WHERE id=0", [],
				(txn, result) => {				
					if(result.rows.length == 0)
					txn.executeSql("INSERT INTO metadata VALUES (0, 0)", []);
				}
			);


			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS notes(' +
				'nid INTEGER NOT NULL, ' +
				'title TEXT NOT NULL, ' +
				'createDate TEXT NOT NULL, ' +
				'editDate TEXT NOT NULL, ' +
				'stageRatio INTEGER NOT NULL, ' +		// (가로 / 세로)
				'music TEXT NOT NULL, ' +
				'musicLength INTEGER NOT NULL, ' +
				'displayName INTEGER NOT NULL, ' +	// (0: did, 1: name)
				'PRIMARY KEY(nid))'
			);

			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS dancers(' +
				'nid INTEGER NOT NULL, ' +
				'did INTEGER NOT NULL, ' +
				'name	TEXT NOT NULL, ' +
				'color INTEGER NOT NULL, ' +
				'PRIMARY KEY(nid, did))'
			);

			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS times(' +
					'nid INTEGER NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'duration INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, time))'
			);

			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS positions(' +
					'nid INTEGER NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'x INTEGER NOT NULL, ' +
					'y INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, time, did))'
			);

			txn.executeSql(
				"SELECT * FROM notes",
				[],
				(txn, result) => {
					// note 정보 가져오기
					const newNote = [];
					for (let i = 0; i < result.rows.length; i++)
					newNote.push(result.rows.item(i));

					if(newNote.length !== 0)
					txn.executeSql(
						"SELECT * FROM positions",
						[],
						(txn, result) => {
							const positionsForEachNote = [];
							const positions = [];
							for (let i = 0; i < result.rows.length; i++)
							positions.push(result.rows.item(i));

							for(let noteIdx = 0; noteIdx < newNote.length; noteIdx++) {
								const nid = newNote[noteIdx].nid;
								const positionOfFirstFormation = [];
								let i = 0;
								// nid 노트의 맨 앞 position 요소 찾기
								while(positions[i].nid !== nid)
								i++;

								const firstTime = positions[i].time;

								for(; i < positions.length && positions[i].nid == nid; i++) {
									if(positions[i].time == firstTime)
									positionOfFirstFormation.push(positions[i]);
								}
								positionsForEachNote.push(positionOfFirstFormation);
							}
							txn.executeSql(
								"SELECT * FROM dancers",
								[],
								(txn, result) => {
									const dancersForEachNote = [];
									let dancersOfOneNote = [result.rows.item(0)];
									for (let i = 1; i < result.rows.length; i++) {
										if(result.rows.item(i).nid !== result.rows.item(i-1).nid) {
											dancersForEachNote.push(dancersOfOneNote);
											dancersOfOneNote = [];
										}
										dancersOfOneNote.push(result.rows.item(i));
									}
									dancersForEachNote.push(dancersOfOneNote);

									dancersForEachNote.reverse();
									setDancersForEachNote(dancersForEachNote);
									positionsForEachNote.reverse();
									setPositionsForEachNote(positionsForEachNote);
									newNote.reverse();
									setNotes(newNote);
								}
							);
						}
					)
				}
			);
		},
		e => console.log("DB ERROR", e),
		() => console.log("getDatabaseData/ DB SUCCESS"));
	}

	/* Date() 로 받은 값을 YYYY.MM.DD 포멧의 string 으로 변경 */
	function getTodayDate() {
		const date = new Date();
		return `${date.getFullYear()}.` +
					 `${date.getMonth() < 9 ? '0' + (date.getMonth()+1) : date.getMonth()+1}.` +
					 `${date.getDate()}. ` +
					 `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
					 `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
	}

	function addNote() {
		console.log(TAG, 'addNote');
		db.transaction(txn => {
			txn.executeSql(
				"SELECT * FROM metadata", [],
				(txn, result) => {
					const nid = result.rows.item(0).nidMax;

					console.log(TAG, "새로운 NOTE ID = " + nid);

					props.navigation.navigate('EditNote', {
						nid: nid,
						getTodayDate: getTodayDate,
						getDatabaseData: getDatabaseData });
				},
				e => console.log("DB ERROR", e),
				() => console.log("addNote/ DB SUCCESS"));
			},
			e => console.log("DB ERROR", e),
		() => console.log("addNote/ DB SUCCESS")
		);
	}

	// function updateMainStateFromDB(nid) {
	// 	db.transaction(txn => {
  //     txn.executeSql(
	// 			"SELECT * FROM notes WHERE nid = ?",
	// 			[nid],
  //       (txn, result) => {
	// 				const noteInfo = result.rows.item(0);
	// 				for(let i=0; i<notes.length; i++) {
	// 					if(notes[i].nid == nid) {
	// 						const newNotes = [...notes.slice(0, i), noteInfo, ...notes.slice(i+1)];
	// 						setNotes(newNotes);
	// 					}
	// 				}
	// 			}
	// 		);
	// 	},
	// 	e => console.log("DB ERROR", e),
	// 	() => console.log("updateMainStateFromDB/ DB SUCCESS"));
	// }

	function onPressHandler(nid) {
		if(isEditMode)
		deleteNote(nid);
		else
		props.navigation.navigate('Formation', {
			nid: nid,
			getTodayDate,
			getDatabaseData: getDatabaseData });
	}

	function deleteNote(nid) {
		let idx;

		for(let i=0; i<notes.length; i++)
		if(notes[i].nid == nid)
		idx = i;

		Alert.alert("노트 삭제", "\"" + notes[idx].title + "\" 노트를 정말 삭제하시겠어요?",
		[{text: "아니요", style: 'cancel'}, {
			text: "네, 삭제할게요", style: 'destructive',
			onPress: () => {
				const newNotes = [...notes.slice(0, idx), ...notes.slice(idx+1)];
				setNotes(newNotes);
				const newPositionsForEachNote = [...positionsForEachNote.slice(0, idx), ...positionsForEachNote.slice(idx+1)];
				setPositionsForEachNote(newPositionsForEachNote);

				db.transaction(txn => {
					txn.executeSql("DELETE FROM notes WHERE nid=?", [nid]);
					txn.executeSql("DELETE FROM dancers WHERE nid=?", [nid]);
					txn.executeSql("DELETE FROM times WHERE nid=?", [nid]);
					txn.executeSql("DELETE FROM positions WHERE nid=?", [nid]);
				},
				e => console.log("DB ERROR", e),
				() => console.log("deleteNote/ DB SUCCESS"));
			},
		}]);
	}

	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	useEffect(() => {
		console.log("useEffect");
		getDatabaseData();
	}, [])

	// DB 에서 note 정보 가져오기
	function updateNoteList() {
		db.transaction(txn => {
			txn.executeSql(
				"SELECT * FROM notes",
				[],
				(txn, result) => {
					// note 정보 가져오기
					const newNote = [];
					for (let i = 0; i < result.rows.length; i++)
					newNote.push(result.rows.item(i));

					if(newNote.length !== 0)
					txn.executeSql(
						"SELECT * FROM positions",
						[],
						(txn, result) => {
							const newPositions = [];
							for(let noteIdx = 0; noteIdx < newNote.length; noteIdx++) {
								const position = [];
								let i = 0;
								while(result.rows.item(i).nid !== newNote[noteIdx].nid)
								i++;
								const firstTime = result.rows.item(i).time;

								for(; i < result.rows.length; i++) {
									if(result.rows.item(i).nid == newNote[noteIdx].nid && result.rows.item(i).time == firstTime)
									position.push(result.rows.item(i));
									else break;
								}
								newPositions.push(position);
							}
							console.log(newPositions);
							setPositions(newPositions);
							newNote.reverse();
							setNotes(newNote);
						}
					)
				}
			);
		});
	}

	return(
		// style of View: SafeArea 바깥 부분에도 배경색을 칠하기 위함
		// style of SafeAreaView: 자식들의 flex 적용을 위해 부모도 적용
		<View style={styles.bg}>
		<SafeAreaView style={styles.bg}>
			{/* Tool Bar */}
			<View style={styles.navigationBar}>
				<Text numberOfLines={1} style={{...styles.navigationBar__title, paddingLeft: 12}}>Choreo Note</Text>
				<TouchableOpacity 
				style={{height: '100%', justifyContent: 'center'}}
				activeOpacity={.8}
				onPress={()=>setEditMode(!isEditMode)}>
					<Text style={styles.navigationBarText}>{isEditMode ? "취소" : "편집"}</Text>
				</TouchableOpacity>
			</View>

			{listViewItemSeparator()}

			{/* Note 리스트 */}
			<FlatList
			style={styles.noteList}
			data={[[], ...notes]}
			keyExtractor={(item, idx) => idx.toString()}
			numColumns={2}
			showsVerticalScrollIndicator={false}
			renderItem={({ item, index }) =>
			index  == 0 ?
			<TouchableOpacity
			activeOpacity={.8}
			onPress={addNote}
			style={styles.noteEntry}>
				<View style={{...styles.noteThumbnail, backgroundColor: COLORS.container_20}}>
					<Add color={COLORS.container_40}/>
				</View>
			</TouchableOpacity>
			:
			<NoteItem
			key={index}
			noteInfo={item}
			position={positionsForEachNote[index-1]}
			dancer={dancersForEachNote[index-1]}
			onPressHandler={onPressHandler}
			isEditMode={isEditMode} />
			} />

			{listViewItemSeparator()}

			{/* Footer (for debug) */}
			{/* <View style={[styles.navigationBar, {height: 50}]}>

				<TouchableOpacity
				activeOpacity={.8}
				onPress={() => props.navigation.navigate('Database')}>
					<Text style={styles.navigationBarText}>DB</Text>
				</TouchableOpacity>
			</View> */}
		</SafeAreaView>
		</View>
	)
}