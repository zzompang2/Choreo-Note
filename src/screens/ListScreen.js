import React from 'react';
import {
  SafeAreaView, Text, TouchableOpacity, FlatList, View
} from 'react-native';
import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class ListScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			noteList: []
		};

		this.getDatabaseData();
	}

	getDatabaseData() {
		const { noteList } = this.state;

		db.transaction(txn => {
			/*=== 기존 table 초기화 ===*/
			txn.executeSql('DROP TABLE IF EXISTS note');

			// table 없으면 생성
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS note(' +
				'nid INTEGER NOT NULL, ' +
				'title TEXT NOT NULL, ' +
				'date TEXT NOT NULL, ' +
				'PRIMARY KEY("nid") );'
			);

			// DB 에서 note 정보 가져오기
			txn.executeSql(
				"SELECT * FROM note", 
				[],
        (txn, result) => {
					// 노트가 없는 경우: default note 추가
					if(result.rows.length == 0) {
						const title = 'Choreo Note에 오신걸 환영해요!';
						const date = this.dateFormat(new Date());

						txn.executeSql(
							"INSERT INTO note VALUES (0, ?, ?);",
							[title, date],
							() => {
								noteList.push({ nid: 0, title, date });
								this.setState({ noteList });
							}
						);
					}
					// note 정보 가져오기
					else {
						for (let i = 0; i < result.rows.length; i++)
							noteList.push(result.rows.item(i));
						this.setState({ noteList });
					}
				}
			);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	/* Date() 로 받은 값을 YYYY.MM.DD 포멧의 string 으로 변경 */
	dateFormat(date) {
		return date.getFullYear() + "." + 
					(date.getMonth() < 9 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + 
					"." + date.getDate();
	}

	addNote = () => {
		const { noteList } = this.state;
		const nid = noteList[noteList.length-1].nid + 1;
		const title = '새 노트';
		const date = this.dateFormat(new Date());

		noteList.push({ nid, title, date });
		this.setState({ noteList });
		
		// DB 함수는 동기성 함수이므로 미리 state 를 업데이트 한 후 실행해 주자
		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO note VALUES (?, ?, ?);",
				[nid, title, date]);
		});
	}

	render() {
		const { noteList } = this.state;

		return(
			<SafeAreaView>
				<Text>ListScreen</Text>
				<TouchableOpacity
				onPress={() => {
					this.props.navigation.navigate('Formation');
				}}>
					<Text>go to FormationScreen</Text>
				</TouchableOpacity>

				<TouchableOpacity
				onPress={this.addNote}>
					<Text>add note</Text>
				</TouchableOpacity>

				<FlatList
				data={noteList}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item }) =>
					<View style={{flexDirection: 'row'}}>
						<Text numberOfLines={1}>{item.nid}</Text>
						<Text numberOfLines={1}>{item.title}</Text>
						<Text numberOfLines={1}>{item.date}</Text>
					</View>
				} />
			</SafeAreaView>
		)
	}
}