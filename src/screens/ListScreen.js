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

export default class ListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			noteList: [],		// {nid, title, date, music, radiusLevel, coordinateLevel, alignWithCoordinate, stageRatio}
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
				'musicLength INTEGER NOT NULL, ' +
				'bpm INTEGER NOT NULL, ' +
				'sync REAL NOT NULL, ' +
				'beatUnit INTEGER NOT NULL, ' +
				'radiusLevel INTEGER NOT NULL, ' +
				'coordinateLevel INTEGER NOT NULL, ' +
				'alignWithCoordinate TINYINT(1) NOT NULL, ' +
				'stageWidth INTEGER NOT NULL, ' +
				'stageHeight INTEGER NOT NULL, ' +
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
					'beat INTEGER NOT NULL, ' +
					'posx INTEGER NOT NULL, ' +
					'posy INTEGER NOT NULL, ' +
					'duration INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, did, beat) );'
			);

			// 앱을 시작할 때 노트가 하나도 없다면 test note를 만든다.
			txn.executeSql(
				"SELECT * FROM note", 
				[],
        (txn, result) => {
					if(result.rows.length == 0)
						this.addTestNote();
				}
			);

			// table 정보 검색
			// txn.executeSql( "SELECT * FROM sqlite_master",);	// {name, sql, type, ...}
		})
	}

	dateFormat(date) { return date.getFullYear() + "." + (date.getMonth()+1) + "." + date.getDate(); }

	addTestNote = () => {
		console.log(TAG, "addTestNote");
		const randomColor = Math.floor(Math.random() * (dancerColor.length-1));

		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO note VALUES (0, 'Choreo Note에 오신걸 환영해요!', ?, 'Sample.mp3', 305, 90, 0, 4, 3, 3, 1, 1200, 600);", 
				[this.dateFormat(new Date())],
				this.setNoteList,
				(e) => {console.log('ERROR:', e);}
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (0, 0, ?, ?);",
				['심청이', 0]
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (0, 1, ?, ?);",
				['콩쥐', 1]
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (0, 2, ?, ?);",
				['흥부', 1]
			);
			txn.executeSql(
				"INSERT INTO dancer VALUES (0, 3, ?, ?);",
				['홍길동', 2]
			);

			txn.executeSql("INSERT INTO position VALUES (0, 0, 1, -180, 60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 8, 0, 60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 13, 0, -30, 4);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 21, 0, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 28, 0, -60, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 31, 0, -30, 5);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 37, 0, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 42, 60, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 46, 0, 35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 49, -35, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 50, 0, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 51, 35, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 52, 0, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 53, -35, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 54, -35, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 58, -70, -35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 59, -35, -35, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 62, -35, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 65, -70, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 69, -35, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 74, -70, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 76, 0, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 77, 35, 35, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 82, 17, 35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 0, 86, 17, 0, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 17, -180, 60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 21, -60, 60, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 28, -60, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 32, -30, 0, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 33, -60, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 40, -60, -60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 42, -60, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 46, 0, 0, 4);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 51, -35, 0, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 52, 0, 0, 4);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 58, 0, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 59, 0, 70, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 60, 0, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 62, 0, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 65, -35, 35, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 67, 0, 70, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 69, 0, 35, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 74, 35, 70, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 76, 35, 0, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 78, 35, -35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 82, 70, -35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 1, 86, 52, -1, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 17, 180, 60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 21, 60, 60, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 28, 60, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 32, 30, 0, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 33, 60, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 40, 60, -60, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 42, 0, -60, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 46, 0, -35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 49, 35, -35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 50, 0, -35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 53, 35, -35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 54, 35, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 58, 70, -35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 59, 35, -35, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 62, 35, 0, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 65, 70, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 69, 35, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 74, 70, -35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 76, 0, -35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 79, -35, -35, 1);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 82, -18, -37, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 2, 86, -18, -1, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 64, 0, 70, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 68, 0, -35, 4);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 74, -35, -70, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 76, -35, 0, 3);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 80, -35, 35, 0);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 82, -70, 35, 2);");
			txn.executeSql("INSERT INTO position VALUES (0, 3, 86, -52, -1, 0);");
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
						db.transaction(txn => {
							txn.executeSql(
								"DELETE FROM note " +
								"WHERE nid=?;",
								[nid],
								() => {
									txn.executeSql(
										"UPDATE note " +
										"SET nid=nid-1 " +
										"WHERE nid>?;",
										[nid],
										() => {console.log('success!');},
										() => {console.log('ERROR4', e);}
									);
								},
								(e) => {console.log('ERROR1', e);}
							);

							txn.executeSql(
								"DELETE FROM position " +
								"WHERE nid=?;",
								[nid],
								() => {
									txn.executeSql(
										"UPDATE position " +
										"SET nid=nid-1 " +
										"WHERE nid>?;",
										[nid],
										() => {console.log('success!');},
										() => {console.log('ERROR6', e);}
									);
								},
								(e) => {console.log('ERROR2', e);}
							);

							txn.executeSql(
								"DELETE FROM dancer " +
								"WHERE nid=?;",
								[nid],
								() => {
									txn.executeSql(
										"UPDATE dancer " +
										"SET nid=nid-1 " +
										"WHERE nid>?;",
										[nid],
										() => {console.log('success!');},
										() => {console.log('ERROR5', e);}
									);
								},
								(e) => {console.log('ERROR3', e);}
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
		db.transaction(txn => {
      txn.executeSql(
				"UPDATE note " +
				"SET title=? " +
				"WHERE nid=?;",
				[text, nid],
			);
		});
	}

	setNoteList = () => {
		console.log(TAG, "setNoteList");

		let _noteList = [];

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM note",
        [],
        (tx, result) => {
					for (let i = 0; i < result.rows.length; i++)
						_noteList.push(result.rows.item(i));
					
					this.setState({noteList: _noteList});
				}
			);
		});
		return true;
	}

	updateNoteList = (noteInfo) => {
		console.log(TAG, "updateNoteList");
		let _noteList = [...this.state.noteList];

		if(noteInfo.nid == _noteList){
			_noteList.push(noteInfo);
		}
		else{
			_noteList[noteInfo.nid] = {...noteInfo};
		}
		this.setState({noteList: _noteList});
	}

	listViewItemSeparator = () => <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>

	render() {
		console.log(TAG, "render");

		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
			
				<View style={styles.toolbar}>
					{!this.state.isEditMode ?
					<TouchableOpacity style={styles.toolbarButton} onPress={()=>{ this.setState({isEditMode: true}); }}>
						<Text style={styles.buttonText}>편집</Text>
					</TouchableOpacity>
					:
					<TouchableOpacity style={styles.toolbarButton} onPress={()=>{ this.setState({isEditMode: false}); this.setNoteList(); }}>
						<Text style={styles.buttonText}>완료</Text>
					</TouchableOpacity>}

					<Text style={styles.toolbarTitle}>Choreo Note</Text>
					<TouchableOpacity style={styles.toolbarButton} onPress={()=>{
						!this.state.isEditMode &&
						this.props.navigation.navigate('MakeNote1', {nid: this.state.noteList.length, date: this.dateFormat(new Date()), updateNoteList: this.updateNoteList});
					}}>
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
									<Text numberOfLines={1} style={styles.music}> {item.music == '' ? '노래 없음' : item.music}</Text>
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
		this.setNoteList();
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
		// paddingHorizontal: 20,
	},
	toolbarTitle: {
		color:COLORS.white, 
		fontSize: 15,
		fontFamily: FONTS.binggrae,
	},
	toolbarButton: {
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
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
    // fontFamily: FONTS.binggrae_bold,
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
	buttonText: {
		color: COLORS.white,
	}
})