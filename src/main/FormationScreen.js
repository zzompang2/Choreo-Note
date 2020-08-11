import React from 'react';
import {
	SafeAreaView,StyleSheet,ScrollView,View,Text,
} from 'react-native';
import Dancer from '../components/Dancer';

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
			allPosList: [],
			time: 0,
			musicLength: 200,
			animationPlayToggle: false,
		}
		this.dancerList=[];
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

	// splitIntoTime = () => {
	// 	if(this.state.allPosList.length == 0) return [];
	// 	var timeList = [];

	// }

	render() {
		console.log(this.TAG, "render");

		const dancerNum = this.state.allPosList.length;
		console.log("dancerNum: " + dancerNum);

		var dancers = [];
    for(let i=0; i<dancerNum; i++){
      dancers.push(
				<Dancer 
				number={i+1} 
				position={this.state.allPosList[i]} 
				// onSearchSubmit={this.onSearchSubmit} 
				curTime={this.state.time} 
				// toggle={this.state.animationPlayToggle}
				// elevation={100}
				/>
      )
		}

		var musicbox = [];
		for(let time=0; time<this.state.musicLength; time++){
			var checkPoint = [];
			for(let i=0; i<dancerNum; i++){
				// time에 체크한 포인트가 있는지 확인
				let j=0;
				for(; j<this.state.allPosList[i].length; j++){
					if(this.state.allPosList[i][j].time > time){
						checkPoint.push( <Text>/</Text> )
						break;
					}
					if(this.state.allPosList[i][j].time == time){
						checkPoint.push( <Text>*</Text> )
						break;
					}
				}
				if(j == this.state.allPosList[i].length)
					checkPoint.push( <Text>/</Text> )
			}
			musicbox.push(
				<View style={{margin: 2, backgroundColor: COLORS.yellow}}>
					<Text>{Math.round(time/60)}:{time%60}</Text>
					{checkPoint}
				</View>
			)
		}
		
		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1}}>
				<View style={{flex: 4, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center'}}>
					{dancers}
				</View>

				<ScrollView
				horizontal={true}
				style={{flex: 1}}>
					{musicbox}
				</ScrollView>
				{/* <FlatList
				horizontal={true}
				data={this.state.allPosList[1]}
				renderItem={({item, index}) => 
				<View style={{flexDirection: 'row', backgroundColor: COLORS.red}}>
					{() => {
						var texts = [];
						for(let i; i<2; i++){
							texts.push(
								<Text numberOfLines={1}>{item.posx}, </Text>
							)
						}
					}}
					<Text numberOfLines={1}>{item.posx}, </Text>
					<Text numberOfLines={1}>{item.posy}</Text>
				</View>
				}
				keyExtractor={(item, index) => index.toString()}
				style={{flex: 1, backgroundColor: COLORS.yellow}}
				/> */}
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
								console.log("posList: " + posList);
								if(i == dancerResult.rows.length-1){
									console.log("allPosList: " + _allPosList[0]);
									this.setState({allPosList: _allPosList});
								}
							}
						);
					}
					// console.log("dancer list: ", _dancerList);
					this.dancerList = _dancerList;
				}
			);
		});
	}
}