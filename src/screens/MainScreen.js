import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList, LogBox
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import getStyleSheet from '../values/styles';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class MainScreen extends React.Component {
	state = {
		notes: []
	};

	getDatabaseData() {
		const { notes } = this.state;

		db.transaction(txn => {
			/*=== 기존 TABLE 초기화(for debug) ===*/
			// txn.executeSql('DROP TABLE IF EXISTS notes');
			// txn.executeSql('DROP TABLE IF EXISTS dancers');
			// txn.executeSql('DROP TABLE IF EXISTS times');
			// txn.executeSql('DROP TABLE IF EXISTS positions');

			txn.executeSql(
				'SELECT COUNT(*) FROM sqlite_master WHERE name = ?',
				["notes"],
				(txn, result) => {
					// DB 에 notes 테이블이 없는 경우 (앱 최초 실행),
					// default note 를 생성
					const countResult = result.rows.item(0)["COUNT(*)"];
					if(countResult == 0) {
						const title = 'Choreo Note에 오신걸 환영해요!';
						const createDate = this.getTodayDate();
						const stageRatio = 1;
						const music = 'sample.mp3';
						const musicLength = 60;
						const displayName = 0;

						notes.push({ nid: 0, title, createDate, editDate: createDate, music });
						this.setState({ notes });

						txn.executeSql(
							"INSERT INTO notes VALUES (0, ?, ?, ?, ?, ?, ?, ?)",
							[title, createDate, createDate, stageRatio, music, musicLength, displayName]);
						txn.executeSql(
							"INSERT INTO dancers VALUES (0, 0, 'ham', 0)", []);
			
						txn.executeSql(
							"INSERT INTO dancers VALUES (0, 1, 'Juicy', 1)", []);
			
						txn.executeSql(
							"INSERT INTO times VALUES (0, 0, 2)", []);

						txn.executeSql(
							"INSERT INTO times VALUES (0, 5, 3)", []);
			
						txn.executeSql(
							"INSERT INTO positions VALUES (0, 0, 0, -50, 0)", []);
			
						txn.executeSql(
							"INSERT INTO positions VALUES (0, 0, 1, 50, 0)", []);

						txn.executeSql(
							"INSERT INTO positions VALUES (0, 5, 0, 0, 50)", []);
			
						txn.executeSql(
							"INSERT INTO positions VALUES (0, 5, 1, 0, -50)", []);
					}
				}
			);

			/*=== TABLE 생성 ===*/
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

			// DB 에서 note 정보 가져오기
			txn.executeSql(
				"SELECT * FROM notes",
				[],
        (txn, result) => {
					// note 정보 가져오기
					for (let i = 0; i < result.rows.length; i++)
						notes.push(result.rows.item(i));
					this.setState({ notes });
				}
			);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	/* Date() 로 받은 값을 YYYY.MM.DD 포멧의 string 으로 변경 */
	getTodayDate() {
		const date = new Date();
		return `${date.getFullYear()}.` +
					 `${date.getMonth() < 9 ? '0' + (date.getMonth()+1) : date.getMonth()+1}.` +
					 `${date.getDate()}. ` +
					 `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
					 `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
	}

	addNote = () => {
		const { notes } = this.state;
		const nid = notes.length == 0 ? 0 : notes[notes.length-1].nid + 1;
		const title = '새 노트';
		const createDate = this.getTodayDate();
		const stageRatio = 2;
		const music = '';
		const musicLength = 60;
		const displayName = 0;

		notes.push({ nid, title, createDate, editDate: createDate, music });
		this.setState({ notes });
		
		// DB 함수는 동기성 함수이므로 미리 state 를 업데이트 한 후 실행해 주자
		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[nid, title, createDate, createDate, stageRatio, music, musicLength, displayName]);

			txn.executeSql(
				"INSERT INTO dancers VALUES (?, 0, 'ham', 0)",
				[nid]);

			txn.executeSql(
				"INSERT INTO dancers VALUES (?, 1, 'Juicy', 1)",
				[nid]);

			txn.executeSql(
				"INSERT INTO times VALUES (?, 0, 5)",
				[nid]);

			txn.executeSql(
				"INSERT INTO positions VALUES (?, 0, 0, -50, 0)",
				[nid]);

			txn.executeSql(
				"INSERT INTO positions VALUES (?, 0, 1, 50, 0)",
				[nid]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	componentDidMount() {
		this.getDatabaseData();
	}

	render() {
		const { notes } = this.state;
		const { getTodayDate } = this;
		const styles = getStyleSheet();

		return(
			// style of View: SafeArea 바깥 부분에도 배경색을 칠하기 위함
			// style of SafeAreaView: 자식들의 flex 적용을 위해 부모도 적용
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<Text numberOfLines={1} style={styles.toolbarTitle}>Choreo Note</Text>
					<TouchableOpacity onPress={this.addNote}>
						<Text style={styles.toolbarButton}>추가</Text>
					</TouchableOpacity>
				</View>

				{/* Note 리스트 */}
				<FlatList
				style={styles.noteList}
				data={notes}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item, index }) =>
					<View>
						<TouchableOpacity
						onPress={() => {
							this.props.navigation.navigate(item.music == '' ? 'EditNote' : 'Formation', { nid: item.nid, getTodayDate: getTodayDate });
						}}
						style={styles.noteEntry}>
							{/* <Text numberOfLines={1}>{item.nid}</Text> */}
							<Text numberOfLines={1} style={styles.noteTitle}>{item.title}</Text>
							<Text numberOfLines={1} style={styles.noteSubInfo}>수정일 {item.editDate}</Text>
						</TouchableOpacity>
					</View>
				} />

				{/* Footer (for debug) */}
				<View style={styles.toolbar}>
					<TouchableOpacity
					onPress={() => this.props.navigation.navigate('Database')}>
						<Text style={styles.toolbarButton}>DB</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
			</View>
		)
	}
}