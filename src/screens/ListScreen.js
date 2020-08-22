import React from 'react';
import {
  SafeAreaView, FlatList, Text, StyleSheet, TouchableOpacity, View, TextInput,
} from 'react-native';

import SQLite from "react-native-sqlite-storage";
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });

export default class ListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteList: [],
		}
		this.TAG = "ListScreen/";

		db.transaction(txn => {
			txn.executeSql('DROP TABLE IF EXISTS note;', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS note(' +
					'nid INTEGER NOT NULL, ' +
					'title TEXT NOT NULL, ' +
					'date TEXT NOT NULL, ' +
					'music TEXT, ' +
					'PRIMARY KEY("nid") );',
				[]
			);
			txn.executeSql(
				'INSERT INTO note VALUES (0, "2016 가을 정기공연!!", "2016.01.01", "사람들이 움직이는 게");', []
			);

			txn.executeSql('DROP TABLE IF EXISTS dancer', []);
			txn.executeSql('DROP TABLE IF EXISTS position', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS dancer(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'name	TEXT, ' +
					'PRIMARY KEY(did, nid) );'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 0, "ham");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 1, "zzom");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 2, "jin");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 3, "gogo");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 4, "tuu");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 5, "aff");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 6, "qwe");'
			);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS position(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'posx INTEGER NOT NULL, ' +
					'posy INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, did, time) );'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 0, 0, 10, 10);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 0, 1, 20, 20);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 0, 5, 30, 30);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 1, 0, -30, -50);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 1, 6, -20, -40);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 1, 2, -10, -10);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 2, 0, 0, 50);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 3, 0, -100, -10);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 4, 0, -200, 0);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 5, 0, 300, -80);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 6, 0, -250, -10);'
			);
		})
	}

	addNote = () => {
		console.log(this.TAG, "addNote");

		const todayDate = new Date();
		db.transaction(txn => {
			txn.executeSql(
				'INSERT INTO note VALUES (?, "title", ?, "music");', 
				[this.state.noteList.length, todayDate.getFullYear() + "." + (todayDate.getMonth()+1) + "." + todayDate.getDate()],
				() => { this.updateNoteList(); }
			);
		});
	
	}

	changeName = (text, nid) => {
		console.log(this.TAG, "changeName: ", text + ", " + nid)

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

	render() {
		console.log(this.TAG, "render");

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
							<TouchableOpacity onPress={() => this.props.navigation.navigate('Formation', {noteId: item.nid})}>
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
		console.log(this.TAG, "componentDidMount");
		this.updateNoteList();
	}

	updateNoteList = () => {
		console.log(this.TAG, "updateNoteList");

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