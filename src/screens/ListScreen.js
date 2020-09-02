import React from 'react';
import {
  SafeAreaView, FlatList, Text, StyleSheet, TouchableOpacity, View, TextInput, Alert,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "ListScreen/";
const randomCouple = [
	['오작교 댄스', '견우', '직녀'],
	['콩팥', '콩쥐', '팥쥐'],
	['겨울왕국', '엘사', '안나'],
	['긴머리 휘날리며', '라푼젤', '파스칼'],
];
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];

class ListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteList: [],		// {nid, title, date, music, radiusLevel, coordinateLevel, alignWithCoordinate}
			isEditMode: false,
		}

		db.transaction(txn => {
			txn.executeSql('DROP TABLE IF EXISTS note;');
			txn.executeSql('DROP TABLE IF EXISTS dancer');
			txn.executeSql('DROP TABLE IF EXISTS position');

			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS note(' +
					'nid INTEGER NOT NULL, ' +
					'title TEXT NOT NULL, ' +
					'date TEXT NOT NULL, ' +
					'music TEXT NOT NULL, ' +
					'radiusLevel INTEGER NOT NULL, ' +
					'coordinateLevel INTEGER NOT NULL, ' +
					'alignWithCoordinate TINYINT(1) NOT NULL, ' +
					'PRIMARY KEY("nid") );'
			);

			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS dancer(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'name	TEXT NOT NULL, ' +
					'color INTEGER NOT NULL, ' +
					'PRIMARY KEY(did, nid) );'
			);

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
			// 	'INSERT INTO note VALUES (0, "2016 가을 정기공연!!", "2016.1.1", "사람들이 움직이는 게", 3, 3, 1);', []
			// );

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
		const randomColor = Math.floor(Math.random() * (dancerColor.length-1));

		console.log(TAG, "addNote", newNid, randomValue);

		db.transaction(txn => {
			txn.executeSql(
				'INSERT INTO note VALUES (?, ?, ?, "노래 없음", 3, 3, 1);', 
				[newNid, randomCouple[randomValue][0], this.dateFormat(new Date())],
				() => {this.updateNoteList();},
				() => {console.log('ERROR');}
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (?, 0, ?, ?);",
				[newNid, randomCouple[randomValue][1], randomColor]
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (?, 1, ?, ?);",
				[newNid, randomCouple[randomValue][2], randomColor+1]
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, 0, 0, -60, 0, 0);",
				[newNid],
				() => {console.log('success!');},
				(e) => {console.log('ERROR', e);}
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, 0, 2, -30, 0, 0);",
				[newNid],
				() => {console.log('success!');},
				(e) => {console.log('ERROR', e);}
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, 1, 0, 30, 0, 2);",
				[newNid],
				() => {console.log('success!');},
				(e) => {console.log('ERROR');}
			);
		});
	}

	deleteNote = (nid) => {
		console.log(TAG, "deleteNote", nid);

		Alert.alert(
			"경고", 
			"정말 삭제하시겠어요? 되돌릴 수 없습니다!",
			[
				{
					text: "예!",
					onPress: () => {
						this.state.db.transaction(txn => {
							txn.executeSql(
								"DELETE FROM note " +
								"WHERE nid=?;",
								[nid],
								() => {console.log('success!');},
								(e) => {console.log('ERROR1', e);}
							);
							txn.executeSql(
								"DELETE FROM position " +
								"WHERE nid=?;",
								[nid],
								() => {console.log('success!');},
								(e) => {console.log('ERROR2', e);}
							);

							txn.executeSql(
								"DELETE FROM dancer " +
								"WHERE nid=?;",
								[nid],
								() => {console.log('success!');},
								(e) => {console.log('ERROR3', e);}
							);

							txn.executeSql(
								"UPDATE note " +
								"SET nid=nid-1 " +
								"WHERE nid>?;",
								[nid],
								() => {console.log('success!');},
								() => {console.log('ERROR4', e);}
							);

							txn.executeSql(
								"UPDATE dancer " +
								"SET nid=nid-1 " +
								"WHERE nid>?;",
								[nid],
								() => {console.log('success!');},
								() => {console.log('ERROR5', e);}
							);

							txn.executeSql(
								"UPDATE position " +
								"SET nid=nid-1 " +
								"WHERE nid>?;",
								[nid],
								() => {console.log('success!');},
								() => {console.log('ERROR6', e);}
							);
						});

						let _noteList = [...this.state.noteList];
						_noteList.splice(nid, 1);
						for(let i=nid; i<_noteList.length; i++){
							_noteList[i].nid--;
						}
						this.setState({noteList: _noteList});
					},
				},
				{ text: "아니요, 안 할래요.", style: "cancel" }
			],
			{ cancelable: false }
		);
	}

	changeName = (text, nid) => {
		console.log(TAG, "changeName: ", text + ", " + nid)

		// text가 비어있는 경우

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

	listViewItemSeparator = () => <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>

	render() {
		console.log(TAG, "render");

		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
			
				<View style={styles.toolbar}>
					{!this.state.isEditMode ?
					<TouchableOpacity onPress={()=>{ this.setState({isEditMode: true}); }}>
						<Text style={{color: COLORS.white}}>편집</Text>
					</TouchableOpacity>
					:
					<TouchableOpacity onPress={()=>{ this.setState({isEditMode: false}); this.updateNoteList(); }}>
						<Text style={{color: COLORS.white}}>완료</Text>
					</TouchableOpacity>}

					<Text style={styles.toolbarTitle}>Choreo Note</Text>
					<TouchableOpacity onPress={()=>this.addNote()}>
						<IconIonicons name="create-outline" size={24} color={COLORS.white}/>
					</TouchableOpacity>
				</View>

				<View style={{flex: 1}}>
					<FlatList
					data={this.state.noteList}
					ItemSeparatorComponent={this.listViewItemSeparator}
					renderItem={({item, index}) => 
					<View style={styles.noteItem}>
						<TouchableOpacity style={{flex: 1}}
						onPress={()=>{
							!this.state.isEditMode &&
							this.props.navigation.navigate('Formation', {
								noteInfo: this.state.noteList[item.nid], 
								updateNoteList: this.updateNoteList
							});
						}}>
							<View style={styles.columnContainer}>
								{this.state.isEditMode ?
								<View style={{flexDirection: 'row'}}>
									<TextInput 
									numberOfLines={1}
									maxLength={30}
									style={[styles.title, styles.titleInput]}
									placeholder="제목을 입력해 주세요."
									onChangeTex
									onChangeText={text=>{this.changeName(text, item.nid)}}>
										{item.title}
									</TextInput>
								</View>
								:
								<Text
								numberOfLines={1} 
								maxLength={30}
								style={styles.title}
								onEndEditing={(e)=>this.changeName(e.nativeEvent.text, item.nid)}>
									{item.title}
								</Text>
								}
								<View style={styles.rowContainer}>
									<IconIonicons name="calendar" size={15} color={COLORS.grayMiddle}/>
									<Text numberOfLines={1} style={styles.date}> {item.date}</Text>
									<IconIonicons name="musical-notes" size={15} color={COLORS.grayMiddle}/>
									<Text numberOfLines={1} style={styles.music}> {item.music}</Text>
								</View>
							</View>
						</TouchableOpacity>
						{ !this.state.isEditMode ?
						<View/>
						:
						<TouchableOpacity onPress={()=>{this.deleteNote(item.nid)}}>
							<IconIonicons name="trash-outline" size={30} color={COLORS.grayMiddle} style={{paddingStart: 10}}/>
						</TouchableOpacity>
						}
					</View>
					}
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

		let _noteList = [];

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM note",
        [],
        (tx, result) => {
					for (let i = 0; i < result.rows.length; i++) {
						console.log("item:", result.rows.item(i));
						_noteList.push(result.rows.item(i));
					}		
					this.setState({noteList: _noteList})
				}
			);
		});
	}
}

