import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// custom library
import Dancer from '../components/Dancer';
import Positionbox from '../components/Positionbox';
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';
import DatabaseScreen from './DatabaseScreen';
import Menu from '../components/Menu';

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "FormationScreen/";
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];

// 화면의 가로, 세로 길이 받아오기
const {width, height} = Dimensions.get('window');

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteInfo: props.route.params.noteInfo,	// {nid, title, date, music, radiusLevel, coordinateLevel, alignWithCoordinate}
			time: 0,
			musicLength: 120,
			isPlay: false,		// play 중인가?
			isEditing: false,	// <Positionbox>를 편집중인가?
			isMenuPop: false,	// 세팅 모드인가?
			isDBPop: true,		// DB 스크린이 켜져 있는가?
			dancers: [],
			nameColumn: [],
		}
		this.allPosList = [];
		this.dancerList = [];	// nid, did, name
		this.scrollView;
		this.scrollViewStyle;
		this.timeText = [];
		this.musicbox = [];	
		this.selectedBoxInfo = {posIndex: -1};
		this.boxWidth = 30;
		this.boxHeight = 30;
		this.positionboxSize = 20;
		this.stageHeight = 250;

		this.coordinateLevel = this.state.noteInfo.coordinateLevel;
		this.radiusLevel = this.state.noteInfo.radiusLevel;
		this.alignWithCoordinate = this.state.noteInfo.alignWithCoordinate ? true : false;		// 좌표에 맞물려 이동

		this.setCoordinate();
	}

	/**
	 * DB_UPDATE('position', 
	 * 	{posx: posx, posy: posy}, 
	 * 	['nid=?', 'did=?', 'time=?'], 
	 * 	[nid, did, time]);
	 * @param {string} table 
	 * @param {JSX} set 
	 * @param {array<string>} where 
	 * @param {array} param
	 * @param {*} callback 
	 */
	DB_UPDATE = (table, set, where, param = [], callback = ()=>{}) => {
		console.log(TAG, 'DB_UPDATE');

		let setString = "*";
		let whereString = "*";

		for(let key in set)
			setString += ", " + key + "=" + set[key];
		
		where.forEach(str => {
			whereString += " AND " + str;
		});
			
		
		setString = setString.replace("*, ", "");
		whereString = whereString.replace("* AND ", "");

		this.state.db.transaction(txn => {
			txn.executeSql(
				"UPDATE " + table + " " +
				"SET " + setString + " " +
				"WHERE " + whereString + ";",
				param,
				() => {console.log(TAG, 'DB UPDATE SUCCESS!'); callback()},
				(error) => {console.log(TAG, 'DB UPDATE ERROR:', error)}
			);
		});
	}

	/**
	 * DB_DELETE('position', 
	 * 	['nid=?', 'did=?', 'time=?'], 
	 * 	[nid, did, time]);
	 * @param {*} table 
	 * @param {*} where 
	 * @param {*} param 
	 * @param {*} callback 
	 */
	DB_DELETE = (table, where, param = [], callback = ()=>{}) => {
		let whereString = "";

		where.forEach(str => { whereString += " AND " + str; });
		whereString = whereString.replace(" AND ", "");	// replace: 가장 처음 나타나는 것만 대체
		
		this.state.db.transaction(txn => {
      txn.executeSql(
				"DELETE FROM " + table + " " +
				"WHERE " + whereString,
				param,
				() => {console.log(TAG, 'DB DELETE SUCCESS!'); callback();},
				(error) => {console.log(TAG, 'DB DELETE ERROR:', error)}
			);
		});
	}

	DB_INSERT = (table, value, callback = () => {}) => {
		console.log(TAG, 'DB_INSERT');
		let keyString = "";
		let valueString = "";

		for(let key in value){
			keyString += ", " + key;
			valueString += ", " + value[key];
		}
		keyString = keyString.replace(", ", "");
		valueString = valueString.replace(", ", "");

		this.state.db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO " + table + "(" + keyString + ")" + " VALUES (" + valueString + ");",
				[],
				() => {console.log(TAG, 'DB INSERT SUCCESS!'); callback();},
				(error) => {console.log(TAG, 'DB INSERT ERROR:', error);}
			);
		})
	}

	/** time box를 초기화하거나 특정 시간을 표시한다.
	 * - if(no param) => initialize
	 * - re-render: NO
	 * - update: this.musicbox(, this.timeText)
	 * @param markedTime 마크할 시간 (없다면 초기화)
	 */
	setTimebox = (markedTime) => {
		console.log(TAG, 'setTimebox');

		let _timeText;

		// 파라미터가 없는 경우: initialize
		if(markedTime == undefined){
			markedTime = 0;	// default로 0초를 마크
			this.timeText = [];
			for(let time=0; time <= this.state.musicLength; time++){
				this.timeText.push(
					<View key={this.timeText.length} style={{flexDirection: 'column'}}>
						<TouchableOpacity
						style={this.styles('timeBox')}
						onPress={()=>{
							this.setTimebox(time);
							this.setState({time: time}, () => {
								// play 상태인 경우: pause 후 시간에 맞게 <Dancer> 위치 설정
								if(this.state.isPlay) this.pause();
								// pause 상태인 경우: 변한 시간에 맞게 <Dancer> 위치 설정
								else this.setDancer();
								});
							}}>
							<Text style={{fontSize: 11}}>{time}</Text>
						</TouchableOpacity>
						<View style={[this.styles('uncheckedBox'), {height: 10}]}/>
					</View>
				)
			}
		}

		// this.timeText: 아무 마크도 없는 pure한 array (음악 길이가 변경되지 않는 한 절대 변경되지 않음)
		// _timeText: 특정 시간이 마크되어 있는 array

		_timeText = [...this.timeText];
		_timeText[markedTime] = 
		<View key={markedTime} style={{flexDirection: 'column'}}>
			<View
			style={[this.styles('timeBox'), {
				borderColor: COLORS.grayMiddle, 
				borderRadius: 99, 
				borderWidth: 1}]}>
				<Text style={{fontSize: 11}}>{markedTime}</Text>
			</View>
			<View style={[this.styles('uncheckedBox'), {height: 10}]}/>
		</View>
		
		this.musicbox.splice(0, 1,
			<View key={0} flexDirection='row'>
				{ _timeText }
			</View>
		);
	}

	/** did번째 댄서의 music box를 초기화한다.
	 * - re-render: NO
	 * - update: this.musicbox
	 * @param {number} did 
	 * @param {array} posList (default) this.allPosList[did]
	 */
	setMusicbox = (did, posList = this.allPosList[did]) => {
		let prevTime = -1;
		let rowView = [];
		let selectedIdxInRowView = -1;
		
		for(let i=0; i<posList.length; i++){

			const curTime = posList[i].time;
			const duration = posList[i].duration;

			// duration으로 인해 이전 checked box에 덮어진 경우
			if(curTime <= prevTime){
				continue;
			}

			// 이전 좌표의 시간 ~ 다음 좌표의 시간까지 unchecked box 채우기
			for(let time=prevTime+1; time<curTime; time++){
				rowView.push(
					<TouchableOpacity 
					key={rowView.length} 
					activeOpacity={1} 
					onLongPress={()=>this.addPosition(did, time)}>
						<View style={this.styles('uncheckedBox')}></View>
					 </TouchableOpacity>
				)
			}

			// 선택된 블럭인 경우
			const isSelected = (i == this.selectedBoxInfo.posIndex) && (did == this.selectedBoxInfo.did);
			if(isSelected) selectedIdxInRowView = curTime;

			// checked box 넣기
			rowView.push(
				<TouchableOpacity 
				key={rowView.length}
				onPress={()=>this.selectPosition(did, i)}
				onLongPress={()=>this.deletePosition(did, curTime)}
				activeOpacity={.8}
				disabled={isSelected}
				style={{alignItems: 'center', justifyContent: 'center',}}>
					<View style={[this.styles('uncheckedBox'), {marginRight: (this.boxWidth-1)/2 + this.boxWidth*duration,}]}/>
					<View style={[this.styles('checkedBox'), {
						position: 'absolute',
						width: this.positionboxSize + this.boxWidth * duration, 
						backgroundColor: dancerColor[this.dancerList[did].color],
					}]}/>
				</TouchableOpacity>
			)
			prevTime = curTime + duration;
		}

		// 마지막 대열~노래 끝부분까지 회색박스 채우기
		for(let i=prevTime+1; i<=this.state.musicLength; i++){
			rowView.push(
				<TouchableOpacity key={rowView.length} activeOpacity={1} onLongPress={()=>this.addPosition(did, i)}>
					<View style={this.styles('uncheckedBox')}></View>
				</TouchableOpacity>
			)
		}

		if(selectedIdxInRowView != -1)
			rowView.push(
			<Positionbox
			key={-1}
			boxWidth={this.boxWidth}
			time={this.selectedBoxInfo.time}
			duration={this.selectedBoxInfo.duration}
			setScrollEnable={this.setScrollEnable}
			resizePositionboxLeft={this.resizePositionboxLeft}
			resizePositionboxRight={this.resizePositionboxRight}
			movePositionbox={this.movePositionbox}
			unselectPosition={this.unselectPosition}
			containerStyle={{
				height: this.boxHeight, 
				width: this.boxWidth * (this.selectedBoxInfo.duration+2), 
				position: 'absolute',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderWidth: 2,
				borderColor: COLORS.green,
				borderRadius: this.boxWidth/4,
				left: this.boxWidth * this.selectedBoxInfo.time - this.boxWidth/2,
			}}
			boxStyle={[this.styles('checkedBox'), {
				width: this.positionboxSize + this.boxWidth * this.selectedBoxInfo.duration,
				backgroundColor: dancerColor[this.dancerList[did].color],
			}]}
			buttonStyle={{height: this.boxHeight, width: this.boxWidth/2,  backgroundColor: COLORS.green, borderRadius: this.boxWidth/4}}
			/>
			);

		this.musicbox.splice(1+did, 1,
			<View 
			key={1+did}
			style={{flexDirection: 'row', alignItems: 'center'}}>
				{rowView}
			</View>
		)
	}

	/** music box 전체를 초기화한다.
	 * - re-render: NO
	 * - update: this.musicbox(, this.timeText)
	 * @param markedTime 마크할 시간 (없다면 초기화)
	 */
	setMusicboxs = (markedTime) => {
		console.log(TAG, "setMusicboxs");

		this.musicbox = [];	// 제거된 dancer가 있을 수 있으므로 초기화.

		this.setTimebox(markedTime);

		for(let did=0; did<this.dancerList.length; did++)
			this.setMusicbox(did);

		// 댄서 0명일 경우: 비어있는 row 하나 추가
		if(this.dancerList.length < 10){
			let rowView = [];
			// 마지막 대열~노래 끝부분까지 회색박스 채우기
			for(let i=0; i<=this.state.musicLength; i++){
				rowView.push( <View key={rowView.length} style={[this.styles('uncheckedBox'), {height: this.boxHeight * (10-this.dancerList.length)}]}/> )
			}
			this.musicbox.push(
				<View 
				key={-1}
				flexDirection='row'>
					{rowView}
				</View>
			)
		}
			
	}

	/** coordinate를 설정한다.
	 * - 가로: width
	 * - 세로: height*2/5
	 * - re-render: NO
	 * - update: this.coordinate
	 */
	setCoordinate = () => {
		console.log(TAG, 'setCoordinate:', this.coordinateLevel);
		const coordinateSpace = 15 + this.coordinateLevel*5;
		this.coordinate = [];
		for(let x=Math.round((-width/2)/coordinateSpace)*coordinateSpace; x<width/2; x=x+coordinateSpace){
			for(let y=Math.ceil((-this.stageHeight/2+1)/coordinateSpace)*coordinateSpace; y<this.stageHeight/2; y=y+coordinateSpace){
				this.coordinate.push(
				<View 
				key={this.coordinate.length} 
				style={{
					backgroundColor: COLORS.grayMiddle,
					width: 3,
					height: 3,
					borderRadius: 2,
					position: 'absolute', 
					transform: [{translateX: x}, {translateY: y}]}}/>
				)
			}
		}
	}

	/** 댄서들 이름과 <Dancer>들을 설정한다.
	 * - re-render: YES ( setState )
	 * - update: dancers, nameColumn
	 */
	setDancer = () => {
		console.log(TAG, "setDancer: " + this.allPosList.length);
		const dancerNum = this.dancerList.length;
		const radiusLength = 10 + this.radiusLevel * 2;

		let _dancers = [];
		let _nameColumn = [ <Text key={0} style={{height: this.boxHeight + 10, width: 60}}/> ];	// +10 : timeBox에서 positionbox와의 간격

		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer
				key={_dancers.length}
				did={i} 
				curTime={this.state.time}
				posList={[...this.allPosList[i]]} 
				dropPosition={this.dropPosition}
				isPlay={this.state.isPlay}
				radiusLength={radiusLength}
				alignWithCoordinate={this.alignWithCoordinate}
				coordinateLevel={this.coordinateLevel}
				color={this.dancerList[i].color}
				/>
			)
			_nameColumn.push(
				<View key={_nameColumn.length} style={{flexDirection: 'row', alignItems: 'center', height: this.boxHeight, width: 60}}>
					<Text style={{fontSize: 11}}>{i+1}. {this.dancerList[i].name}</Text>
				</View>
			)
		}
		this.setState({dancers: _dancers, nameColumn: _nameColumn})
	}
	
	/** <Dancer>에서 드래그 후 드랍한 위치 정보로 position DB에 추가/수정한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.musicbox
	 * @param did  dancer id
	 * @param posx 드랍한 x 좌표
	 * @param posy 드랍한 y 좌표
	 * @param time 시간
	 */
  dropPosition = (did, posx, posy, time = this.state.time) => {
    console.log(TAG + "dropPosition");
		
		// state 업데이트
		let newPos = {posx: posx, posy: posy, time: time, duration: 0};
		let posList = this.allPosList[did];

		for(var i=0; i<posList.length; i++){	// for문 밖에서도 사용하므로 let이 아닌 var
			// 이미 존재하는 시간인 경우: UPDATE
			if(time == posList[i].time){
				// selected position이 바뀐 경우
				if(this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == did && this.selectedBoxInfo.time == time){
					this.selectedBoxInfo.posx = posx;
					this.selectedBoxInfo.posy = posy;
				}
				newPos = {...newPos, duration: posList[i].duration};
				posList.splice(i, 1, newPos);
				this.DB_UPDATE('position', {posx: posx, posy: posy}, ['nid=?', 'did=?', 'time=?'], [this.state.noteInfo.nid, did, time]);
				// this.DB_UPDATE('position', {posx: posx, posy: posy}, {nid: ['=',this.state.noteInfo.nid], did: ['=',did], time: ['=',time]});
				this.setMusicbox(did);
				this.setDancer();
				return;
			}
			// 존재하지 않는 시간인 경우: INSERT
			else if(time < posList[i].time)
				break;
		}
		posList.splice(i, 0, newPos);
		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, time: time, posx: posx, posy: posy, duration: 0})
		this.setMusicbox(did);
		this.setDancer();
	}

	/** 기존 저장되어 있는 값들을 기반으로 position DB에 좌표를 추가한다.
	 * - re-render: YES ( forceUpdate() )
	 * - update: this.allPosList, this.musicbox
	 * @param did dancer id
	 * @param time 추가할 좌표의 time 값
	 */
	addPosition = (did, time) => {
		console.log(TAG, "addPosition(did:",did,"time:",time,")");

		// time에 맞는 위치 구하기
		let posList = this.allPosList[did];
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

		posx = Math.round(posx);
		posy = Math.round(posy);
		posList.splice(i, 0, {did: did, posx: posx, posy: posy, time: time, duration: 0});

		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, time: time, posx: posx, posy: posy, duration: 0});
		this.setMusicbox(did);
		this.forceUpdate();
	}

	/** position DB에서 선택한 값을 삭제한다.
	 * - selected position은 삭제할 수 없으므로 검사할 필요는 없음
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.musicbox
	 * @param did dancer id
	 * @param time 삭제할 좌표의 time 값
	 */
	deletePosition = (did, time) => {
		console.log(TAG, "deletePosition(",did,time,")");

		// if(this.posList[did].length == 1) {
		// 	Alert.alert("경고", "댄서당 최소 하나의 위치는 표시해야 합니다!");
		// 	return;
		// }

		let posList = this.allPosList[did];
		for(let i=0; i<posList.length; i++){
			if(time == posList[i].time){
				posList.splice(i, 1);
				break;
			}
		}

		this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'time=?'], 
	  	[this.state.noteInfo.nid, did, time]);
		// this.DB_DELETE(
		// 	'position', 
		// 	[
		// 		'nid='  + this.state.noteInfo.nid, 
		// 		'did='  + did,
		// 		'time=' + time
		// 	]
		// )
		this.setMusicbox(did);
		this.setDancer();
	}

	/** coordinate의 간격을 변경한다.
	 * - update: this.radiusLevel
	 * - re-render: YES ( setDancer() )
	 * - update: this.coordinate
	 * @param {string} type 'up' | 'down'
	 */
	resizeCoordinate = (type) => {
		console.log(TAG, 'resizeCoordinate');

		switch(type){
			case 'up':
				if(this.coordinateLevel < 5){
					this.coordinateLevel++;
					break;
				}
				return;
				
			case 'down':
				if(this.coordinateLevel > 1){
					this.coordinateLevel--;
					break;
				}
				return;
				
			default:
				console.log('Wrong parameter...');
		}
		// this.DB_UPDATE('note', {coordinateLevel: this.coordinateLevel}, {nid: ['=',this.state.noteInfo.nid]});
		this.DB_UPDATE('note', {coordinateLevel: this.coordinateLevel}, ['nid=?'], [this.state.noteInfo.nid]);
		this.setCoordinate();
		this.setDancer();	// dancer에게 coordinateLevel 전달하기 위해
	}

	/** <Dancer>의 크기를 변경한다.
	 * - update: this.radiusLevel
	 * - re-render: YES ( setDancer() )
	 * @param {string} type 'up' | 'down'
	 */
	resizeDancer = (type) => {
		console.log(TAG, 'resizeDancer');

		switch(type){
			case 'up':
				if(this.radiusLevel < 5){
					this.radiusLevel++;
					break;
				}
				return;
				
			case 'down':
				if(this.radiusLevel > 1){
					this.radiusLevel--;
					break;
				}
				return;
				
			default:
				console.log('Wrong parameter...');
		}
		// this.DB_UPDATE('note', {radiusLevel: this.radiusLevel}, {nid: ['=',this.state.noteInfo.nid]});
		this.DB_UPDATE('note', {radiusLevel: this.radiusLevel}, ['nid=?'], [this.state.noteInfo.nid]);
		this.setDancer();
	}

	resizeMusicList = (type) => {
		console.log(TAG, 'resizeMusicList');

		switch(type){
			case 'expand':
				if(this.boxWidth < 40){
					this.boxWidth += 2;
					this.positionboxSize += 1;
					this.setMusicboxs();
					this.forceUpdate();
					break;
				}
				return;
				
			case 'reduce':
				if(this.boxWidth > 20){
					this.boxWidth -= 2;
					this.positionboxSize -= 1;
					this.setMusicboxs();
					this.forceUpdate();
					break;
				}
				return;
				
			default:
				console.log('Wrong parameter...');
		}
	}

	/** <DancerScreen>에서 수정된 정보를 적용한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.dancerList, this.allPosList / this.musicbox / dancers, nameColumn
	 * @param {array} _dancerList 변경된 dancerList
	 * @param {array} _allPosList 변경된 allPosList
	 */
	changeDancerList = (_dancerList, _allPosList) => {
		console.log(TAG, 'changeDancerList');
		this.dancerList = [..._dancerList];
		this.allPosList = [..._allPosList];
		this.setMusicboxs(this.state.time);
		this.setDancer();
	}
	
	/** position box 하나를 선택한다.
	 * - re-render: YES ( forceUpdate )
	 * - update: this.selectedBoxInfo, musicbox
	 * - setMusicbox()
	 * @param {number} did 
	 * @param {number} posIndex 
	 */
	selectPosition = (did, posIndex) => {
		console.log(TAG, 'selectPosition(', did, posIndex, ')');

		// 선택되어 있던 것 제거
		if(this.selectedBoxInfo.posIndex != -1){
			this.unselectPosition();
		}
		// {color: 1, did: 0, duration: 11, name: 견우, posx: -30, posy: 0, time: 0}
		this.selectedBoxInfo = {...this.dancerList[did], ...this.allPosList[did][posIndex], posIndex: posIndex}

		// this.selectedBoxInfo.did = did;	
		// this.selectedBoxInfo.posIndex = positionIdx;
		// this.selectedBoxInfo.name = (did+1) + '. ' + '함창수';
		// this.selectedBoxInfo.time = this.allPosList[did][positionIdx].time;
		// this.selectedBoxInfo.posx = this.allPosList[did][positionIdx].posx;
		// this.selectedBoxInfo.posy = this.allPosList[did][positionIdx].posy;
		// this.selectedBoxInfo.duration = this.allPosList[did][positionIdx].duration;

		this.setMusicbox(did);
		this.forceUpdate();
	}

	/**
	 * 선택되어 있는 position box을 선택 취소한다.
	 * - re-render: YES ( forceUpdate )
	 * - update: musicbox
	 * - setMusicbox()
	 */
	unselectPosition = () => {
		console.log(TAG, 'unselectPosition');
		this.selectedBoxInfo.posIndex = -1;

		this.setMusicbox(this.selectedBoxInfo.did);
		this.forceUpdate();
	}

	/** 
	 * <Positionbox>를 편집중인 경우, scroll을 비활성화한다.
	 * - re-render: YES ( setState )
	 * - update: state.isEditing
	 * @param {boolean} isEditing <Positionbox>를 편집중인가?
	 */
	setScrollEnable = (isEditing) => {
		this.setState({isEditing: isEditing});
	}

	/**
	 * 선택되어 있는 box의 duration을 변경한다.
	 * @param {number} doUpdate
	 * @param {number} duration 
	 * @param {number} time 
	 * @param {number} did 
	 */
	resizePositionboxLeft = (doUpdate, duration, time = this.selectedBoxInfo.time, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionboxLeft(", doUpdate, duration, time, did, ')');
		
		if(!doUpdate){
			/**
			 * posList = [...this.allPosList[did]]
			 *  
			 * JSX 표현은 '참조 형식'이라 같은 값을 가리킨다. (포인터 개념)
			 * posList 변경시 allPosList의 값도 바뀐다.
			 * 
			 * 따라서 JSON.parse 를 사용하여 값을 복사해준다.
			 */
			let posList = JSON.parse(JSON.stringify(this.allPosList[did]));

			// 화면에 보이는 선택된 값 업데이트를 위해
			this.selectedBoxInfo.time -= (duration - this.selectedBoxInfo.duration);	// ++ or --
			this.selectedBoxInfo.duration = duration;
			
			// 댄서의 각 checked box 에 대해서...
			let i = 0;
			for(; ; i++){
				console.log(this.selectedBoxInfo.time, '<=', posList[i].time, '<', time);

				// 바뀌기 전 시간 이상인 경우: 무시 (break)
				// [i]번째 == 선택된 positionbox의 정보
				if(time <= posList[i].time) break;

				// 바뀐 시간보다 작은 경우: 무시 (continue)
				if(posList[i].time + posList[i].duration < this.selectedBoxInfo.time) continue;

				// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
				if(posList[i].time < this.selectedBoxInfo.time) {
					posList[i].duration = this.selectedBoxInfo.time - posList[i].time - 1;
					continue;
				}
				// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
				posList.splice(i, 1);
				i--;
			}
			this.selectedBoxInfo.posIndex = i;
			console.log(TAG, 'selectedPositionIdx Update! ' + this.selectedBoxInfo.posIndex);

			posList[i] = {...posList[i], time: this.selectedBoxInfo.time, duration: duration};

			this.posList = posList; 	// for DB debug
			this.setMusicbox(did, posList);
			this.forceUpdate();
		}

		// update DB & allPosList
		else{
			this.DB_DELETE('position', 
				['nid=?', 'did=?', 'time>=?', 'time<?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.time, time],
			// this.DB_DELETE(
			// 	'position', 
			// 	[
			// 		'nid='   + this.state.noteInfo.nid, 
			// 		'did='   + did,
			// 		'time>=' + this.selectedBoxInfo.time,
			// 		'time<'  + time
			// 	],
				()=>{
					this.DB_UPDATE('position', 
					{duration: duration, time: this.selectedBoxInfo.time}, 
					['nid=?', 'did=?', 'time=?'], 
					[this.state.noteInfo.nid, did, time]);
					// this.DB_UPDATE(
					// 	'position', 
					// 	{
					// 		duration: duration, 
					// 		time: this.selectedBoxInfo.time
					// 	},
					// 	{
					// 		nid: ['=',this.state.noteInfo.nid],
					// 		did: ['=',did], 
					// 		time: ['=',time]
					// 	}
					// )
				}
			);
			let i = 0;
			for(; ; i++){
				console.log(this.selectedBoxInfo.time, '<=', this.allPosList[did][i].time, '<', time)

				// 바뀌기 전 시간 이상인 경우: 무시 (break)
				// [i]번째 == 선택된 positionbox의 정보
				if(this.allPosList[did][i].time >= time) break;

				// 바뀐 시간보다 작은 경우: 무시 (continue)
				if(this.allPosList[did][i].time + this.allPosList[did][i].duration < this.selectedBoxInfo.time) continue;

				// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
				if(this.allPosList[did][i].time < this.selectedBoxInfo.time) {
					const reducedDuration = this.selectedBoxInfo.time - this.allPosList[did][i].time - 1;
					this.allPosList[did][i].duration = reducedDuration;
					this.DB_UPDATE('position', 
					{duration: reducedDuration}, 
					['nid=?', 'did=?', 'time=?'], 
					[this.state.noteInfo.nid, did, this.allPosList[did][i].time]);
					// this.DB_UPDATE(
					// 	'position', 
					// 	{ duration: reducedDuration },
					// 	{
					// 		nid: ['=',this.state.noteInfo.nid],
					// 		did: ['=',did], 
					// 		time: ['=',this.allPosList[did][i].time]})
					continue;
				}
				// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
				// duration을 늘린 결과로 덮여진 box를 지운다.
				this.allPosList[did].splice(i, 1);
				i--;
			}	
			console.log(i, '번째에 선택된 정보가 있다!');
			this.allPosList[did][i].time = this.selectedBoxInfo.time;
			this.allPosList[did][i].duration = duration;
			this.setMusicbox(did);
			this.setDancer();
		}
	}

	resizePositionboxRight = (doUpdate, duration = this.selectedBoxInfo.duration, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionboxRight(", doUpdate, duration, did, ')');
		
		if(!doUpdate){
			let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
			posList[this.selectedBoxInfo.posIndex].duration = duration;

			// 화면에 보이는 선택된 값 업데이트를 위해
			this.selectedBoxInfo.duration = duration;
			
			// 댄서의 각 checked box 에 대해서...
			const rightEndTime = this.selectedBoxInfo.time + this.selectedBoxInfo.duration;

			for(let i = this.selectedBoxInfo.posIndex + 1; i<posList.length; i++){
				// 시간이 바뀐 길이보다 큰 경우: 무시 (break)
				if(rightEndTime < posList[i].time) break;

				// 시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우: time++ && duration--
				if(rightEndTime < posList[i].time + posList[i].duration){
					posList[i].duration -= (rightEndTime + 1 - posList[i].time);
					posList[i].time = rightEndTime + 1;
					break;
				}
				// 바뀐 길이에 완전히 덮여버린 경우: 삭제 (splice)
				posList.splice(i, 1);
				i--;
			}
			this.posList = posList; 	// for DB debug
			this.setMusicbox(did, posList);
			this.forceUpdate();
		}

		// update DB & allPosList
		else{
			this.selectedBoxInfo.duration = duration;

			const rightEndTime = this.selectedBoxInfo.time + duration;
			this.allPosList[did][this.selectedBoxInfo.posIndex].duration = duration;

			this.DB_UPDATE('position', 
				{duration: duration}, 
				['nid=?', 'did=?', 'time=?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.time]);
			// this.DB_UPDATE(
			// 	'position', 
			// 	{ duration: duration },
			// 	{
			// 		nid: ['=', this.state.noteInfo.nid],
			// 		did: ['=', did], 
			// 		time: ['=', this.selectedBoxInfo.time]
			// 	}
			// );
			
			this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'time>?', 'time+duration<=?'], 
	  	[this.state.noteInfo.nid, did, this.selectedBoxInfo.time, rightEndTime]);
			// this.DB_DELETE(
			// 	'position', 
			// 	[
			// 		'nid='  + this.state.noteInfo.nid, 
			// 		'did='  + did,
			// 		'time>'	+ this.selectedBoxInfo.time,
			// 		'time+duration<=' + rightEndTime
			// 	]
			// );

			console.log('selectedPositionIdx', this.selectedBoxInfo.posIndex, this.allPosList[did].length);
			// 댄서의 각 checked box 에 대해서...
			for(let i = this.selectedBoxInfo.posIndex + 1; i<this.allPosList[did].length; i++){

				console.log(rightEndTime, '\n', this.allPosList[did][i].time, '\n', this.allPosList[did][i].duration)

				// 시간이 바뀐 길이보다 큰 경우: 무시 (break)
				if(rightEndTime < this.allPosList[did][i].time) break;

				// 시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우: time++ && duration--
				if(rightEndTime < this.allPosList[did][i].time + this.allPosList[did][i].duration){
					console.log('시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우');
					
					const originTime = this.allPosList[did][i].time;
					this.allPosList[did][i].duration -= (rightEndTime + 1 - originTime);
					this.allPosList[did][i].time = rightEndTime + 1;

					console.log(originTime, '->', this.allPosList[did][i].time, this.allPosList[did][i].time)

					this.DB_UPDATE('position', 
						{duration: this.allPosList[did][i].duration, time: this.allPosList[did][i].time}, 
						['nid=?', 'did=?', 'time=?'], 
						[this.state.noteInfo.nid, did, originTime]);
					// this.DB_UPDATE(
					// 	'position', 
					// 	{ 
					// 		duration: this.allPosList[did][i].duration,
					// 		time: this.allPosList[did][i].time 
					// 	},{
					// 		nid: ['=', this.state.noteInfo.nid],
					// 		did: ['=', did], 
					// 		time: ['=', originTime]
					// 	}
					// );
					break;
				}
				// 바뀐 길이에 완전히 덮여버린 경우: 삭제 (splice)
				this.allPosList[did].splice(i, 1);
				i--;
			}
			this.setMusicbox(did);
			this.setDancer();
		}
	}

	movePositionbox = (doUpdate, to, from = this.selectedBoxInfo.time, did = this.selectedBoxInfo.did) => {
		console.log(TAG, 'movePositionbox (', doUpdate, to, from, did, ')');

		if(to < 0 || this.state.musicLength < to) return;

		let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		let myPosInfo;
		let shouldDelete = [];	// 삭제 되어야 할 position의 time
		let shouldUpdate = [];	// 업데이트 되어야 할 position의 [time, {updated_value}]
		let shouldInsert = [];	// 새로 생성 되어야 할 position의 {inserted_value}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.time = to;

		// 댄서의 각 checked box 에 대해서...
		const rightEndTime = this.selectedBoxInfo.time + this.selectedBoxInfo.duration;

		let findIndex = false;

		for(let i=0; i<posList.length; i++){
			console.log('FOR-LOOP::', i);
			// 자기 자신 정보를 저장해놓고 삭제
			if(posList[i].time == from){
				console.log('case 1: 자기 자신 제거');
				myPosInfo = {...posList.splice(i, 1)[0], time: to};
				shouldDelete.push(from);
				i--;
				continue;
			}

			// selected box 왼쪽 끝보다 뒤에 있는 경우: 무시 (continue)
			if(posList[i].time + posList[i].duration < this.selectedBoxInfo.time) {
				console.log('case 2: 뒤에 있는 경우 무시');
				continue;
			}

			// 시작 시간이 뒤에 있는 경우
			if(posList[i].time < this.selectedBoxInfo.time){
				// 시작 시간은 뒤에 있으나 조금 잘리는 경우: duration 줄이기
				if(posList[i].time + posList[i].duration <= rightEndTime){
					console.log('case 3-1: 시작 시간은 뒤에 있으나 조금 잘리는 경우 duration 줄이기');
					posList[i].duration = this.selectedBoxInfo.time - posList[i].time - 1;
					shouldUpdate.push([posList[i].time, {duration: posList[i].duration}]);
					continue;
				}
				// 시작 시간은 뒤에 있으나 중간에 잘리는 경우: 둘로 나누기
				else{
					console.log('case 3-2: 시작 시간은 뒤에 있으나 중간에 잘리는 경우 둘로 나누기');
					const newPos = {...posList[i], time: rightEndTime+1, duration: posList[i].duration+posList[i].time-rightEndTime-1};
					posList[i].duration = this.selectedBoxInfo.time - posList[i].time - 1;
					posList.splice(i+1, 0, newPos);
					shouldUpdate.push([posList[i].time, {duration: posList[i].duration}]);
					shouldInsert.push(newPos);
					i++;
					if(!findIndex){
						console.log('FIND INDEX::', i);
						this.selectedBoxInfo.posIndex = i;
						findIndex = true;
					}
					continue;
				}
			}

			// 완전히 포개진 경우: 삭제
			if(this.selectedBoxInfo.time <= posList[i].time && posList[i].time + posList[i].duration <= rightEndTime){
				console.log('case 4: 완전히 포개진 경우 삭제');
				shouldDelete.push(posList[i].time);
				posList.splice(i, 1);
				i--;
				continue;
			}

			// 시작 시간은 포함되지만 duration을 줄이면 되는 경우: time 증가 && duration 감소
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 뒤에 있을 수도 있으니 break 하지 않는다.
			if(this.selectedBoxInfo.time <= posList[i].time && posList[i].time <= rightEndTime  && rightEndTime < posList[i].time + posList[i].duration){
				console.log('case 5: 시작 시간은 포함되지만 duration을 줄이면 되는 경우: time 증가 && duration 감소');
				
				posList[i].duration -= (rightEndTime + 1 - posList[i].time);
				shouldUpdate.push([posList[i].time, {time: rightEndTime + 1, duration: posList[i].duration}]);
				posList[i].time = rightEndTime + 1;
				if(!findIndex) {
					console.log('FIND INDEX::', i);
					this.selectedBoxInfo.posIndex = i;
					findIndex = true;
				}
				continue;
			}

			// 시간이 바뀐 길이보다 큰 경우: 무시 (continue)
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 뒤에 있을 수도 있으니 break 하지 않는다.
			if(rightEndTime < posList[i].time) {
				console.log('case 6: 시간이 바뀐 길이보다 큰 경우: 무시 (continue)');
				if(!findIndex) {
					console.log('FIND INDEX::', i);
					this.selectedBoxInfo.posIndex = i;
					findIndex = true;
				}
				continue;
			}
		}
		if(!findIndex) {
			console.log('FIND INDEX::', posList.length);
			this.selectedBoxInfo.posIndex = posList.length;
		}
		posList.splice(this.selectedBoxInfo.posIndex, 0, myPosInfo);
		shouldInsert.push(myPosInfo);

		this.posList = posList; 	// for DB debug
		console.log(shouldDelete);
		console.log(shouldUpdate);
		console.log(shouldInsert);

		if(!doUpdate){
			this.setMusicbox(did, posList);
			this.forceUpdate();
		}
		else{
			shouldDelete.forEach(time => {
				this.DB_DELETE('position', ['nid=?', 'did=?', 'time=?'], [this.state.noteInfo.nid, did, time]);
			});
			shouldUpdate.forEach(([time, set]) => {
				this.DB_UPDATE('position', set, ['nid=?', 'did=?', 'time=?'], [this.state.noteInfo.nid, did, time]);
			});
			shouldInsert.forEach(value => {
				this.DB_INSERT('position', {...value, nid: this.state.noteInfo.nid});
			});

			this.allPosList[did] = posList;
			this.setMusicbox(did);
			this.setDancer();
		}
	}

	changeAlignWithCoordinate = () => {
		this.alignWithCoordinate = !this.alignWithCoordinate;
		this.DB_UPDATE('note', 
			{alignWithCoordinate: this.alignWithCoordinate}, 
			['nid=?'], 
			[this.state.noteInfo.nid]);
		// this.DB_UPDATE(
		// 	'note', 
		// 	{alignWithCoordinate: this.alignWithCoordinate}, 
		// 	{nid: ['=',this.state.noteInfo.nid]}
		// );
		this.setDancer();
	}
	
	closeDBScreen = () => {
		this.setState({isDBPop: false});
	}

	/** 초(sec) => "분:초" 변환한다.
	 * - re-render: NO
	 * @param {number} sec 
	 * @returns {string} 'min:sec'
	 */
	timeFormat(sec){
		return Math.floor(sec/60) + ':' + ( Math.floor(sec%60) < 10 ? '0'+Math.floor(sec%60) : Math.floor(sec%60) )
	}

	play = async () => {
		console.log(TAG, "play");
		this.interval = setInterval(() => {
			this.setTimebox(this.state.time+1);
			// time에 맞게 scroll view를 강제 scroll하기
			this.scrollView.scrollTo({x: (this.state.time-1)*this.boxWidth, animated: false});
			this.setState({time: this.state.time+1}, () => {
				if(this.state.time == this.state.musicLength)
					this.pause();
			});
		}, 1000);

		this.setState({isPlay: true}, () => {
			this.setDancer();
		});
	}

	pause = () => {
		console.log(TAG, "pause");
		clearInterval(this.interval);
		this.setState({isPlay: false}, () => {
			this.setDancer();
		});
	}

	jumpTo = (time) => {
		let dest = this.state.time + time;
		if(dest < 0) dest = 0;
		else if (dest > this.state.musicLength) dest = this.state.musicLength;

		this.setTimebox(dest);
		this.scrollView.scrollTo({x: (dest-1)*this.boxWidth, animated: false});
		this.setState({time: dest}, () => {
			this.setDancer();
		});
	}

	editTime = (text) => {
		text = text.replaceAll(' ', '').split(':');

		let min = 0;
		let sec;
		let time = -1;
		
		switch(text.length){
			case 2:
				min = Number(text[0]);
				sec = Number(text[1]);
				if(!isNaN(min) && !isNaN(sec) && text[0]!='' && text[1]!=''){
					if(min == Math.round(min) && sec == Math.round(sec) && min>=0 && sec>=0 && sec<60){
						time = min * 60 + sec;
					}
				}
				break;

			case 1:
				sec = Number(text[0]);
				if(!isNaN(sec) && text[0]!=''){
					if(sec == Math.round(sec)){
						time = sec;
					}
				}
				break;
		}
		if(time >= 0) {
			time = time > this.state.musicLength ? this.state.musicLength : time;
			// UPDATE DB
			// selectedBoxInfo 값을 변경하기 전에 원래값 기반으로 DB 먼저 수정.
			this.DB_UPDATE('position', 
				{time: time}, 
				['nid=?', 'did=?', 'time=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.time]);
			// this.DB_UPDATE(
			// 	'position', 
			// 	{ time: time },
			// 	{
			// 		nid: ['=', this.state.noteInfo.nid],
			// 		did: ['=', this.selectedBoxInfo.did], 
			// 		time: ['=', this.selectedBoxInfo.time]
			// 	}
			// );
			this.selectedBoxInfo.time = time;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].time = time;
			this.setMusicbox(this.selectedBoxInfo.did);
			this.setDancer();
		}
		else{
			Alert.alert("취소", "올바르지 않은 형식입니다.");
		}
	}

	editDuration = (text) => {
		text = text.replaceAll(' ', '');

		if(!isNaN(Number(text)) && text != '' && Number(text) >= 0)
			this.resizePositionboxRight(true, Math.round( Number(text) ));
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	editX = (text) => {
		text = text.replaceAll(' ', '');
		if(!isNaN(Number(text)) && text != ''){
			let posx = Math.round(Number(text));
			posx = Math.abs(posx) > Math.floor(width/2) ? Math.floor(width/2) * Math.sign(posx) : posx;
			this.DB_UPDATE('position', 
				{posx: posx}, 
				['nid=?', 'did=?', 'time=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.time]);
			// this.DB_UPDATE(
			// 	'position', 
			// 	{ posx: posx },
			// 	{
			// 		nid: ['=', this.state.noteInfo.nid],
			// 		did: ['=', this.selectedBoxInfo.did], 
			// 		time: ['=', this.selectedBoxInfo.time]
			// 	}
			// );
			this.selectedBoxInfo.posx = posx;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posx = posx;
			this.setDancer();
		}
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	editY = (text) => {
		text = text.replaceAll(' ', '');
		if(!isNaN(Number(text)) && text != ''){
			let posy = Math.round(Number(text));
			posy = Math.abs(posy) > Math.floor(this.stageHeight/2) ? Math.floor(this.stageHeight/2) * Math.sign(posy) : posy;
			this.DB_UPDATE(
				'position', 
				{ posy: posy },
				{
					nid: ['=', this.state.noteInfo.nid],
					did: ['=', this.selectedBoxInfo.did], 
					time: ['=', this.selectedBoxInfo.time]
				}
			);
			this.selectedBoxInfo.posy = posy;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posy = posy;
			this.setDancer();
		}
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	selectView = () => {
		const isSelected = this.selectedBoxInfo.posIndex == -1 ? false : true;

		return (
			<View style={styles.selectContainer}>
				<View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
					<Text style={styles.selectText}>시작</Text>
					<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editTime(event.nativeEvent.text)}>
						{isSelected ? this.timeFormat(this.selectedBoxInfo.time) : ''}</TextInput>
					<Text style={styles.selectText}>길이</Text>
					<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editDuration(event.nativeEvent.text)}>
						{isSelected ? this.selectedBoxInfo.duration : ''}</TextInput>
					<Text style={styles.selectText}>X</Text>
					<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editX(event.nativeEvent.text)}>
						{isSelected ? this.selectedBoxInfo.posx : ''}</TextInput>
					<Text style={styles.selectText}>Y</Text>
					<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editY(event.nativeEvent.text)}>
						{isSelected ? this.selectedBoxInfo.posy : ''}</TextInput>
				</View>
			</View>
		)
	}

	componentDidMount() {
		console.log(TAG, "componentDidMount");

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT DISTINCT d.did, d.name, d.color " +
				"FROM position AS p, dancer AS d " +
				"WHERE p.nid=? " +
				"AND p.nid=d.nid " +
				"AND p.did=d.did;",
        [this.state.noteInfo.nid],
        (tx, dancerResult) => {
					for (let i = 0; i < dancerResult.rows.length; i++) {
						this.dancerList.push(dancerResult.rows.item(i)); // {did, name, color}
					}
				}
			)
		});

		this.state.db.transaction(txn => {
			txn.executeSql(
				"SELECT did, time, posx, posy, duration " +
				"FROM position " +
				"WHERE nid=? " +
				"ORDER BY did, time;",
				[this.state.noteInfo.nid],
				(tx, posResult) => {
					if(posResult.rows.length != 0){
						let posList = [];
						let did = 0;
						for(let i=0; i < posResult.rows.length; i++){
							// did번째 댄서의 position을 하나씩 push
							if(posResult.rows.item(i).did == did){
								posList.push(posResult.rows.item(i));
							}
							// did번째 댄서의 position을 모두 넣은 경우
							else{
								this.allPosList.push(posList);
								did++;
								i--;
								posList = [];
							}
						}
						// 마지막 댄서의 posList
						this.allPosList.push(posList);
					}

					this.setMusicboxs();
					this.setDancer();
				}
			);
		});
	}

	componentWillUnmount() {
		console.log(TAG, "componentWillUnmount");
		clearInterval(this.interval);
		this.props.route.params.updateNoteList();
		// this.props.route.params.updateNoteList();
	}

	render() {
		console.log(TAG, "render");

		const buttonColor = this.state.isPlay ? COLORS.grayMiddle : COLORS.blackDark;

		return(
			<SafeAreaView style={{flex: 1, flexDirection: 'column'}}>
			<View style={{flex: 1}}>

				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>{this.state.noteInfo.title}</Text>
					
					<TouchableOpacity onPress={()=>{this.setState({isMenuPop: !this.state.isMenuPop})}}>
						<IconIonicons name={this.state.isMenuPop ? "ios-arrow-up" : "ios-menu"} size={24} color="#ffffff"/>
					</TouchableOpacity>
				</View>
				
				<View style={{height: this.stageHeight, alignItems: 'center', justifyContent: 'center'}}>
					<View style={{width: width, height: this.stageHeight, backgroundColor: COLORS.white}}/>
					{ this.coordinate }
					{ this.state.dancers }
				</View>

				{this.selectView()}

				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>

					<Text style={{flex: 1, width: 40, fontSize: 14, textAlign: 'center'}}>{this.timeFormat(this.state.time)}</Text>

					<TouchableOpacity onPress={()=>this.jumpTo(-30)} 
					disabled={this.state.isPlay} style={{margin: 10}} activeOpacity={.7}>
						<MaterialCommunityIcons name='rewind-30' size={28} color={buttonColor}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={()=>this.jumpTo(-10)} 
					disabled={this.state.isPlay} style={{margin: 10}} activeOpacity={.7}>
						<MaterialCommunityIcons name='rewind-10' size={28} color={buttonColor}/>
					</TouchableOpacity>

					{ this.state.isPlay ? 
					<TouchableOpacity onPress={()=>{this.pause()}} style={{margin: 1}} activeOpacity={.9}>
						<IconIonicons name="pause-circle-outline" size={40}/>
					</TouchableOpacity>
					:
					<TouchableOpacity onPress={()=>{this.play()}} style={{margin: 1}} activeOpacity={.9}>
						<IconIonicons name="play-circle" size={40}/>
					</TouchableOpacity>
					}

					<TouchableOpacity onPress={()=>this.jumpTo(10)} 
					disabled={this.state.isPlay} style={{margin: 10}} activeOpacity={.7}>
						<MaterialCommunityIcons name='fast-forward-10' size={28} color={buttonColor}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={()=>this.jumpTo(30)} 
					disabled={this.state.isPlay} style={{margin: 10}} activeOpacity={.7}>
						<MaterialCommunityIcons name='fast-forward-30' size={28} color={buttonColor}/>
					</TouchableOpacity>

					<Text style={{flex: 1, width: 40, fontSize: 14, textAlign: 'center'}}>{this.timeFormat(this.state.musicLength)}</Text>

				</View>

				<ScrollView 
				scrollEnabled={!this.state.isEditing}
				style={{padding: 10}}>
					<View style={{flexDirection: 'row'}}>
						<View style={{flexDirection: 'column'}}>
							{ this.state.nameColumn }
						</View>
						<ScrollView
						scrollEnabled={!this.state.isEditing}
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						ref={ref => (this.scrollView = ref)}>
							<View flexDirection='column'>
								{ this.musicbox }
							</View>
						</ScrollView>
					</View>
				</ScrollView>

				{ this.state.isMenuPop ? 
				<Menu
				closeMenu={()=>{this.setState({isMenuPop: false})}}
				resizeDancer={this.resizeDancer}
				radiusLevel={this.radiusLevel}
				resizeCoordinate={this.resizeCoordinate}
				coordinateLevel={this.coordinateLevel}
				resizeMusicList={this.resizeMusicList}
				boxWidth={this.boxWidth}
				alignWithCoordinate={this.alignWithCoordinate}
				changeAlignWithCoordinate={this.changeAlignWithCoordinate}
				moveToDancer={() => {
					if(this.state.isPlay) { this.setState({isPlay: false}); }
					this.props.navigation.navigate('Dancer', {
						noteId: this.state.noteInfo.nid, 
						dancerList: this.dancerList, 
						allPosList: this.allPosList, 
						changeDancerList: this.changeDancerList,
					})
					this.setState({isMenuPop: false});
				}}
				openDBScreen={()=>{console.log('open DB'); this.setState({isMenuPop: false, isDBPop: true});}}/> 
				: 
				<View/> 
				}

				{this.state.isDBPop ?
				<DatabaseScreen 
				dancerList={this.dancerList}
				allPosList={this.allPosList}
				posList={this.posList}
				nid={this.state.noteInfo.nid}
				closeDBScreen={this.closeDBScreen}/>
				: 
				<View/>
				}
				
			</View>
			</SafeAreaView>
		)
	}

	styles = (name) => {
		switch(name){
			case 'uncheckedBox':
				return({
					height: this.boxHeight, 
					width: 1, 
					marginHorizontal: (this.boxWidth-1)/2, 
					backgroundColor: COLORS.grayMiddle,
				})
			case 'checkedBox':
				return({
					height: this.positionboxSize, 
					width: this.positionboxSize, 
					borderRadius: 10,
				})
			case 'timeBox': 
				return({
					height: this.boxHeight, 
					width: this.boxWidth,
					justifyContent: 'center', 
					alignItems: 'center'
				})
			default:
				console.log('Wrong parameter...');
		}
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
	selectContainer: {
		width:'100%', 
		height:50,
		flexDirection: 'column',
		backgroundColor:COLORS.grayLight, 
		padding: 10,
	},
	selectText: {
		fontSize: 12,
		textAlign: 'left',
		color: COLORS.grayMiddle,
		padding: 3,
	},
	selectTextInput: {
		flex: 1,
		fontSize: 14,
		textAlign: 'center',
		color: COLORS.grayDark,
		padding: 3,
		margin: 3,
		backgroundColor: COLORS.grayLight,
		borderRadius: 5,
		borderColor: COLORS.grayMiddle,
		borderWidth: 1,
	},
	button: {
		flex: 1,
		fontSize: 14,
		textAlign: 'center',
		color: COLORS.white,
		padding: 5,
		marginLeft: 5,
		backgroundColor: COLORS.grayMiddle,
		borderRadius: 20,
		borderColor: COLORS.white,
		borderWidth: 1,
		alignItems: 'center',
	},
})