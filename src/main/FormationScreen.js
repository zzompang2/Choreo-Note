import React from 'react';
import {
	SafeAreaView,StyleSheet,ScrollView,View,Text,StatusBar,FlatList,Image,TouchableOpacity,Dimensions,Alert, ImageBackground
} from 'react-native';

import SQLite from "react-native-sqlite-storage";
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteId: props.route.params.noteId,
			dancerList: [],
			allPosList: [[]],
			time: 0,
			animationPlayToggle: false,
		}
		this.TAG = "FormationScreen/";

		db.transaction(txn => {
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
				'CREATE TABLE IF NOT EXISTS position(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					// 'name TEXT NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'posx INTEGER NOT NULL, ' +
					'posy INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, did, time) );'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 0, 2, 0, 0);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 0, 0, 10, 0);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 1, 0, 0, 0);'
			);
			txn.executeSql(
				'INSERT INTO position VALUES (0, 1, 1, 0, 10);'
			);
		})
	}

	// 자식 컴포넌트(Draggable)에서 값 받아오기
  onSearchSubmit = (index, _x, _y) => {
    console.log(this.TAG + "onSearchSubmit");

    console.log(this.TAG + "놓은 위치: " + Math.round(_x) + ", " + Math.round(_y));
    this.pos = {x: _x, y: _y};
    this._addPosition(index, _x, _y);
    //this.setState({pos: {x: Math.round(_x), y: Math.round(_y)}});
  }

	render() {
		console.log(this.TAG, "render");

		return(
			<SafeAreaView>
				<FlatList
				data={this.state.allPosList[1]}
				renderItem={({item, index}) => 
				<View style={{flexDirection: 'row'}}>
					<Text numberOfLines={1}>{item.posx}, </Text>
					<Text numberOfLines={1}>{item.posy}</Text>
				</View>
				}
				keyExtractor={(item, index) => index.toString()}
				/>
			</SafeAreaView>
		)
	}

	componentDidMount() {
		console.log(this.TAG, "componentDidMount");
		var _allPosList = [];
		var _dancerList = [];

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT DISTINCT d.did, d.name " +
				"FROM position AS p, dancer AS d " +
				"WHERE p.nid=? " +
				"AND p.nid=d.nid " +
				"AND p.did=d.did;",
        [this.state.noteId],
        (tx, dancerResult) => {
					console.log("#dancer:", dancerResult.rows.length);

					for (let i = 0; i < dancerResult.rows.length; i++) {
						_dancerList.push(dancerResult.rows.item(i));
						tx.executeSql(
							"SELECT time, posx, posy FROM position WHERE nid=? AND did=? ORDER BY time",
        			[this.state.noteId, _dancerList[i].did],
        			(txn, posResult) => {
								var posList = [];
								// console.log("posRes length:", posResult.rows.length);
								for (let j = 0; j < posResult.rows.length; j++) {
									// console.log("dancer:", posResult.rows.item(j));
									posList.push(posResult.rows.item(j));
								}
								_allPosList.push(posList);
								if(i == dancerResult.rows.length-1){
									this.setState({allPosList: _allPosList})
								}
							}
						);
					}
					// console.log("dancer list: ", _dancerList);
					this.setState({dancerList: _dancerList});
				}
			);
		});
	}
}