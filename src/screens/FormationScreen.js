import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, TextInput, Dimensions, Image, TouchableOpacity, Alert,
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
			// animationPlayToggle: false,
			isPlay: false,
		}
		this.dancerList=[];	// nid, did, name
		this.scrollView;
		this.scrollViewStyle;
		this.TAG = "FormationScreen/";
	}

	// 자식 컴포넌트(Dancer)에서 값 받아오기
	// Dancer를 드랍했을 때 저장된 position 좌표를 추가(또는 수정)한다.
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
  }

	deletePosition = (did, time) => {
		console.log(this.TAG, "deletePosition");

		if(time == 0) {
			Alert.alert("경고", "초기 상태는 지울 수 없어요!");
			return;
		}
		
		this.state.db.transaction(txn => {
      txn.executeSql(
				"DELETE FROM position " +
				"WHERE nid=? " +
				"AND did=? " +
				"AND time=?;",
				[this.state.noteId, did, time]
			);
		});

		// state 업데이트
		var _allPosList = this.state.allPosList;
		var posList = _allPosList[did];

		for(let i=0; i<posList.length; i++){
			if(time == posList[i].time){
				posList.splice(i, 1);
				this.setState({allPosList: _allPosList})
				return;
			}
		}
	}

	addPosition = (did, time) => {
		console.log(this.TAG, "addPosition");

		// time에 맞는 위치 구하기
		var _allPosList = this.state.allPosList;
		var posList = _allPosList[did];
		var posx;
		var posy;

		let i=0;
		for(; i<posList.length; i++){
			if(time < posList[i].time){
				const dx = (posList[i].posx - posList[i-1].posx) * (time - posList[i-1].time) / (posList[i].time - posList[i-1].time)
				const dy = (posList[i].posy - posList[i-1].posy) * (time - posList[i-1].time) / (posList[i].time - posList[i-1].time)
				posx = posList[i-1].posx + dx;
				posy = posList[i-1].posy + dy;
				break;
			}
		}
		if(i == posList.length) {
			posx = posList[i-1].posx;
			posy = posList[i-1].posy;
		}

		this.state.db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO position VALUES (?, ?, ?, ?, ?);",
				[this.state.noteId, did, time, posx, posy]
			);
		});

		posList.splice(i, 0, {posx: posx, posy: posy, time: time});
		_allPosList.splice(did, 1, posList);
		this.setState({allPosList: _allPosList});
	}

	resizeDancer = () => {

	}

	refresh = (_dancerList, _allPosList) => {
		this.dancerList = _dancerList;
		this.setState({allPosList: _allPosList});
	}

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
				// isPlay={this.state.isPlay}
				// elevation={100}
				/>
			)
			dancerName.push(
				<TouchableOpacity onPress={()=>{
					if(this.state.isPlay) this.setState({isPlay: false})
					this.props.navigation.navigate('Dancer', {noteId: this.state.noteId, dancerList: this.dancerList, allPosList: this.state.allPosList, refresh: this.refresh})}
					}>
					<Text style={{height: 20, width: 60, fontSize: 11,}}>
						[{i+1}] {this.dancerList[i].name}
					</Text>
				</TouchableOpacity>
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
						checkPoint.push( 
							<TouchableOpacity onLongPress={()=>this.addPosition(i, time)}>
								<Text style={{height: 20, color: COLORS.grayLight}}> * </Text> 
							</TouchableOpacity>
						)
						break;
					}
					if(this.state.allPosList[i][j].time == time){
						checkPoint.push( 
						<TouchableOpacity onLongPress={()=>this.deletePosition(i, time)}>
							<Text style={{height: 20, color: COLORS.red}}> * </Text> 
						</TouchableOpacity>
						)
						break;
					}
				}
				if(j == this.state.allPosList[i].length)
					checkPoint.push( 
						<TouchableOpacity onLongPress={()=>this.addPosition(i, time)}>
							<Text style={{height: 20, color: COLORS.grayLight}}> * </Text> 
						</TouchableOpacity>
					)
			}

			// 현재 시간에 대응하는 box 색칠하기
			var musicboxStyle = [styles.musicbox];
			if(time == Math.round(this.state.time))
				musicboxStyle = [styles.musicbox,{backgroundColor: COLORS.yellow}];

			musicbox.push(
				<View style={musicboxStyle}>
					<TouchableOpacity
					onPress={()=>{this.setState({time: time})}}>
						<Text style={{height: 20, fontSize: 11}}>{time%60 == 0 ? Math.floor(time/60)+'분' : time%60+'\"'}</Text>
					</TouchableOpacity>
					{checkPoint}
				</View>
			)
		}

		// 인원수에 맞게 music box view의 높이를 정하기 위해서
		this.scrollViewStyle = [styles.scrollView, {height: (20 + dancerNum*20)}]

		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1, paddingHorizontal: 5}}>

				<View style={{minHeight: height*3/5, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					{dancers}
				</View>

				<View style={{flexDirection: 'row', height: 30, alignItems: 'center',}}>
					<TouchableOpacity
					onPress={()=>{this.setState({isPlay: !this.state.isPlay})}}>
						{ this.state.isPlay ? 
						<Image source={require('../../assets/drawable/btn_pause.png')} style={styles.button}/> :
						<Image source={require('../../assets/drawable/btn_play.png')} style={styles.button}/>
						}
					</TouchableOpacity>
					<Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{Math.round(this.state.time/60)}:{Math.round(this.state.time%60) < 10 ? '0'+Math.round(this.state.time%60) : Math.round(this.state.time%60)}</Text>
					<Slider
					value={this.state.time}
					onValueChange={value => {
						if(this.state.time != Math.round(value))
							this.setState({ time: Math.round(value) })
						// this.scrollView.scrollTo({x: (value+2)*30 - width/2})
					}}
					maximumValue={this.state.musicLength}
					style={{flex: 1}}
					/>
					<Text style={{width: 40, fontSize: 14, textAlign: 'right'}}>{Math.round(this.state.musicLength/60)}:{Math.round(this.state.musicLength%60)<10 ? '0'+Math.round(this.state.musicLength%60) : Math.round(this.state.musicLength%60)}</Text>
				</View>

				<ScrollView>
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
				</ScrollView>

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
		width: 25,
		//padding: 2, 
		borderRightWidth: 1,
		borderRightColor: COLORS.grayMiddle,
		alignItems: 'center',
	},
	scrollView: {
		//backgroundColor: COLORS.blue,
		// maxHeight: height/2,
		flex: 1,
	},
	button: {
    width: 30,
    height: 30,
    marginTop: 10,
    marginRight: 10,
  },
})