const styles = StyleSheet.create({
	toolbar: {
		width:'100%', 
		height:50, 
		flexDirection: 'row', 
		backgroundColor:COLORS.purple, 
		alignItems: 'center', 
		justifyContent: 'space-between', 
		paddingHorizontal: 20,
	},
	toolbarTitle: {
		color:COLORS.white, 
		fontSize: 15,
	},
	noteItem: {
		flex: 1,
		height: 65,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 15,
    marginRight: 15,
	},
	list: {
		flex: 1,
	},
	columnContainer: {
    flexDirection:'column',
		flex: 1,
		justifyContent: 'space-between',
	},
	rowContainer: {
		flexDirection:'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	title: {
		flex: 1,
		color: COLORS.blackDark,
		fontSize: 18,
		marginTop: 5,
		paddingVertical: 5,
    //fontFamily: FONTS.binggrae2,
	},
	titleInput: {
		backgroundColor: COLORS.grayLight,
		paddingHorizontal: 7,
		borderRadius: 10,
		borderColor: COLORS.grayMiddle,
		borderWidth: 1,
	},
	date: {
		width: 70,
    color: COLORS.grayMiddle, 
		fontSize:12,
    //fontFamily: FONTS.binggrae2,
  },
  music: {
    color: COLORS.grayMiddle, 
    fontSize:12,
    //fontFamily: FONTS.binggrae2,
  },
})

// connect 이용해서 reducer와 연결해준다.
export default ListScreen;