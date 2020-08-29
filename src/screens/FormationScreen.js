import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, TextInput, Dimensions, Image, TouchableOpacity, Alert, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";

// custom library
import Dancer from '../components/Dancer'
import Player from '../components/Player'
import { COLORS } from '../values/Colors'
import { FONTS } from '../values/Fonts'

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "FormationScreen/";

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
			dancers: [],
			dancerName: [],
			// musicbox: [],
		}
		this.dancerList=[];	// nid, did, name
		this.scrollView;
		this.scrollViewStyle;
		this.timeText = [];
		this.musicbox = [];
		this.setCoordinate();
	}

	/** 
	 * 자식 컴포넌트(Dancer)에서 드랍한 위치 정보로 position DB에 추가/수정한다.
	 * @param did dancer id
	 * @param _x_y 드랍한 위치 좌표
	 * @param time 시간
	 */
  dropedPositionSubmit = (did, _x, _y, time=this.state.time) => {
    console.log(TAG + "dropedPositionSubmit");
    console.log(TAG + "놓은 위치: " + Math.round(_x) + ", " + Math.round(_y));
		
		// SQLite DB에서 업데이트
		this.state.db.transaction(txn => {
      txn.executeSql(
				"DELETE FROM position " +
				"WHERE nid=? " +
				"AND did=? " +
				"AND time=?;",
				[this.state.noteId, did, time]
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, ?, ?, ?, ?);",
				[this.state.noteId, did, time, _x, _y]
			);
		})

		// state 업데이트
		const newPos = {posx: _x, posy: _y, time: time};
		let _allPosList = [...this.state.allPosList];
		let posList = _allPosList[did];

		console.log(TAG, "newPos: " + newPos);

		let i=0;
		for(; i<posList.length; i++){
			if(time == posList[i].time){
				posList.splice(i, 1, newPos);
				break;
			}
			else if(time < posList[i].time){
				posList.splice(i, 0, newPos);
				break;
			}
		}
		if(i == posList.length)
			posList.splice(_allPosList[did].length, 0, newPos);
		
		// box 수정
		let prevTime = 0;
		// let curTime = 0;
		let rowView = [];
		for(let j=0; j<_allPosList[did].length; j++){

			let curTime = _allPosList[did][j].time;

			console.log(TAG, "prevTime: "+prevTime+" curTime: " + curTime);
			for(let k=prevTime; k<curTime-1; k++){
				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, k+1)}>
						<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
					 </TouchableOpacity>
				)
			}

			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.deletePosition(did, curTime)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.red, borderColor: COLORS.white, borderWidth: 1}}></View>
				</TouchableOpacity>
			)

			prevTime = curTime;
		}

		// 마지막 대열~노래 끝부분까지 회색박스 채우기
		for(let j=prevTime+1; j<=this.state.musicLength; j++){
			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, j)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
				</TouchableOpacity>
			)
		}
		// let _musicbox = [...this.musicbox];

		this.musicbox.splice(1+did, 1,
			<View flexDirection='row'>
					{rowView}
			</View>
			)

		this.setState({allPosList: _allPosList});
	}
	
	/** 
	 * 기존 저장되어 있는 값들을 기반으로 position DB에 좌표를 추가한다.
	 * @param did dancer id
	 * @param time 추가할 좌표의 time 값
	 */
	addPosition = (did, time) => {
		console.log(TAG, "addPosition(",did,time,")");

		// time에 맞는 위치 구하기
		let _allPosList = this.state.allPosList;
		let posList = _allPosList[did];
		let posx;
		let posy;

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

		// box 수정
		let prevTime = 0;
		// let curTime = 0;
		let rowView = [];
		for(let j=0; j<_allPosList[did].length; j++){

			let curTime = _allPosList[did][j].time;

			console.log(TAG, "prevTime: "+prevTime+" curTime: " + curTime);
			for(let k=prevTime+1; k<curTime; k++){
				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, k)}>
						<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
					 </TouchableOpacity>
				)
			}

			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.deletePosition(did, curTime)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.red, borderColor: COLORS.white, borderWidth: 1}}/>
				</TouchableOpacity>
			)

			prevTime = curTime;
		}

		// 마지막 대열~노래 끝부분까지 회색박스 채우기
		for(let j=prevTime+1; j<=this.state.musicLength; j++){
			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, j)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
				</TouchableOpacity>
			)
		}
		// let _musicbox = [...this.musicbox];

		this.musicbox.splice(1+did, 1,
			<View flexDirection='row'>
					{rowView}
			</View>
			)

		this.setState({allPosList: _allPosList});
	}

	/** 
	 * position DB에서 선택한 값을 삭제한다.
	 * @param did dancer id
	 * @param time 삭제할 좌표의 time 값
	 */
	deletePosition = (did, time) => {
		console.log(TAG, "deletePosition(",did,time,")");

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
		let _allPosList = this.state.allPosList;
		let posList = _allPosList[did];

		for(let i=0; i<posList.length; i++){
			if(time == posList[i].time){
				posList.splice(i, 1);
				break;
			}
		}

		// box 수정
		let prevTime = 0;
		// let curTime = 0;
		let rowView = [];
		for(let j=0; j<_allPosList[did].length; j++){

			let curTime = _allPosList[did][j].time;

			console.log(TAG, "prevTime: "+prevTime+" curTime: " + curTime);
			for(let k=prevTime+1; k<curTime; k++){
				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, k)}>
						<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
					 </TouchableOpacity>
				)
			}

			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.deletePosition(did, curTime)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.red, borderColor: COLORS.white, borderWidth: 1}}/>
				</TouchableOpacity>
			)

			prevTime = curTime;
		}

		// 마지막 대열~노래 끝부분까지 회색박스 채우기
		for(let j=prevTime+1; j<=this.state.musicLength; j++){
			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, j)}>
					<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}></View>
				</TouchableOpacity>
			)
		}
		// let _musicbox = [...this.musicbox];

		this.musicbox.splice(1+did, 1,
			<View flexDirection='row'>
					{rowView}
			</View>
			)

		this.setState({allPosList: _allPosList}, ()=>{
			this.setDancerInit();
		});
	}

	resizeDancer = () => {

	}

	refresh = (_dancerList, _allPosList) => {
		this.dancerList = _dancerList;
		this.setState({allPosList: _allPosList});
	}

	setTimeState = (time) => {
		console.log(TAG, "setTimeState: "+time);
		this.setState({time: time})
	}

	/** 
	 * 초기 댄서들 이름 리스트와 <Dancer> 컴포넌트들을 설정(?)하고 re-render 한다.
	 */
	setDancerInit = () => {
		console.log(TAG, "setDancerInit");
		const dancerNum = this.state.allPosList.length;

		let _dancers = [];
		let _dancerName = [ <Text key={0} style={{height: 20}}/> ];

		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer 
				key={_dancers.length}
				did={i} 
				position={this.state.allPosList[i]} 
				dropedPositionSubmit={this.dropedPositionSubmit} 
				curTime={this.state.time}
				isPlay={this.state.isPlay}
				// elevation={100}
				/>
			)
			_dancerName.push(
				<View key={_dancerName.length}>
					<TouchableOpacity onPress={()=>{
						if(this.state.isPlay) this.setState({isPlay: false})
						this.props.navigation.navigate('Dancer', {noteId: this.state.noteId, dancerList: this.dancerList, allPosList: this.state.allPosList, refresh: this.refresh})}
						}>
						<Text style={{height: 20, width: 60, fontSize: 11,}}>
							[{i+1}] {this.dancerList[i].name}
						</Text>
					</TouchableOpacity>
				</View>
			)
		}
		this.setState({dancers: _dancers, dancerName: _dancerName})
	}

	setBoxInit = () => {
		console.log(TAG, "setBoxInit");

		const dancerNum = this.state.allPosList.length;

		this.timeText = [];
		for(let time=0; time <= this.state.musicLength; time++){
			this.timeText.push(
				<TouchableOpacity onPress={()=>{
					this.markCurTime(time)
					this.setState({time: time}, ()=>{this.setDancerInit()})
					}}>
					<Text style={{height: 20, width: 20, fontSize: 11, textAlign: 'center', backgroundColor: 'gray', borderColor: COLORS.white, borderWidth: 1}}>{time}</Text>
				</TouchableOpacity>
			)
		}

		this.musicbox = [
			<View key={0} flexDirection='row'>
				{ this.timeText }
			</View>,
		];

		for(let i=0; i<dancerNum; i++){
			// time에 체크한 포인트가 있는지 확인
			let prevTime = 0;
			let rowView = [];
			for(let j=0; j<this.state.allPosList[i].length; j++){

				let curTime = this.state.allPosList[i][j].time;

				console.log(TAG, "prevTime: "+prevTime+" curTime: " + curTime);
				
				for(let k=prevTime+1; k<curTime; k++){
					rowView.push(
						<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(i, k)}>
							<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}/>
				 		</TouchableOpacity>
					)
				}

				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>{
						console.log("long press!!",i,curTime);
						this.deletePosition(i, curTime)
						}}>
						<View style={{height: 20, width: 20, backgroundColor: COLORS.red, borderColor: COLORS.white, borderWidth: 1}}/>
					</TouchableOpacity>
				)

				prevTime = curTime;
			}

			// 마지막 대열~노래 끝부분까지 회색박스 채우기
			for(let j=prevTime+1; j<=this.state.musicLength; j++){
				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(i, j)}>
						<View style={{height: 20, width: 20, backgroundColor: COLORS.grayMiddle, borderColor: COLORS.white, borderWidth: 1}}/>
					</TouchableOpacity>
				)
			}

			this.musicbox.push(
				<View flexDirection='row'>
					{rowView}
				</View>
			)	
		}

		// this.setState({musicbox: _musicbox});

		this.markCurTime(0);
	}

	markCurTime = (time) => {
		// let _musicbox = this.musicbox;
		let _timeText = [...this.timeText];

		_timeText[time] = <Text style={{height: 20, width: 20, fontSize: 11, textAlign: 'center', backgroundColor: COLORS.yellow, borderColor: COLORS.white, borderWidth: 1}}>{time}</Text>
		// this.timeText = _timeText;

		this.musicbox.splice(0, 1, 
		<View key={0} flexDirection='row'>
		{ _timeText }
		</View>);
		
		// this.setState({time: time}, () => {this.setDancerInit()});
	}

	timeFormat = (sec) => {
		return Math.floor(sec/60) + ':' + ( Math.floor(sec%60) < 10 ? '0'+Math.floor(sec%60) : Math.floor(sec%60) )
	}

	setCoordinate = () => {
		this.coordinate = [];
		const space = 50;
		for(let x=Math.round((-width/2)/space)*space; x<width/2; x=x+space){
			for(let y=Math.round((-height/2)/space)*space; y<height/2; y=y+space){
				this.coordinate.push(<View style={[styles.circle, {transform: [{translateX: x}, {translateY: y}]}]}/>)
			}
		}
	}

	render() {
		console.log(TAG, "render");

		// 인원수에 맞게 music box view의 높이를 정하기 위해서
		const dancerNum = this.state.allPosList.length;
		this.scrollViewStyle = [styles.scrollView, {height: (20 + dancerNum*20)}]

		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1, paddingHorizontal: 5}}>

				<View style={{minHeight: height*3/5, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					{ this.state.dancers }
					{ this.coordinate }
				</View>

				{/* <Player musicLength={this.state.musicLength} time={this.state.time} setTimeState={this.setTimeState}/> */}
				<View flexDirection='row'>
					{ this.state.isPlay ? 
					<TouchableOpacity onPress={()=>{this.pause()}}>
						<Image source={require('../../assets/drawable/btn_pause.png')} style={styles.button}/>
					</TouchableOpacity>
					:
					<TouchableOpacity onPress={()=>{this.play()}}>
						<Image source={require('../../assets/drawable/btn_play.png')} style={styles.button}/>
					</TouchableOpacity>
					}
					{/* <Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{this.timeFormat(this.state.time)}</Text> */}
					<Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{this.state.time}</Text>
				</View>

				<ScrollView>
				<View style={{flexDirection: 'row'}}>

					<View style={{flexDirection: 'column'}}>
						{ this.state.dancerName }
					</View>
					<View style={this.scrollViewStyle}>
						<ScrollView
						style={this.scrollViewStyle}
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						ref={ref => (this.scrollView = ref)}>
							<View flexDirection='column'>
								{ this.musicbox }
							</View>
						</ScrollView>
					</View>

				</View>
				</ScrollView>

			</SafeAreaView>
		)
	}

	componentDidMount() {
		console.log(TAG, "componentDidMount");

		let _allPosList = [];
		let _dancerList = [];

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT DISTINCT d.did, d.name " +
				"FROM position AS p, dancer AS d " +
				"WHERE p.nid=? " +
				"AND p.nid=d.nid " +
				"AND p.did=d.did;",
        [this.state.noteId],
        (tx, dancerResult) => {
					for (let i = 0; i < dancerResult.rows.length; i++) {
						_dancerList.push(dancerResult.rows.item(i));
						tx.executeSql(
							"SELECT time, posx, posy FROM position WHERE nid=? AND did=? ORDER BY time",
        			[this.state.noteId, _dancerList[i].did],
        			(txn, posResult) => {
								let posList = [];
								// console.log("posRes length:", posResult.rows.length);
								for (let j = 0; j < posResult.rows.length; j++) {
									// console.log("dancer:", posResult.rows.item(j));
									posList.push(posResult.rows.item(j));
								}
								_allPosList.push(posList);

								// for문 다 돌았다면 state 업데이트
								if(i == dancerResult.rows.length-1){
									this.setState({allPosList: _allPosList}, ()=>{
										this.setDancerInit();
										this.setBoxInit();
									});
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

	play = async () => {
		console.log(TAG, "play");
		this.interval = setInterval(() => {
			this.markCurTime(this.state.time+1);
			this.setState({time: this.state.time+1});
		}, 1000);

		this.setState({isPlay: true}, () => {
			this.setDancerInit();
		});
	}

	pause = () => {
		console.log(TAG, "pause");
		clearInterval(this.interval);
		this.setState({isPlay: false}, () => {
			this.setDancerInit();
		});
	}

	componentDidUpdate() {
		console.log(TAG, "componentDidUpdate");
		// time에 맞게 scroll view를 강제 scroll하기
		// this.scrollView.scrollToOffset({x: (this.state.time+2)*30 - width/2})
	}

	componentWillUnmount() {
		console.log(TAG, "componentWillUnmount");
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
	circle: {
    backgroundColor: COLORS.red,
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
})