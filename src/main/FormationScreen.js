import React from 'react';
import {
	SafeAreaView,StyleSheet,ScrollView,View,Text,Dimensions,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import Slider from 'react-native-slider';

// custom library
import Dancer from '../components/Dancer';
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });

// 화면의 가로, 세로 길이 받아오기
const {width,height} = Dimensions.get('window');

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
		this.scrollView;
		this.scrollViewStyle;
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
				'INSERT INTO dancer VALUES (0, 2, "jin");'
			);
			txn.executeSql(
				'INSERT INTO dancer VALUES (0, 3, "gogo");'
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
						checkPoint.push( <Text style={{height: 20}}></Text> )
						break;
					}
					if(this.state.allPosList[i][j].time == time){
						checkPoint.push( <Text style={{height: 20}}>*</Text> )
						break;
					}
				}
				if(j == this.state.allPosList[i].length)
					checkPoint.push( <Text style={{height: 20}}></Text> )
			}

			// 현재 시간에 대응하는 box 색칠하기
			var musicboxStyle = [styles.musicbox];
			if(time == Math.round(this.state.time))
				musicboxStyle = [styles.musicbox,{backgroundColor: COLORS.yellow}];

			musicbox.push(
				<View style={musicboxStyle}>
					<Text style={{height: 20, fontSize: 11}}>{Math.round(time/60)}:{time%60}</Text>
					{checkPoint}
				</View>
			)
		}

		console.log("max H: " + (30 + dancerNum*20))
		this.scrollViewStyle = [styles.scrollView, {height: (30 + dancerNum*20)}]

		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1}}>

				<View style={{minHeight: height/2, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					{dancers}
				</View>

				<Slider
				value={this.state.value}
				onValueChange={value => {
					this.setState({ time: value })
					this.scrollView.scrollTo({x: (value+2)*30 - width/2})
				}}
				maximumValue={this.state.musicLength}
				style={{height: 25}}
				/>

				<View style={this.scrollViewStyle}>
				<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				ref={ref => (this.scrollView = ref)}>
					{musicbox}
				</ScrollView>
				</View>

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

const styles = StyleSheet.create({
	musicbox: {
		width: 28,
		margin: 1, 
		padding: 1,
		borderRightWidth: 1,
		borderRightColor: COLORS.grayMiddle,
		alignItems: 'center',
	},
	scrollView: {
		//backgroundColor: COLORS.blue,
		maxHeight: height/2,
	}
})