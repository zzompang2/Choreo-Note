import React from 'react';
import {
  SafeAreaView, FlatList, Text, StyleSheet, TouchableOpacity, View, TextInput,
} from 'react-native';

import SQLite from "react-native-sqlite-storage";
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "ListScreen/";
const randomCouple = [
	['오작교 댄스', '견우', '직녀'],
	['콩팥', '콩쥐', '팥쥐'],
	['겨울왕국', '엘사', '안나'],
	['긴머리 휘날리며', '라푼젤', '파스칼'],
]

class ListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteList: [],
		}

		db.transaction(txn => {
			// txn.executeSql('DROP TABLE IF EXISTS note;', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS note(' +
					'nid INTEGER NOT NULL, ' +
					'title TEXT NOT NULL, ' +
					'date TEXT NOT NULL, ' +
					'music TEXT NOT NULL, ' +
					'coordinateLevel INTEGER NOT NULL, ' +
					'radiusLevel INTEGER NOT NULL, ' +
					'PRIMARY KEY("nid") );',
				[]
			);

			// txn.executeSql(
			// 	'INSERT INTO note VALUES (0, "2016 가을 정기공연", "2016.01.01", "사람들이 움직이는 게", 3, 3);', []
			// );

			// txn.executeSql('DROP TABLE IF EXISTS dancer', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS dancer(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'name	TEXT NOT NULL, ' +
					'PRIMARY KEY(did, nid) );'
			);
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 0, "ham");'
			// );
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 1, "zzom");'
			// );
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 2, "jin");'
			// );
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 3, "gogo");'
			// );
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 4, "tuu");'
			// );
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (0, 5, "aff");'
			// );

			// txn.executeSql('DROP TABLE IF EXISTS position', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS position(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'posx INTEGER NOT NULL, ' +
					'posy INTEGER NOT NULL, ' +
					'duration INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, did, time) );'
			);
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 0, 0, -160, -100, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 1, 0, -160, -60, 1);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 2, 0, -160, -20, 2);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 3, 0, -160, 20, 3);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 4, 0, -160, 60, 4);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 5, 0, -160, 100, 5);'
			// );

			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 0, 10, 160, -100, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 1, 10, 160, -60, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 2, 10, 160, -20, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 3, 10, 160, 20, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 4, 10, 160, 60, 0);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 5, 10, 160, 100, 0);'
			// );
		})
	}

	dateFormat(date) {
		return date.getFullYear() + "." + (date.getMonth()+1) + "." + date.getDate();
	}

	addNote = () => {
		const newNid = this.state.noteList.length;
		const randomValue = Math.floor(Math.random() * randomCouple.length);

		console.log(TAG, "addNote", newNid, randomValue);

		db.transaction(txn => {
			txn.executeSql(
				'INSERT INTO note VALUES (?, ?, ?, "music", 3, 3);', 
				[newNid, randomCouple[randomValue][0], this.dateFormat(new Date())],
				() => {this.updateNoteList();},
				() => {console.log('ERROR');}
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (?, 0, ?);",
				[newNid, randomCouple[randomValue][1]]
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (?, 1, ?);",
				[newNid, randomCouple[randomValue][2]]
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, 0, 0, -30, 0, 0);",
				[newNid],
				() => {console.log('success!');},
				(e) => {console.log('ERROR', e);}
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, 1, 0, 30, 0, 0);",
				[newNid],
				() => {console.log('success!');},
				(e) => {console.log('ERROR');}
			);
		});
	}

	changeName = (text, nid) => {
		console.log(TAG, "changeName: ", text + ", " + nid)

		// SQLite DB에서 업데이트
		this.state.db.transaction(txn => {
      txn.executeSql(
				"UPDATE note " +
				"SET title=? " +
				"WHERE nid=?;",
				[text, nid],
			);
		});
	}

	moveToFormationScreen = (nid) => {
		console.log(TAG, 'moveToFormationScreen');

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT coordinateLevel, radiusLevel "+
				"FROM note "+
				"WHERE nid=?",
				[nid],
				(txn, res) => {
					console.log(res.rows.item(0));
					return this.props.navigation.navigate('Formation', {noteId: nid, coordinateLevel: res.rows.item(0).coordinateLevel, radiusLevel: res.rows.item(0).radiusLevel});
			});
		});
	}

	render() {
		console.log(TAG, "render");

		return(
			<SafeAreaView style={{flex: 1}}>
			
				<View style={{width:'100%', height:50, flexDirection: 'row', backgroundColor:COLORS.purple, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingHorizontal: 30}}>
					<Text></Text>
					<Text style={{color:COLORS.white, fontSize: 15,}}>Choreo Note</Text>
					<TouchableOpacity onPress={()=>this.addNote()}>
						<Text style={{color:COLORS.white, fontSize: 13, padding: 5}}>추가</Text>
					</TouchableOpacity>
				</View>

				<View style={{flex: 1}}>
					<FlatList
					data={this.state.noteList}
					renderItem={({item, index}) => {
						return(
							<TouchableOpacity onPress={()=>this.moveToFormationScreen(item.nid)}>
								<View style={styles.rowContainer}>
									<TextInput 
									numberOfLines={1} 
									maxLength={30}
									style={styles.title}
									onEndEditing={(e)=>this.changeName(e.nativeEvent.text, item.nid)}>
										{item.title}
									</TextInput>
									<View style={styles.columnContainer}>
										<TextInput numberOfLines={1} style={styles.music}>{item.music}</TextInput>
										<Text numberOfLines={1} style={styles.date}>{item.date}</Text>
									</View>
								</View>
							</TouchableOpacity>
						)
					}}
					keyExtractor={(item, index) => index.toString()}
					style={styles.list}
					/>
				</View>
			</SafeAreaView>
		)
	}

	componentDidMount() {
		console.log(TAG, "componentDidMount");
		this.updateNoteList();
	}

	updateNoteList = () => {
		console.log(TAG, "updateNoteList");

		var temp = [];

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM note",
        [],
        (tx, result) => {
          // console.log('length: ', result.rows.length);
					for (let i = 0; i < result.rows.length; i++) {
						console.log("item:", result.rows.item(i));
						temp.push(result.rows.item(i));
					}		
					this.setState({noteList: temp})
				}
			);
		});
	}
}

const styles = StyleSheet.create({
	list: {
		backgroundColor: COLORS.grayLight,
	},
	rowContainer: {
    flexDirection:'row',
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 15,
    marginRight: 15,
    padding: 9,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.grayMiddle,
	},
	columnContainer: {
    flexDirection:'column',
    alignItems: 'flex-end',
	},
	title: {
    color: COLORS.blackDark, 
		fontSize:18,
		paddingRight: 10,
		// backgroundColor: COLORS.yellow,
    //fontFamily: FONTS.binggrae2,
  },
  music: {
    color: COLORS.red, 
    fontSize:12,
    paddingLeft: 10,
    textAlign: 'right',
    //fontFamily: FONTS.binggrae2,
  },
  date: {
    color: COLORS.grayDark, 
    fontSize:12,
    paddingLeft: 10,
    //fontFamily: FONTS.binggrae2,
  },
})

// connect 이용해서 reducer와 연결해준다.
export default ListScreen;