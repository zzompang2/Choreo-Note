import React from 'react';
import {
	SafeAreaView,StyleSheet,ScrollView,View,Text,Dimensions,Image,TouchableOpacity,
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
			time: 10,
			musicLength: 200,
			animationPlayToggle: false,
			isPlay: false,
		}
		this.dancerList=[];
		this.scrollView;
		this.scrollViewStyle;
		this.TAG = "FormationScreen/";

		db.transaction(txn => {
			// txn.executeSql('DROP TABLE IF EXISTS dancer', []);
			// txn.executeSql('DROP TABLE IF EXISTS position', []);
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS dancer(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'name	TEXT, ' +
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
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS position(' +
					'nid INTEGER NOT NULL, ' +
					'did INTEGER NOT NULL, ' +
					'time INTEGER NOT NULL, ' +
					'posx INTEGER NOT NULL, ' +
					'posy INTEGER NOT NULL, ' +
					'PRIMARY KEY(nid, did, time) );'
			);
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 0, 0, 10, 10);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 0, 1, 20, 20);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 0, 5, 30, 30);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 1, 0, -30, -50);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 1, 6, -20, -40);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 1, 2, -10, -10);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 2, 0, 0, 50);'
			// );
			// txn.executeSql(
			// 	'INSERT INTO position VALUES (0, 3, 0, -100, -10);'
			// );
		})
	}

	// 자식 컴포넌트(Draggable)에서 값 받아오기
  dropedPositionSubmit = (did, _x, _y) => {
    console.log(this.TAG + "dropedPositionSubmit");
    console.log(this.TAG + "놓은 위치: " + Math.round(_x) + ", " + Math.round(_y));
		
		const curTime = Math.round(this.state.time);

		// SQLite DB에서 업데이트
		this.state.db.transaction(txn => {
      txn.executeSql(
				"DELETE FROM position " +
				"WHERE nid=? " +
				"AND did=? " +
				"AND time=?;",
				[this.state.noteId, did, curTime]
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, ?, ?, ?, ?);",
				[this.state.noteId, did, curTime, _x, _y]
			);
		})

		// state 업데이트
		const newPos = {posx: _x, posy: _y, time: curTime};
		var _allPosList = this.state.allPosList;
		var posList = _allPosList[did];

		console.log(this.TAG, "newPos: " + newPos);

		for(let i=0; i<posList.length; i++){
			if(curTime == posList[i].time){
				posList.splice(i, 1, newPos);
				this.setState({allPosList: _allPosList})
				return;
			}
			else if(curTime < posList[i].time){
				posList.splice(i, 0, newPos);
				this.setState({allPosList: _allPosList})
				return;
			}
		}
		_allPosList[did].splice(_allPosList[did].length, 0, newPos);
		this.setState({allPosList: _allPosList})

    //this._addPosition(index, _x, _y);
    //this.setState({pos: {x: Math.round(_x), y: Math.round(_y)}});
  }

	// splitIntoTime = () => {
	// 	if(this.state.allPosList.length == 0) return [];
	// 	var timeList = [];

	// }

	render() {
		console.log(this.TAG, "render");

		const dancerNum = this.state.allPosList.length;
		// console.log("dancerNum: " + dancerNum);

		var dancers = [];
		var dancerName = [<Text style={{height: 20}}></Text>];
    for(let i=0; i<dancerNum; i++){
      dancers.push(
				<Dancer 
				did={i} 
				position={this.state.allPosList[i]} 
				dropedPositionSubmit={this.dropedPositionSubmit} 
				curTime={this.state.time}
				// toggle={this.state.animationPlayToggle}
				// elevation={100}
				/>
			)
			dancerName.push(
				<Text style={{height: 20, width: 40, fontSize: 11}}>[{i+1}]{this.dancerList[i].name}</Text>
			)
		}

		var musicbox = [];
		for(let time=0; time <= this.state.musicLength; time++){
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
					<Text style={{height: 20, fontSize: 11}}>{Math.floor(time/60)}:{time%60}</Text>
					{checkPoint}
				</View>
			)
		}

		// 인원수에 맞게 music box view의 높이를 정하기 위해서
		this.scrollViewStyle = [styles.scrollView, {height: (20 + dancerNum*20)}]

		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1,}}>

				<View style={{alignItems: 'flex-end'}}>
					<TouchableOpacity
					onPress={()=>{this.setState({isPlay: !this.state.isPlay})}}>
						<Image source={require('../../assets/drawable/btn_play.png')} style={styles.button}/>
					</TouchableOpacity>
				</View>

				<View style={{minHeight: height/2, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					{dancers}
				</View>

				<View style={{flexDirection: 'row', height: 25, alignItems: 'center',}}>
					<Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{Math.round(this.state.time/60)}:{Math.round(this.state.time%60)}</Text>
					<Slider
					value={this.state.time}
					onValueChange={value => {
						this.setState({ time: Math.round(value) })
						// this.scrollView.scrollTo({x: (value+2)*30 - width/2})
					}}
					maximumValue={this.state.musicLength}
					style={{flex: 1}}
					/>
					<Text style={{width: 40, fontSize: 14, textAlign: 'right'}}>{Math.round(this.state.musicLength/60)}:{Math.round(this.state.musicLength%60)}</Text>
				</View>

				<View style={{flexDirection: 'row'}}>
					<View style={{flexDirection: 'column'}}>
						{dancerName}
					</View>
					<View style={this.scrollViewStyle}>
					<ScrollView
					style={this.scrollViewStyle}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					ref={ref => (this.scrollView = ref)}>
						{musicbox}
					</ScrollView>
					</View>
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

								// for문 다 돌았다면 state 업데이트
								if(i == dancerResult.rows.length-1){
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

		// 재생 버튼 누르면 ?초마다 실행됨
		this.interval = setInterval(() => {
      if(this.state.isPlay == true){
				this.setState({time: this.state.time+1});
			}
		}, 1000);
	}

	componentDidUpdate() {
		console.log(this.TAG, "componentDidUpdate");
		// time에 맞게 scroll view를 강제 scroll하기
		this.scrollView.scrollTo({x: (this.state.time+2)*30 - width/2})
	}

	componentWillUnmount() {
		console.log(this.TAG, "componentWillUnmount");
		clearInterval(this.interval);
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
		flex: 1,
	},
	button: {
    width: 30,
    height: 30,
    marginTop: 10,
    marginRight: 10,
  },
})