import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

// custom library
import Dancer from '../components/Dancer';
import PositionChecker from '../components/PositionChecker';
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';
import DatabaseScreen from './DatabaseScreen';
import Menu from '../components/Menu';
import MusicPlayer from '../components/MusicPlayer';

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "FormationScreen/";
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];

// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

// 화면의 가로, 세로 길이 받아오기
const {width, height} = Dimensions.get('window');

// if (process.env.NODE_ENV !== 'production') {
//   const {whyDidYouUpdate} = require('why-did-you-update');
//   whyDidYouUpdate(React);
// }

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteInfo: props.route.params.noteInfo,	// {nid, title, date, music, bpm, radiusLevel, coordinateLevel, alignWithCoordinate, stageWidth, stageHeight}
			beat: 1,
			isPlay: false,		// play 중인가?
			isEditing: false,	// <Positionbox>를 편집중인가?
			isMenuPop: false,	// 세팅 모드인가?
			isDBPop: false,		// DB 스크린이 켜져 있는가?
			// dancers: [],
		}
		this.isPlayAnim = false;
		this.dancers = [];
		this.allPosList = [];	// nid, did, beat, posx, posy, duration
		this.dancerList = [];	// nid, did, name
		this.nameColumn = [],
		this.scrollViewStyle;
		this.positionBox = [];
		this.positionBoxTouchZone = [];
		this.listBox = [];
		this.selectedBoxInfo = {posIndex: -1};
		this.boxWidth = 30;
		this.boxHeight = 30;
		this.positionboxWidth = this.boxWidth - 8;
		this.positionboxHeight = this.boxHeight - 8;
		// this.stageWidth = width;
		// this.stageHeight = width * this.state.noteInfo.stageHeight / this.state.noteInfo.stageWidth;
		this.scrollOffset = 0;		// 세로 스크롤 위치

		this.coordinateLevel = this.state.noteInfo.coordinateLevel;
		this.radiusLevel = this.state.noteInfo.radiusLevel;
		this.alignWithCoordinate = this.state.noteInfo.alignWithCoordinate ? true : false;		// 좌표에 맞물려 이동

		this.BEAT_LENGTH = Math.ceil(this.state.noteInfo.musicLength/60*this.state.noteInfo.bpm);

		this.setCoordinate();

		console.log('NOTE INFO', this.state.noteInfo);
	}

	/**
	 * DB_UPDATE('position', 
	 * 	{posx: posx, posy: posy}, 
	 * 	['nid=?', 'did=?', 'beat=?'], 
	 * 	[nid, did, beat]);
	 * @param {string} table 
	 * @param {JSX} set 
	 * @param {array<string>} where 
	 * @param {array} param
	 * @param {*} callback 
	 */
	DB_UPDATE = (table, set, where, param = [], callback = ()=>{}) => {
		console.log(TAG, 'DB_UPDATE');

		let setString = "";
		let whereString = "";

		for(let key in set)
			setString += ", " + key + "=" + set[key];
		
		where.forEach(str => {
			whereString += " AND " + str;
		});
			
		setString = setString.replace(", ", "");
		whereString = whereString.replace(" AND ", "");

		// console.log("UPDATE " + table + " " + "SET " + setString + " " + "WHERE " + whereString + ";");

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
	 * 	['nid=?', 'did=?', 'beat=?'], 
	 * 	[nid, did, beat]);
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

	/** beat box를 초기화하거나 특정 시간을 표시한다.
	 * - if(no param) => initialize
	 * - re-render: NO
	 * - update: this.positionBox(, this.beatBoxs)
	 * @param markedBeat 마크할 비트 (없다면 초기화)
	 */
	setBeatBox = () => {
		console.log(TAG, 'setBeatBox');		

		let beatTexts = [];
		for(let beat=1; beat <= this.BEAT_LENGTH; beat++){
			beatTexts.push(
				<View key={beatTexts.length} style={{flexDirection: 'column', alignItems: 'center'}}>
					{/* ? 비트마다 표시 */}
					{beat%this.state.noteInfo.beatUnit==1 ? 
					<View style={{width: 2, height: 2, backgroundColor: COLORS.grayMiddle, position: 'absolute', top: 5}}/> 
					: <View/>}
					<View style={{width: this.boxWidth, height: this.boxHeight, justifyContent: 'center'}}>
						<Text style={{fontSize: 11, textAlign: 'center'}}>{beat}</Text>
					</View>
					<View style={{height: 10, width: 1, backgroundColor: COLORS.grayMiddle}}/>
				</View>
			)
		}

		this.beatBoxs =
			<View>
				<View style={{flexDirection: 'row', height: this.boxHeight+10, alignItems: 'center'}}>{beatTexts}</View>
				{/* BEAT 터치 박스 */}
				<TouchableOpacity 
				style={{width: this.boxWidth*this.BEAT_LENGTH, height: this.boxHeight+10, position: 'absolute', alignItems: 'center'}}
				onPress={this.onPressBeat}/>
			</View>
	}

	onPressBeat = (event) => {
		const beat = Math.floor(event.nativeEvent.locationX / this.boxWidth) + 1;
		this.setState({beat: beat});
	}

	beatMarker = (markedBeat) =>
	<View
	style={{
		height: this.boxHeight, 
		width: this.boxWidth,
		justifyContent: 'center', 
		alignItems: 'center',
		position: 'absolute',
		left: this.boxWidth/2 + this.boxWidth * (markedBeat-1),
		borderColor: COLORS.grayMiddle, 
		borderRadius: 99, 
		borderWidth: 1,
		}}>
	</View>

	setPositionBoxTouchZone = () => {
		let horizontalLines = [];
		// 세로 기준선들
		for(let beat=1; beat <= this.BEAT_LENGTH; beat++){
			horizontalLines.push(
				<View
				key={horizontalLines.length}
				style={{
					height: this.boxHeight * this.dancerList.length, 
					width: 1, 
					marginHorizontal: (this.boxWidth-1)/2,
					backgroundColor: COLORS.grayMiddle,
				}}/>
			)
		}
		this.positionBoxTouchZone =
			<TouchableOpacity 
			style={{flexDirection: 'row', position: 'absolute', width: this.boxWidth * this.BEAT_LENGTH, height: this.boxHeight * this.dancerList.length}}
			activeOpacity={1}
			onLongPress={(event)=>{
				const did = Math.floor(event.nativeEvent.locationY/this.boxHeight);
				const beat = Math.floor(event.nativeEvent.locationX/this.boxWidth) + 1;
				this.addPosition(did, beat);
			}}>
				{horizontalLines}
			</TouchableOpacity>
	}

	/** did번째 댄서의 music box를 초기화한다.
	 * - re-render: NO
	 * - update: this.positionBox
	 * @param {number} did 
	 * @param {array} posList (default) this.allPosList[did]
	 */
	setPositionBox = (did) => {
		console.log(TAG, 'setPositionBox (', did, ')');
		
		let posList = this.allPosList[did];
		let positionBoxRow = [];

		for(let i=0; i<posList.length; i++){
			// checked box 넣기
			positionBoxRow.push(
				<TouchableOpacity 
				key={positionBoxRow.length}
				onPress={()=>{console.log('SELECT!!!'); this.selectPosition(did, i)}}
				onLongPress={()=>this.deletePosition(did, posList[i].beat)}
				activeOpacity={.8}
				style={{
					alignItems: 'center', 
					justifyContent: 'center', 
					height: this.boxHeight, 
					width: this.boxWidth * (posList[i].duration+1),
					position: 'absolute', left: this.boxWidth * (posList[i].beat - 1), top: this.boxHeight * did}}>
					<View style={[this.styles('checkedBox'), {
						position: 'absolute',
						width: this.positionboxWidth + this.boxWidth * posList[i].duration, 
						backgroundColor: dancerColor[this.dancerList[did].color],
					}]}/>
				</TouchableOpacity>
			)
		}
		
		this.positionBox.splice(did, 1,
			<View 
			key={did}
			style={{flexDirection: 'row', alignItems: 'center', position: 'absolute'}}>
				{positionBoxRow}
			</View>
		)
	}

	/** music box 전체를 초기화한다.
	 * - re-render: NO
	 * - update: this.positionBox(, this.beatBoxs)
	 * @param markedBeat 마크할 시간 (없다면 초기화)
	 */
	setPositionBoxs = () => {
		console.log(TAG, "setPositionBoxs");

		this.positionBox = [];	// 제거된 dancer가 있을 수 있으므로 초기화.

		this.setDancerName();
		this.setBeatBox();
		this.setPositionBoxTouchZone();

		for(let did=0; did<this.dancerList.length; did++)
			this.setPositionBox(did);
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

		const screen = this.getStageSizeOnScreen();

		for(let x=Math.ceil((-screen.width/2)/coordinateSpace)*coordinateSpace; x<screen.width/2; x=x+coordinateSpace){
			for(let y=Math.ceil((-screen.height/2+1)/coordinateSpace)*coordinateSpace; y<screen.height/2; y=y+coordinateSpace){
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

	setDancerName = () => {
		console.log(TAG, "setDancerName: dancerNum = " + this.dancerList.length);
		const dancerNum = this.dancerList.length;
		this.nameColumn = [];	// +10 : beatBox에서 positionbox와의 간격
		for(let i=0; i<dancerNum; i++){
			this.nameColumn.push(
				<View key={this.nameColumn.length} style={{flexDirection: 'row', alignItems: 'center', height: this.boxHeight, width: 60, paddingRight: 1}}>
					<View style={{height: this.boxHeight-3, width: 3, backgroundColor: dancerColor[this.dancerList[i].color],}}/>
					<Text style={{fontSize: 11, minWidth: 14, textAlign: 'center', color: COLORS.grayMiddle}}>{i+1+' '}</Text>
					{ this.dancerList[i].name=='' ?
					<Text style={{fontSize: 11, width: 42, color: COLORS.grayMiddle}} numberOfLines={1}>이름없음</Text>
					:
					<Text style={{fontSize: 11, width: 42, color: COLORS.blackDark}} numberOfLines={1}>{this.dancerList[i].name}</Text>
					}
				</View>
			)
		}
		if(dancerNum == 0){
			this.nameColumn.push(
				<View key={0} style={{flexDirection: 'row', alignItems: 'center', height: this.boxHeight, width: 60, paddingRight: 1}}>
					<View style={{height: this.boxHeight-3, width: 3, backgroundColor: COLORS.grayMiddle}}/>
					<Text style={{fontSize: 11, minWidth: 14, textAlign: 'center', color: COLORS.grayMiddle}}>{0+' '}</Text>
					<Text style={{fontSize: 11, width: 42, color: COLORS.grayMiddle}} numberOfLines={1}>댄서 없음</Text>
				</View>
			)
		}
	}

	/** 댄서들 이름과 <Dancer>들을 설정한다.
	 * - re-render: YES ( setState )
	 * - update: dancers, nameColumn
	 */
	setDancer = (isPlayAnim = this.isPlayAnim) => {
		console.log(TAG, "setDancer(", isPlayAnim, ')');
		
		const dancerNum = this.dancerList.length;
		const radiusLength = 8 + this.radiusLevel * 2;

		let _dancers = [];
		
		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer
				key={_dancers.length}
				did={i}
				isSelected={this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == i ? true : false}
				curBeat={this.state.beat}
				bpm={this.state.noteInfo.bpm}
				sync={this.state.noteInfo.sync}
				posList={[...this.allPosList[i]]} 
				dropPosition={this.dropPosition}
				isPlay={isPlayAnim}
				radiusLength={radiusLength}
				alignWithCoordinate={this.alignWithCoordinate}
				coordinateLevel={this.coordinateLevel}
				color={this.dancerList[i].color}
				stageWidth={this.stageWidth}
				stageHeight={this.stageHeight}
				/>
			)
		}
		// this.setState({dancers: _dancers});
		this.dancers = _dancers;
	}
	
	/** <Dancer>에서 드래그 후 드랍한 위치 정보로 position DB에 추가/수정한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did  dancer id
	 * @param posx 드랍한 x 좌표
	 * @param posy 드랍한 y 좌표
	 * @param beat 시간
	 */
  dropPosition = (did, posx, posy, beat = this.state.beat) => {
    console.log(TAG + "dropPosition");
		
		// state 업데이트
		let newPos = {did: did, posx: posx, posy: posy, beat: beat, duration: 0};
		let posList = this.allPosList[did];	// 참조 형식

		for(var i=0; i<posList.length; i++){	// for문 밖에서도 사용하므로 let이 아닌 var
			// 0번째보다 이전 시간인 경우는 존재하지 않는다. 드래그할 수 없게 막았기 때문.

			// i번째 box에 속한 경우: UPDATE
			if(posList[i].beat <= beat && beat <= posList[i].beat + posList[i].duration){
				// selected box인 경우
				if(this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == did && this.selectedBoxInfo.beat == posList[i].beat){
					this.selectedBoxInfo.posx = posx;
					this.selectedBoxInfo.posy = posy;
				}
				newPos = {...newPos, beat: posList[i].beat, duration: posList[i].duration};
				posList.splice(i, 1, newPos);
				this.DB_UPDATE('position', {posx: posx, posy: posy}, ['nid=?', 'did=?', 'beat=?'], [this.state.noteInfo.nid, did, posList[i].beat]);
				this.setPositionBox(did);
				this.forceUpdate();
				return;
			}
			// 어떤 box에도 속하지 않은 경우: INSERT
			else if(beat < posList[i].beat)
				break;
		}
		// 모든 박스를 확인하고 for문을 나온 경우: INSERT
		posList.splice(i, 0, newPos);
		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, beat: beat, posx: posx, posy: posy, duration: 0})
		this.setPositionBox(did);
		this.forceUpdate();
	}

	/** 기존 저장되어 있는 값들을 기반으로 position DB에 좌표를 추가한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did dancer id
	 * @param beat 추가할 좌표의 beat 값
	 */
	addPosition = (did, beat) => {
		console.log(TAG, "addPosition(did:",did,"beat:",beat,")");

		// beat에 맞는 위치 구하기
		let posList = this.allPosList[did];
		let posx;
		let posy;
		let i=0;	// 추가될 위치 index

		// 리스트에 아무것도 없는 경우
		if(posList.length == 0){
			posx = 0;
			posy = 0;
		}
		else{
			// 들어갈 index 찾기
			for(; i<posList.length; i++){
				if(beat < posList[i].beat)
					break;
			}
			// 맨 앞에 추가하는 경우
			if(i == 0){
				posx = posList[0].posx;
				posy = posList[0].posy;
			}
			// 맨 뒤에 추가하는 경우
			else if(i == posList.length) {
				posx = posList[i-1].posx;
				posy = posList[i-1].posy;
			}
			// 중간에 추가하는 경우
			else{
				const dx = (posList[i].posx - posList[i-1].posx) * (beat - posList[i-1].beat) / (posList[i].beat - posList[i-1].beat)
				const dy = (posList[i].posy - posList[i-1].posy) * (beat - posList[i-1].beat) / (posList[i].beat - posList[i-1].beat)
				posx = posList[i-1].posx + dx;
				posy = posList[i-1].posy + dy;
				posx = Math.round(posx);
				posy = Math.round(posy);
			}
		}
		posList.splice(i, 0, {did: did, posx: posx, posy: posy, beat: beat, duration: 0});

		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, beat: beat, posx: posx, posy: posy, duration: 0});
		this.setPositionBox(did);
		this.forceUpdate();	// 추가해서 댄서가 active될 수 있으므로.
	}

	/** position DB에서 선택한 값을 삭제한다.
	 * - selected position은 삭제할 수 없으므로 검사할 필요는 없음
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did dancer id
	 * @param beat 삭제할 좌표의 beat 값
	 */
	deletePosition = (did, beat) => {
		console.log(TAG, "deletePosition(",did,beat,")");

		let posList = this.allPosList[did];
		for(let i=0; i<posList.length; i++){
			if(beat == posList[i].beat){
				posList.splice(i, 1);
				break;
			}
		}

		this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'beat=?'], 
	  	[this.state.noteInfo.nid, did, beat]);

		this.setPositionBox(did);
		this.forceUpdate();
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
		this.DB_UPDATE('note', {coordinateLevel: this.coordinateLevel}, ['nid=?'], [this.state.noteInfo.nid]);
		this.setCoordinate();
		this.forceUpdate();	// dancer에게 coordinateLevel 전달하기 위해
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
		this.DB_UPDATE('note', {radiusLevel: this.radiusLevel}, ['nid=?'], [this.state.noteInfo.nid]);
		this.forceUpdate();
	}

	resizePositionList = (type) => {
		console.log(TAG, 'resizePositionList');

		switch(type){
			case 'expand':
				if(this.boxWidth < 40){
					this.boxWidth += 2;
					this.positionboxWidth += 2;
					this.setPositionBox();
					this.forceUpdate();
					break;
				}
				return;
				
			case 'reduce':
				if(this.boxWidth > 20){
					this.boxWidth -= 2;
					this.positionboxWidth -= 2;
					this.setPositionBoxs();
					this.forceUpdate();
					break;
				}
				return;
				
			default:
				console.log('Wrong parameter...');
		}
	}

	/** <DancerScreen>에서 수정된 정보를 적용한다.
	 * - re-render: YES ( setDancer )
	 * - update: this.dancerList, this.allPosList / this.positionBox / dancers, nameColumn
	 * @param {array} _dancerList 변경된 dancerList
	 * @param {array} _allPosList 변경된 allPosList
	 */
	changeDancerList = (_dancerList, _allPosList) => {
		console.log(TAG, 'changeDancerList');
		this.dancerList = [..._dancerList];
		this.allPosList = [..._allPosList];
		this.setPositionBoxs();
		this.forceUpdate();
	}
	
	/** position box 하나를 선택한다.
	 * - re-render: YES ( setDancer )
	 * - update: this.selectedBoxInfo, musicbox
	 * - setPositionBox()
	 * @param {number} did 
	 * @param {number} posIndex 
	 */
	selectPosition = (did, posIndex) => {
		console.log(TAG, 'selectPosition(', did, posIndex, ')');

		// 선택되어 있던 것 제거
		if(this.selectedBoxInfo.posIndex != -1)	this.unselectPosition();
		
		// {color: 1, did: 0, duration: 11, name: 견우, posx: -30, posy: 0, beat: 0}
		this.selectedBoxInfo = {...this.dancerList[did], ...this.allPosList[did][posIndex], posIndex: posIndex}
		this.forceUpdate();	// 선택된 댄서 아이콘 보여주기 위해
	}

	/**
	 * 선택되어 있는 position box을 선택 취소한다.
	 * - re-render: YES ( setDancer )
	 * - update: musicbox
	 * - setPositionBox()
	 */
	unselectPosition = () => {
		console.log(TAG, 'unselectPosition');
		this.selectedBoxInfo.posIndex = -1;
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
	 * @param {number} beat 수정되기 전 initial beat
	 * @param {number} did 
	 */
	resizePositionboxLeft = (doUpdate, duration, beat = this.selectedBoxInfo.beat, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionboxLeft(", doUpdate, duration, beat, did, ')');
		/**
		 * posList = [...this.allPosList[did]]
		 *  
		 * JSX 표현은 '참조 형식'이라 같은 값을 가리킨다. (포인터 개념)
		 * posList 변경시 allPosList의 값도 바뀐다.
		 * 
		 * 따라서 JSON.parse 를 사용하여 값을 복사해준다.
		 */
		let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		
		// 변경했을 때 시간이 1보다 작아지는 것을 방지하기 위해
		// 변경 후 시간을 계산
		for(let i=0; i<posList.length; i++){
			if(posList[i].beat == beat){
				const leftEndBeat = beat + posList[i].duration - duration;
				if(leftEndBeat < 1) {
					console.log(TAG, '왼쪽 끝이에요.');
					return;
				}
				break;
			}
		}

		// 바뀐 posIndex 구하기
		let i = 0;
		for(; ; i++){
			console.log(this.selectedBoxInfo.beat, '<=', posList[i].beat, '<', beat);

			// 바뀌기 전 시간 이상인 경우: 무시 (break)
			// [i]번째 == 선택된 positionbox의 정보
			if(beat <= posList[i].beat) break;

			// 바뀐 시간보다 작은 경우: 무시 (continue)
			if(posList[i].beat + posList[i].duration < this.selectedBoxInfo.beat) continue;

			// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
			if(posList[i].beat < this.selectedBoxInfo.beat) {
				posList[i].duration = this.selectedBoxInfo.beat - posList[i].beat - 1;
				continue;
			}
			// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
			posList.splice(i, 1);
			i--;
		}
		this.selectedBoxInfo.posIndex = i;
		this.selectedBoxInfo.beat -= (duration - this.selectedBoxInfo.duration);	// ++ or --
		this.selectedBoxInfo.duration = duration;

		if(!doUpdate){
			this.forceUpdate();
		}

		// update DB & allPosList
		else{
			this.DB_DELETE('position', 
				['nid=?', 'did=?', 'beat>=?', 'beat<?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.beat, beat],
				()=>{
					this.DB_UPDATE('position', 
					{duration: duration, beat: this.selectedBoxInfo.beat}, 
					['nid=?', 'did=?', 'beat=?'], 
					[this.state.noteInfo.nid, did, beat]);
				}
			);
			let i = 0;
			for(; ; i++){
				console.log(this.selectedBoxInfo.beat, '<=', this.allPosList[did][i].beat, '<', beat)

				// 바뀌기 전 시간 이상인 경우: 무시 (break)
				// [i]번째 == 선택된 positionbox의 정보
				if(this.allPosList[did][i].beat >= beat) break;

				// 바뀐 시간보다 작은 경우: 무시 (continue)
				if(this.allPosList[did][i].beat + this.allPosList[did][i].duration < this.selectedBoxInfo.beat) continue;

				// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
				if(this.allPosList[did][i].beat < this.selectedBoxInfo.beat) {
					const reducedDuration = this.selectedBoxInfo.beat - this.allPosList[did][i].beat - 1;
					this.allPosList[did][i].duration = reducedDuration;
					this.DB_UPDATE('position', 
					{duration: reducedDuration}, 
					['nid=?', 'did=?', 'beat=?'], 
					[this.state.noteInfo.nid, did, this.allPosList[did][i].beat]);
					continue;
				}
				// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
				// duration을 늘린 결과로 덮여진 box를 지운다.
				this.allPosList[did].splice(i, 1);
				i--;
			}	
			console.log(i, '번째에 선택된 정보가 있다!');
			this.allPosList[did][i].beat = this.selectedBoxInfo.beat;
			this.allPosList[did][i].duration = duration;
			this.setPositionBox(did);
			this.forceUpdate();
		}
	}

	resizePositionboxRight = (doUpdate, duration = this.selectedBoxInfo.duration, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionboxRight(", doUpdate, duration, did, ')');
		
		const rightEndBeat = this.selectedBoxInfo.beat + duration;
		if(this.state.noteInfo.musicLength/60*this.state.noteInfo.bpm < rightEndBeat) {
			console.log(TAG, '오른쪽 끝이에요.');
			return;
		}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.duration = duration;
		
		if(!doUpdate){
			this.forceUpdate();
		}

		// if(!doUpdate){
		// 	let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		// 	posList[this.selectedBoxInfo.posIndex].duration = duration;

		// 	// 댄서의 각 checked box 에 대해서...
		// 	for(let i = this.selectedBoxInfo.posIndex + 1; i<posList.length; i++){
		// 		// 시간이 바뀐 길이보다 큰 경우: 무시 (break)
		// 		if(rightEndBeat < posList[i].beat) break;

		// 		// 시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우: beat++ && duration--
		// 		if(rightEndBeat < posList[i].beat + posList[i].duration){
		// 			posList[i].duration -= (rightEndBeat + 1 - posList[i].beat);
		// 			posList[i].beat = rightEndBeat + 1;
		// 			break;
		// 		}
		// 		// 바뀐 길이에 완전히 덮여버린 경우: 삭제 (splice)
		// 		posList.splice(i, 1);
		// 		i--;
		// 	}
		// 	this.posList = posList; 	// for DB debug
		// 	this.setPositionBox(did, posList);
		// 	this.forceUpdate();
		// }

		// update DB & allPosList
		else{
			this.allPosList[did][this.selectedBoxInfo.posIndex].duration = duration;

			this.DB_UPDATE('position', 
				{duration: duration}, 
				['nid=?', 'did=?', 'beat=?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.beat]);
			
			this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'beat>?', 'beat+duration<=?'], 
	  	[this.state.noteInfo.nid, did, this.selectedBoxInfo.beat, rightEndBeat]);

			console.log('selectedPositionIdx', this.selectedBoxInfo.posIndex, this.allPosList[did].length);
			// 댄서의 각 checked box 에 대해서...
			for(let i = this.selectedBoxInfo.posIndex + 1; i<this.allPosList[did].length; i++){

				console.log(rightEndBeat, '\n', this.allPosList[did][i].beat, '\n', this.allPosList[did][i].duration)

				// 시간이 바뀐 길이보다 큰 경우: 무시 (break)
				if(rightEndBeat < this.allPosList[did][i].beat) break;

				// 시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우: beat++ && duration--
				if(rightEndBeat < this.allPosList[did][i].beat + this.allPosList[did][i].duration){
					console.log('시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우');
					
					const originBeat = this.allPosList[did][i].beat;
					this.allPosList[did][i].duration -= (rightEndBeat + 1 - originBeat);
					this.allPosList[did][i].beat = rightEndBeat + 1;

					console.log(originBeat, '->', this.allPosList[did][i].beat, this.allPosList[did][i].beat)

					this.DB_UPDATE('position', 
						{duration: this.allPosList[did][i].duration, beat: this.allPosList[did][i].beat}, 
						['nid=?', 'did=?', 'beat=?'], 
						[this.state.noteInfo.nid, did, originBeat]);
					break;
				}
				// 바뀐 길이에 완전히 덮여버린 경우: 삭제 (splice)
				this.allPosList[did].splice(i, 1);
				i--;
			}
			this.setPositionBox(did);
			this.forceUpdate();
		}
	}

	/**
	 * 
	 * @param {boolean} doUpdate 
	 * @param {number} to 
	 * @param {number} from 
	 * @param {number} did 
	 */
	movePositionbox = (doUpdate, to, from = this.selectedBoxInfo.beat, did = this.selectedBoxInfo.did) => {
		console.log(TAG, 'movePositionbox (', doUpdate, to, from, did, ')');

		if(to < 1 || this.state.noteInfo.musicLength/60*this.state.noteInfo.bpm < to + this.selectedBoxInfo.duration) return;

		let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		let myPosInfo;
		let shouldDelete = [];	// 삭제 되어야 할 position의 beat
		let shouldUpdate = [];	// 업데이트 되어야 할 position의 [beat, {updated_value}]
		let shouldInsert = [];	// 새로 생성 되어야 할 position의 {inserted_value}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.beat = to;

		// 댄서의 각 checked box 에 대해서...
		const rightEndBeat = this.selectedBoxInfo.beat + this.selectedBoxInfo.duration;

		let findIndex = false;

		for(let i=0; i<posList.length; i++){
			console.log('FOR-LOOP::', i);
			// 자기 자신 정보를 저장해놓고 삭제
			if(posList[i].beat == from){
				console.log('case 1: 자기 자신 제거');
				myPosInfo = {...posList.splice(i, 1)[0], beat: to};
				shouldDelete.push(from);
				i--;
				continue;
			}

			// selected box 왼쪽 끝보다 뒤에 있는 경우: 무시 (continue)
			if(posList[i].beat + posList[i].duration < this.selectedBoxInfo.beat) {
				console.log('case 2: 뒤에 있는 경우 무시');
				continue;
			}

			// 시작 시간이 뒤에 있는 경우
			if(posList[i].beat < this.selectedBoxInfo.beat){
				// 시작 시간은 뒤에 있으나 조금 잘리는 경우: duration 줄이기
				if(posList[i].beat + posList[i].duration <= rightEndBeat){
					console.log('case 3-1: 시작 시간은 뒤에 있으나 조금 잘리는 경우 duration 줄이기');
					posList[i].duration = this.selectedBoxInfo.beat - posList[i].beat - 1;
					shouldUpdate.push([posList[i].beat, {duration: posList[i].duration}]);
					continue;
				}
				// 시작 시간은 뒤에 있으나 중간에 잘리는 경우: 둘로 나누기
				else{
					console.log('case 3-2: 시작 시간은 뒤에 있으나 중간에 잘리는 경우 둘로 나누기');
					const newPos = {...posList[i], beat: rightEndBeat+1, duration: posList[i].duration+posList[i].beat-rightEndBeat-1};
					posList[i].duration = this.selectedBoxInfo.beat - posList[i].beat - 1;
					posList.splice(i+1, 0, newPos);
					shouldUpdate.push([posList[i].beat, {duration: posList[i].duration}]);
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
			if(this.selectedBoxInfo.beat <= posList[i].beat && posList[i].beat + posList[i].duration <= rightEndBeat){
				console.log('case 4: 완전히 포개진 경우 삭제');
				shouldDelete.push(posList[i].beat);
				posList.splice(i, 1);
				i--;
				continue;
			}

			// 시작 시간은 포함되지만 duration을 줄이면 되는 경우: beat 증가 && duration 감소
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 뒤에 있을 수도 있으니 break 하지 않는다.
			if(this.selectedBoxInfo.beat <= posList[i].beat && posList[i].beat <= rightEndBeat  && rightEndBeat < posList[i].beat + posList[i].duration){
				console.log('case 5: 시작 시간은 포함되지만 duration을 줄이면 되는 경우: beat 증가 && duration 감소');
				
				posList[i].duration -= (rightEndBeat + 1 - posList[i].beat);
				shouldUpdate.push([posList[i].beat, {beat: rightEndBeat + 1, duration: posList[i].duration}]);
				posList[i].beat = rightEndBeat + 1;
				if(!findIndex) {
					console.log('FIND INDEX::', i);
					this.selectedBoxInfo.posIndex = i;
					findIndex = true;
				}
				continue;
			}

			// 시간이 바뀐 길이보다 큰 경우: 무시 (continue)
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 뒤에 있을 수도 있으니 break 하지 않는다.
			if(rightEndBeat < posList[i].beat) {
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
			// this.setPositionBox(did, posList);
			this.forceUpdate();
		}
		else{
			shouldDelete.forEach(beat => {
				this.DB_DELETE('position', ['nid=?', 'did=?', 'beat=?'], [this.state.noteInfo.nid, did, beat]);
			});
			shouldUpdate.forEach(([beat, set]) => {
				this.DB_UPDATE('position', set, ['nid=?', 'did=?', 'beat=?'], [this.state.noteInfo.nid, did, beat]);
			});
			shouldInsert.forEach(value => {
				this.DB_INSERT('position', {...value, nid: this.state.noteInfo.nid});
			});

			this.allPosList[did] = posList;
			this.setPositionBox(did);
			this.forceUpdate();
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
		this.forceUpdate();
	}
	
	closeDBScreen = () => {
		this.setState({isDBPop: false});
	}

	editBeat = (text) => {
		/**
		 * JavaScript에는 replaceAll 함수가 없다. 
		 * 따라서 정규식을 사용해 replace으로 replaceAll의 효과를 사용했다.
		 * 
		 * text.replaceAll(' ', '') => text.replace(/ /gi, '')
		 * g: 발생할 모든 pattern에 대한 전역 검색
		 * i: 대/소문자 구분 안함
		 * m: 여러 줄 검색
		 */
		text = text.replace(/ /gi, '');
		const beat = Number(text);

		// 변경
		if(!isNaN(beat) && text!='' && beat>=0){
			this.movePositionbox(true, beat);
		}
		else{
			Alert.alert("취소", "올바르지 않은 형식입니다.");
		}
	}

	editDuration = (text) => {
		text = text.replace(/ /gi, '');

		if(!isNaN(Number(text)) && text != '' && Number(text) >= 0)
			this.resizePositionboxRight(true, Math.round( Number(text) ));
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	editX = (text) => {
		text = text.replace(/ /gi, '');
		if(!isNaN(Number(text)) && text != ''){
			let posx = Math.round(Number(text));
			posx = Math.abs(posx) > Math.floor(width/2) ? Math.floor(width/2) * Math.sign(posx) : posx;
			this.DB_UPDATE('position', 
				{posx: posx}, 
				['nid=?', 'did=?', 'beat=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.beat]);
			this.selectedBoxInfo.posx = posx;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posx = posx;
			this.forceUpdate();
		}
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	editY = (text) => {
		text = text.replace(/ /gi, '');
		if(!isNaN(Number(text)) && text != ''){
			let posy = Math.round(Number(text));
			posy = Math.abs(posy) > Math.floor(this.stageHeight/2) ? Math.floor(this.stageHeight/2) * Math.sign(posy) : posy;
			this.DB_UPDATE(
				'position', 
				{posy: posy}, 
				['nid=?', 'did=?', 'beat=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.beat]);

			this.selectedBoxInfo.posy = posy;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posy = posy;
			this.forceUpdate();
		}
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	selectView = () => {
		const isSelected = this.selectedBoxInfo.posIndex == -1 ? false : true;

		return (
			<View style={styles.selectContainer}>

				{/* <Text style={styles.selectText}>idx:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editBeat(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.posIndex : ''}
				</TextInput> */}

				<Text style={styles.selectText}>시작:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editBeat(event.nativeEvent.text)}>
					{/* {isSelected ? this.timeFormat(this.selectedBoxInfo.beat) : ''} */}
					{isSelected ? this.selectedBoxInfo.beat : ''}
				</TextInput>

				<Text style={styles.selectText}>  길이:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editDuration(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.duration : ''}</TextInput>
				<Text style={styles.selectText}>  X:</Text>

				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editX(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.posx : ''}</TextInput>

				<Text style={styles.selectText}>  Y:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editY(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.posy : ''}</TextInput>
			</View>
		)
	}

	editMusic = () => {
		console.log('edit Music');
		for(let did=0; did<this.allPosList.length; did++){
			for(let i=0; i<this.allPosList[did].length; i++){
				console.log("INSERT INTO position VALUES (0, "+did+", "+this.allPosList[did][i].beat+", "+this.allPosList[did][i].posx+", "+this.allPosList[did][i].posy+", "+this.allPosList[did][i].duration+");");
			}
		}
	}

	menuView = () =>
	<ScrollView horizontal={true} bounces={false} decelerationRate={0} showsHorizontalScrollIndicator={false}
	style={{flexDirection: 'row', maxHeight: 70}}>

		<TouchableOpacity 
		activeOpacity={1} style={styles.menuButton}
		onPress={() => {
			if(this.state.isPlay) { return; }
			this.props.navigation.navigate('Dancer', {
				noteId: this.state.noteInfo.nid, 
				dancerList: this.dancerList, 
				allPosList: this.allPosList, 
				changeDancerList: this.changeDancerList,
			});
		}}>
			<CustomIcon name='edit-dancer' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>댄서</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizePositionList('reduce')} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='box-width-down' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>표간격 좁게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizePositionList('expand')} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='box-width-up' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>표간격 넓게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={this.changeAlignWithCoordinate} activeOpacity={1} style={styles.menuButton}>
			<View style={{alignItems: 'center', justifyContent: 'center'}}>
				<CustomIcon name='align-with-coordinate' size={30} color={COLORS.grayMiddle}/>
				<Text style={{position: 'absolute', color: COLORS.white, fontSize: 10}}>{this.alignWithCoordinate ? 'ON' : 'OFF'}</Text>
			</View>
			<Text style={styles.menuText}>좌표맞추기</Text>
		</TouchableOpacity>	

		<TouchableOpacity onPress={()=>this.resizeDancer('down')} activeOpacity={1} style={styles.menuButton}>
			<View style={{alignItems: 'center', justifyContent: 'center'}}>
				<CustomIcon name='dancer-down' size={30} color={COLORS.grayMiddle}/>
				<Text style={{position: 'absolute', color: COLORS.white, fontSize: 12}}>{this.radiusLevel}</Text>
			</View>
			<Text style={styles.menuText}>댄서 작게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizeDancer('up')} activeOpacity={1} style={styles.menuButton}>
			<View style={{alignItems: 'center', justifyContent: 'center'}}>
				<CustomIcon name='dancer-up' size={30} color={COLORS.grayMiddle}/>
				<Text style={{position: 'absolute', color: COLORS.white, fontSize: 14}}>{this.radiusLevel}</Text>
			</View>
			<Text style={styles.menuText}>댄서 크게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizeCoordinate('down')} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='coordinate-narrow' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>좌표 좁게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizeCoordinate('up')} activeOpacity={1} style={styles.menuButton}>
		<View style={{alignItems: 'center', justifyContent: 'center'}}>
				<CustomIcon name='coordinate-wide' size={30} color={COLORS.grayMiddle}/>
				<Text style={{position: 'absolute', color: COLORS.grayMiddle, fontSize: 14}}>{this.coordinateLevel}</Text>
			</View>
			<Text style={styles.menuText}>좌표 넓게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={this.editMusic} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='edit-music' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>노래 편집</Text>
		</TouchableOpacity>	

	</ScrollView>

	editTitle = (newTitle) => {
		console.log(TAG, 'editTitle');
		this.setState({noteInfo: {...this.state.noteInfo, title: newTitle}});
		this.DB_UPDATE('note', {title: '\"'+newTitle+'\"'}, ['nid=?'], [this.state.noteInfo.nid]);
	}

	onPlaySubmit = (time, beat, isPlay = this.state.isPlay) => {
		console.log(TAG, 'onPlaySubmit(', time, beat, isPlay, ')');
		this.positionBoxScrollHorizontal.scrollTo({x: (beat-1)*this.boxWidth, animated: false});

		// <Dancer> 애니메이션 시작
		if(isPlay != this.isPlayAnim){
			this.setDancer(isPlay);
			this.isPlayAnim = isPlay;
		}

		this.setState({beat: beat, isPlay: isPlay});
	}

	getStageSizeOnScreen = () => {
		let screenWidth = width;
		let screenHeight = width * this.state.noteInfo.stageHeight / this.state.noteInfo.stageWidth;
		if(screenHeight > height/3){
			console.log(screenHeight, '>', height/3);
			screenHeight = height/3;
			screenWidth = height/3 * this.state.noteInfo.stageWidth / this.state.noteInfo.stageHeight;
		}

		return {width: screenWidth, height: screenHeight};
	}

	componentDidMount() {
		console.log(TAG, "componentDidMount");

		this.dancerList = [];
		this.allPosList = [];

		this.state.db.transaction(txn => {
      txn.executeSql(
				"SELECT * " +
				"FROM dancer " +
				"WHERE nid=?;",
        [this.state.noteInfo.nid],
        (tx, dancerResult) => {
					console.log(TAG, 'DB SELECT SUCCESS!');
					for (let i = 0; i < dancerResult.rows.length; i++) {
						this.dancerList.push(dancerResult.rows.item(i)); // {did, name, color}
					}

					this.state.db.transaction(txn => {
						txn.executeSql(
							"SELECT * " +
							"FROM position " +
							"WHERE nid=? " +
							"ORDER BY did, beat;",
							[this.state.noteInfo.nid],
							(tx, posResult) => {
								console.log(TAG, 'DB SELECT SUCCESS!');

								let i=0; // i: posResult.rows 의 index
								for(let did=0; did<this.dancerList.length; did++){
									let posList = [];
									for(; i<posResult.rows.length; i++){
										// did가 같은 정보들을 가져온다.
										if(posResult.rows.item(i).did == did)
											posList.push(posResult.rows.item(i));
										// 다음 댄서로 넘어간다.
										else break;
									}
									// 다음 댄서로 넘어가기 전, 정보들을 저장한다.
									this.allPosList.push(posList);
								}
								this.setPositionBoxs();
								this.forceUpdate();
							},
							() => {console.log(TAG, 'DB SELECT ERROR');}
						);
					});
				},
				() => {console.log(TAG, 'DB SELECT ERROR');}
			)
		});
	}

	componentWillUnmount() {
		console.log(TAG, "componentWillUnmount");
		this.setState({isPlay: false});
		this.props.route.params.updateNoteList(this.state.noteInfo);
	}

	render() {
		console.log(TAG, "render");
		console.log(TAG, "isPlayAnim:", this.isPlayAnim);

		// this.setDancer();
		if(!this.state.isPlay){
			this.setDancer();
			this.isPlayAnim = false;
		}

		return(
			<SafeAreaView style={{flex: 1, flexDirection: 'column'}}>
			<View style={{flex: 1}}>

				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}} style={styles.toolbarButton}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<TextInput style={styles.toolbarTitle} onEndEditing={(event)=>this.editTitle(event.nativeEvent.text)}>{this.state.noteInfo.title}</TextInput>
					
					<TouchableOpacity onPress={()=>{this.setState({isMenuPop: !this.state.isMenuPop})}} style={styles.toolbarButton}>
						<IconIonicons name={this.state.isMenuPop ? "ios-arrow-up" : "ios-menu"} size={24} color="#ffffff"/>
					</TouchableOpacity>
				</View>
				
				{/* 무대 및 댄서 */}
				<View style={{width: width, height: height/3, alignItems: 'center', justifyContent: 'center'}}>
					<View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: COLORS.grayLight}}/>
					<View style={[this.getStageSizeOnScreen(), {backgroundColor: COLORS.white}]}/>
					{ this.coordinate }
					{ this.dancers }
				</View>

				{/* 노래 플레이어 */}
				<MusicPlayer
				noteInfo={this.state.noteInfo}
				onPlaySubmit={this.onPlaySubmit}
				beat={this.state.beat}/>

				<View flex={1}>
					{/* 선택한 POSITION 정보 */}
					{this.selectView()}

					<View flexDirection='row' style={{flex: 1}}>
						<View flexDirection='column'>
							
							{/* dancer 이름 리스트 위 공백 */}
							<View style={{height: this.boxHeight + 10}}/>

							{/* dancer 이름 */}
							<ScrollView
							bounces={false}						// 오버스크롤 막기 (iOS)
							decelerationRate={0}			// 스크롤 속도 (iOS)
							showsVerticalScrollIndicator={false}
							ref={ref => (this.nameScroll = ref)}
							scrollEventThrottle={16}
							// music box list와 동시에 움직이는 것처럼 보이기 위해 scrollTo의 animated를 false로 한다.
							onScroll={event => this.positionBoxScrollVertical.scrollTo({y: event.nativeEvent.contentOffset.y, animated: false})}
							// onScrollEndDrag={event => {
							// 	// ceil로 한 이유: floor/round로 하면 맨 마지막 항목이 일부 짤리는 경우가 생길 수 있다.
							// 	this.scrollOffset = Math.ceil(event.nativeEvent.contentOffset.y/this.boxHeight) * this.boxHeight;
							// 	this.nameScroll.scrollTo({y: this.scrollOffset});
							// 	this.positionBoxScrollVertical.scrollTo({y: this.scrollOffset});}}
							>
								<View style={{flexDirection: 'column'}}>
									{ this.nameColumn }
								</View>
							</ScrollView>
						</View>

						{/* BEAT + POSITION */}
						<ScrollView 
						horizontal={true}
						bounces={false} 					// 오버스크롤 막기 (iOS)
						decelerationRate={0.5}		// 스크롤 속도 (iOS)
						scrollEnabled={!this.state.isEditing}
						showsHorizontalScrollIndicator={false}
						ref={ref => (this.positionBoxScrollHorizontal = ref)}>

							<ScrollView
							bounces={false} 						// 오버스크롤 막기 (iOS)
							stickyHeaderIndices={[0]}		// 0번째 View (BEAT 숫자) 고정
							// scrollEnabled={false}				// 스크롤 막기
							showsVerticalScrollIndicator={false}
							ref={ref => (this.positionBoxScrollVertical = ref)}
							scrollEventThrottle={16}
							onScroll={event => this.nameScroll.scrollTo({y: event.nativeEvent.contentOffset.y, animated: false})}>

								{/* BEAT 숫자 표시 */}
								<View flexDirection='row' style={{backgroundColor: COLORS.grayLight}}>
									<View style={{width: this.boxWidth/2}}/>
									{ this.beatBoxs }
									{ this.beatMarker(this.state.beat) }
									<View style={{width: this.boxWidth/2}}/>
								</View>

								{/* POSITION 박스들 */}
								<View style={{flexDirection: 'row', paddingHorizontal: this.boxWidth/2, height: this.boxHeight * this.dancerList.length}}>
									{/* <View style={{width: this.boxWidth/2}}/> */}
									<View>
										{ this.positionBoxTouchZone }
										<View flexDirection='column'>
											{ this.positionBox }
										</View>
									</View>
									{/* <View style={{width: this.boxWidth/2}}/> */}
								</View>

							</ScrollView>

							<PositionChecker
							boxWidth={this.boxWidth}
							boxInfo={this.selectedBoxInfo}
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
								// borderWidth: 2,
								// borderColor: COLORS.red,
								// borderRadius: 5,
								left: this.boxWidth * (this.selectedBoxInfo.beat - 1),
								top: (this.boxHeight + 10) + this.boxHeight * this.selectedBoxInfo.did,
							}}
							boxStyle={[this.styles('checkedBox'), {
								width: this.positionboxWidth + this.boxWidth * this.selectedBoxInfo.duration,
								backgroundColor: COLORS.green,
							}]}
							buttonStyle={{height: this.boxHeight, width: this.boxWidth/2,  backgroundColor: COLORS.green, borderRadius: 5}}
							/>
							{/* {this.positionChecker()} */}
							{/* { this.selectedBoxInfo.posIndex != -1 ? this.positionChecker() : <View/> } */}

						</ScrollView>
					</View>

					{/* 하단 메뉴 */}
					{this.menuView()}

					{/* PLAY 중일 때 터치 막는 VIEW */}
					{this.state.isPlay ?
					<View style={{width: '100%', height: '100%', position: 'absolute', backgroundColor: '#00000099'}}/>
					: <View/>}
				</View>

				{/* 팝업 메뉴 */}
				{ this.state.isMenuPop ? 
				<Menu
				closeMenu={()=>{this.setState({isMenuPop: false})}}
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
			// case 'uncheckedBox':
			// 	return({
			// 		height: this.boxHeight, 
			// 		width: 1, 
			// 		marginHorizontal: (this.boxWidth-1)/2, 
			// 		backgroundColor: COLORS.grayMiddle,
			// 	})
			case 'checkedBox':
				return({
					height: this.positionboxHeight, 
					width: this.positionboxWidth, 
					borderRadius: this.positionboxWidth/2,
				})
			case 'beatBox': 
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
		// paddingHorizontal: 20,
	},
	toolbarTitle: {
		color:COLORS.white, 
		fontSize: 15,
	},
	toolbarButton: {
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	menuButton: {
		flexDirection: 'column',
		width: 70,
		height: 70,
		alignItems: 'center',
		justifyContent: 'center',
	},
	menuText: {
		fontSize: 10,
		textAlign: 'center',
		color: COLORS.grayMiddle,
	},
	selectContainer: {
		flexDirection: 'row', 
		width:'100%', 
		height:50,
		alignItems: 'center',
		backgroundColor:COLORS.grayLight, 
		padding: 10,
	},
	selectText: {
		fontSize: 12,
		textAlign: 'left',
		color: COLORS.grayMiddle,
		paddingLeft: 3,
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
})