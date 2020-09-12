import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
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
import TimeMarker from '../components/TimeMarker';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

// 화면의 가로, 세로 길이 받아오기
const {width, height} = Dimensions.get('window');
const BOX_WIDTH_MIN = 1;
const BOX_WIDTH_MAX = 16;
const BOX_HEIGHT_MIN = 30;
const fps = 12;

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteInfo: props.route.params.noteInfo,	// {nid, title, date, music, bpm, radiusLevel, coordinateLevel, alignWithCoordinate, stageWidth, stageHeight}
			frame: 0,
			isPlay: false,		// play 중인가?
			isEditing: false,	// <PositionBox>를 편집중인가?
			isMenuPop: false,	// 세팅 모드인가?
			isDBPop: false,		// DB 스크린이 켜져 있는가?
		}
		this.isPlayAnim = false;	// <Dancer> 애니메이션 실행중인가?
		this.allPosList = [];			// nid, did, frame, posx, posy, duration
		this.dancerList = [];			// nid, did, name
		this.dancers = [];				// <Dancer> 아이콘 모음
		this.selectedBoxInfo = {posIndex: -1, did: -1, frame: 0, posx: 0, posy: 0, duration: 0, name: ''};	// 선택한 POSITION BOX 정보
		
		this.boxWidth = 6;			// BOX 가로 길이
		this.boxHeight = 30;			// BOX 세로 길이
		this.positionboxWidth = this.boxWidth-1;
		this.positionboxHeight = this.boxHeight-2;
		this.coordinateLevel = this.state.noteInfo.coordinateLevel;		// 좌표 간격 레벨
		this.radiusLevel = this.state.noteInfo.radiusLevel;						// 댄서 크기 레벨
		this.alignWithCoordinate = this.state.noteInfo.alignWithCoordinate ? true : false;	// 좌표에 맞물릴 것인가
		this.timeSpace = 1;	// 몇 초 간격으로 text를 표시할지

		this.FRAME_LENGTH = this.state.noteInfo.musicLength*fps;
	}

	/**
	 * DB_UPDATE('position', 
	 * 	{posx: posx, posy: posy}, 
	 * 	['nid=?', 'did=?', 'frame=?'], 
	 * 	[nid, did, frame]);
	 * @param {string} table 
	 * @param {{}} set 
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
	 * 	['nid=?', 'did=?', 'frame=?'], 
	 * 	[nid, did, frame]);
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

	secToTimeFormat = (sec) => 
	Math.floor(sec/60) + ':' +  
	(Math.floor(sec%60) < 10 ? '0' : '') +
	Math.floor(sec%60)

	/** frame box를 초기화.
	 * - re-render: NO
	 * - update: this.positionBox(, this.timeBoxs)
	 */
	setTimeBox = () => {
		console.log(TAG, 'setTimeBox');

		this.timeBoxs = [];
		for(let frame=0; frame <= this.FRAME_LENGTH; frame++){
			this.timeBoxs.push(
				<View key={frame} style={{height: 10, justifyContent: 'flex-end'}}>
					{/* frame 숫자 */}
						{frame%fps==0 ? 
						<View style={{height: 10, width: 1, backgroundColor: COLORS.grayMiddle}}/>
						:
						<View style={{height: 5, width: 1, backgroundColor: COLORS.grayMiddle}}/>
						}
				</View>
			)
		}
	}

	setTimeTexts = () => {
		console.log(TAG, 'setTimeTexts');

		// 텍스트 중심 거리 : boxWidth * 12
		// 텍스트 사이 거리 : boxWidth * 12 - 26
		this.timeTexts = [];

		for(let frame=0; frame <= this.FRAME_LENGTH; frame++){
			this.timeTexts.push(
				<View key={frame} style={{alignItems: 'center', justifyContent: 'center'}}>
					{/* frame 숫자 */}
					{frame%(fps*this.timeSpace)==0 ? 
					<Text style={{position: 'absolute', width: 26, fontSize: 11, textAlign: 'center'}}>{this.secToTimeFormat(frame/fps)}</Text>
					:
					<View/>}
				</View>
			)
		}
	}

	setTimeBoxTouchZone = () => {
		console.log(TAG, 'setTimeBoxTouchZone');
		this.timeBoxTouchZone =
		<TouchableOpacity 
			style={{
				width: this.boxWidth*this.FRAME_LENGTH, 
				height: BOX_HEIGHT_MIN+10, 
				position: 'absolute',
			}}
			onPress={(event) => {
				const frame = Math.floor(event.nativeEvent.locationX / this.boxWidth);
				this.setDancer(frame);
				this.setState({frame: frame});
			}}/>
	}

	setPositionBoxTouchZone = () => {
		this.positionBoxTouchZone =
			<TouchableOpacity 
			style={{
				flexDirection: 'row',
				position: 'absolute',
				width: this.boxWidth * (this.FRAME_LENGTH+1), 
				height: this.boxHeight * this.dancerList.length,
			}}
			activeOpacity={1}
			onPress={(event)=>{
				const did = Math.floor(event.nativeEvent.locationY/this.boxHeight);
				const frame = Math.floor(event.nativeEvent.locationX/this.boxWidth);
				console.log('positionBoxTouchZone/ 리스트 터치함', did, frame);
				this.selectPosition(did, frame);
			}}
			onLongPress={this.onLongPressTouchZone}/>
	}

	onLongPressTouchZone = (event) => {
		const did = Math.floor(event.nativeEvent.locationY/this.boxHeight);
		const frame = Math.floor(event.nativeEvent.locationX/this.boxWidth);
		for(let i=0; i<this.allPosList[did].length; i++){
			// POSITION BOX가 있는 곳을 터치한 경우
			if(this.allPosList[did][i].frame <= frame){
				if(frame < this.allPosList[did][i].frame + this.allPosList[did][i].duration){
					this.deletePosition(did, this.allPosList[did][i].frame);
					return;
				}
			}
			else{ break; }
		}
		// POSITION BOX가 없는 곳을 터치한 경우
		this.addPosition(did, frame);
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

		// POSITION BOX 넣기
		for(let i=0; i<posList.length; i++){
			positionBoxRow.push(
				<View 
				key={i}
				style={{
					position: 'absolute', 
					left: this.boxWidth * posList[i].frame,
					width: this.positionboxWidth + this.boxWidth * (posList[i].duration-1), 
					height: this.positionboxHeight, 
					borderRadius: this.positionboxWidth/2,
					backgroundColor: dancerColor[this.dancerList[did].color],
					marginHorizontal: (this.boxWidth-this.positionboxWidth)/2,
				}}/>
			)
		}
		this.positionBox.splice(did, 1,
			<View 
			key={did}
			style={{
				flexDirection: 'row', 
				width: this.boxWidth * this.FRAME_LENGTH,
				height: this.boxHeight,
				alignItems: 'center', 
				position: 'absolute',
				top: this.boxHeight * did,
				backgroundColor: COLORS.blue
			}}>
				{positionBoxRow}
				<View style={{position: 'absolute', bottom: 0, width: '100%', height: .5, backgroundColor: COLORS.grayMiddle}}/>
			</View>
		)
	}

	/** music box 전체를 초기화한다.
	 * - re-render: NO
	 * - update: positionBox(, timeBoxs)
	 */
	setPositionBoxs = () => {
		console.log(TAG, "setPositionBoxs");

		this.positionBox = [];	// 제거된 dancer가 있을 수 있으므로 초기화.

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
		this.dancerName = [];	// +10 : frameBox에서 positionbox와의 간격

		// 댄서가 한명도 없는 경우
		if(dancerNum == 0){
			this.dancerName.push(
				<View key={0} style={{flexDirection: 'row', alignItems: 'center', height: this.boxHeight, width: 60, paddingRight: 1}}>
					<View style={{height: this.boxHeight-3, width: 3, backgroundColor: COLORS.grayMiddle}}/>
					<Text style={{fontSize: 11, minWidth: 14, textAlign: 'center', color: COLORS.grayMiddle}}>{0+' '}</Text>
					<Text style={{fontSize: 11, width: 42, color: COLORS.grayMiddle}} numberOfLines={1}>댄서 없음</Text>
				</View>
			)
			return;
		}
		// 댄서가 있는 경우
		for(let i=0; i<dancerNum; i++){
			this.dancerName.push(
				<View key={this.dancerName.length} style={{flexDirection: 'row', alignItems: 'center', height: this.boxHeight, width: 60, paddingRight: 1}}>
					<View style={{height: this.boxHeight-3, width: 3, backgroundColor: dancerColor[this.dancerList[i].color],}}/>
					<Text style={{fontSize: 11, minWidth: 14, textAlign: 'center', color: COLORS.grayMiddle}}>{i+1+' '}</Text>
					{ this.dancerList[i].name=='' ?
					<Text style={{fontSize: 11, width: 42, color: COLORS.grayMiddle}} numberOfLines={1}>이름없음</Text>
					:
					<Text style={{fontSize: 11, width: 42, color: COLORS.blackDark}} numberOfLines={1}>{this.dancerList[i].name}</Text>
					}
					<View style={{position: 'absolute', bottom: 0, width: width, height: .5, backgroundColor: COLORS.grayMiddle}}/>
				</View>
			)
		}
	}

	/** 댄서들 이름과 <Dancer>들을 설정한다.
	 * - re-render: YES ( setState )
	 * - update: dancers, dancerName
	 */
	setDancer = (curFrame = this.state.frame, isPlayAnim = this.isPlayAnim) => {
		console.log(TAG, "setDancer(", isPlayAnim, ')');
		
		const dancerNum = this.dancerList.length;
		const radiusLength = 8 + this.radiusLevel * 2;

		let _dancers = [];
		
		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer
				key={i}
				did={i}
				isSelected={this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == i ? true : false}
				curFrame={curFrame}
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
		this.dancers = _dancers;
	}
	
	/** <Dancer>에서 드래그 후 드랍한 위치 정보로 position DB에 추가/수정한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did  dancer id
	 * @param posx 드랍한 x 좌표
	 * @param posy 드랍한 y 좌표
	 * @param frame 시간
	 */
  dropPosition = (did, posx, posy, frame = this.state.frame) => {
    console.log(TAG + "dropPosition");
		
		// state 업데이트
		let newPos = {did: did, posx: posx, posy: posy, frame: frame, duration: 1};
		let posList = this.allPosList[did];	// 참조 형식

		for(var i=0; i<posList.length; i++){	// for문 밖에서도 사용하므로 let이 아닌 var
			// 0번째보다 이전 시간인 경우는 존재하지 않는다. 드래그할 수 없게 막았기 때문.

			// i번째 box에 속한 경우: UPDATE
			if(posList[i].frame <= frame && frame < posList[i].frame + posList[i].duration){
				// selected box인 경우
				if(this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == did && this.selectedBoxInfo.frame == posList[i].frame){
					this.selectedBoxInfo.posx = posx;
					this.selectedBoxInfo.posy = posy;
				}
				newPos = {...newPos, frame: posList[i].frame, duration: posList[i].duration};
				posList.splice(i, 1, newPos);
				this.DB_UPDATE('position', {posx: posx, posy: posy}, ['nid=?', 'did=?', 'frame=?'], [this.state.noteInfo.nid, did, posList[i].frame]);
				this.setPositionBox(did);
				this.setDancer();
				this.forceUpdate();
				return;
			}
			// 어떤 box에도 속하지 않은 경우: INSERT
			else if(frame < posList[i].frame)
				break;
		}
		// 모든 박스를 확인하고 for문을 나온 경우: INSERT
		posList.splice(i, 0, newPos);
		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, frame: frame, posx: posx, posy: posy, duration: 1})
		this.setPositionBox(did);
		this.setDancer();
		this.forceUpdate();
	}

	/** 기존 저장되어 있는 값들을 기반으로 position DB에 좌표를 추가한다.
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did dancer id
	 * @param frame 추가할 좌표의 frame 값
	 */
	addPosition = (did, frame) => {
		console.log(TAG, "addPosition(did:",did,"frame:",frame,")");

		// frame에 맞는 위치 구하기
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
				if(frame < posList[i].frame)
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
				const dx = (posList[i].posx - posList[i-1].posx) * (frame - posList[i-1].frame) / (posList[i].frame - posList[i-1].frame)
				const dy = (posList[i].posy - posList[i-1].posy) * (frame - posList[i-1].frame) / (posList[i].frame - posList[i-1].frame)
				posx = posList[i-1].posx + dx;
				posy = posList[i-1].posy + dy;
				posx = Math.round(posx);
				posy = Math.round(posy);
			}
		}
		posList.splice(i, 0, {did: did, posx: posx, posy: posy, frame: frame, duration: 1});

		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, frame: frame, posx: posx, posy: posy, duration: 1});
		this.setPositionBox(did);
		this.forceUpdate();	// 추가해서 댄서가 active될 수 있으므로.
	}

	/** position DB에서 선택한 값을 삭제한다.
	 * - selected position은 삭제할 수 없으므로 검사할 필요는 없음
	 * - re-render: YES ( setDancer() )
	 * - update: this.allPosList, this.positionBox
	 * @param did dancer id
	 * @param frame 삭제할 좌표의 frame 값
	 */
	deletePosition = (did, frame) => {
		console.log(TAG, "deletePosition(",did,frame,")");

		let posList = this.allPosList[did];
		for(let i=0; i<posList.length; i++){
			if(frame == posList[i].frame){
				posList.splice(i, 1);
				break;
			}
		}

		this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'frame=?'], 
	  	[this.state.noteInfo.nid, did, frame]);

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

	resizeBoxWidth = (type) => {
		console.log(TAG, 'resizeBoxWidth:', type, this.boxWidth, this.timeSpace);

		switch(type){
			case 'reduce':
				if(this.boxWidth > BOX_WIDTH_MIN){
					this.boxWidth -= 0.3 * 6/this.timeSpace;
					this.positionboxWidth -= 0.3 * 6/this.timeSpace;

					if(this.boxWidth*12*this.timeSpace-26 <= 6){
						this.timeSpace++;
						this.setTimeTexts();
					}
					this.setTimeBoxTouchZone();
					this.setPositionBoxs();
					this.setPositionBoxTouchZone();
					this.forceUpdate();
				}
				break;
				
			case 'expand':
				if(this.boxWidth < BOX_WIDTH_MAX){
					this.boxWidth += 0.3 * 6/this.timeSpace;
					this.positionboxWidth += 0.3 * 6/this.timeSpace;

					if(this.boxWidth*12*(this.timeSpace-1)-26 > 6){
						this.timeSpace--;
						this.setTimeTexts();
					}
					this.setTimeBoxTouchZone();
					this.setPositionBoxs();
					this.setPositionBoxTouchZone();
					this.forceUpdate();
				}
				// else if(this.fpb > 1){
				// 	this.boxWidth = BOX_WIDTH_MIN;
				// 	this.fpb /= 2;
				// 	this.setTimeTexts();
				// 	this.setTimeBoxTouchZone();
				// 	this.setPositionBoxs();
				// 	this.setPositionBoxTouchZone();
				// 	this.forceUpdate();
				// }
				break;

			default:
				console.log('Wrong parameter...');
		}

		this.positionBoxScrollHorizontal.scrollTo({x: this.state.frame*this.boxWidth, animated: false});
	}

	/** <DancerScreen>에서 수정된 정보를 적용한다.
	 * - re-render: YES ( setDancer )
	 * - update: this.dancerList, this.allPosList / this.positionBox / dancers, dancerName
	 * @param {array} _dancerList 변경된 dancerList
	 * @param {array} _allPosList 변경된 allPosList
	 */
	changeDancerList = (_dancerList, _allPosList) => {
		console.log(TAG, 'changeDancerList');
		this.dancerList = [..._dancerList];
		this.allPosList = [..._allPosList];
		this.setDancerName();
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
	selectPosition = (did, frame) => {
		console.log(TAG, 'selectPosition');
		// 존재하지 않는 did인 경우
		if(did < 0 || did >= this.dancerList.length) return;
		// 존재하지 않는 frame인 경우
		if(frame < 0 || frame > this.FRAME_LENGTH) return;

		// 선택되어 있던 것을 선택한 경우
		if(this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == did && this.selectedBoxInfo.frame == frame)
			this.unselectPosition();

		// 선택되어 있던 것이 아닌 다른 것을 선택한 경우
		else{
			this.unselectPosition();
			// posIndex 찾기
			for(let i=0; i<this.allPosList[did].length; i++){
				if(this.allPosList[did][i].frame <= frame){
					if(frame < this.allPosList[did][i].frame + this.allPosList[did][i].duration){
						this.selectedBoxInfo = {...this.dancerList[did], ...this.allPosList[did][i], posIndex: i};
						this.forceUpdate();	// 선택된 댄서 아이콘 보여주기 위해
						break;
					}
				}
				// 블럭이 없는 곳을 선택
				else{ break; }
			}
		}
	}

	/**
	 * 선택되어 있는 position box을 선택 취소한다.
	 * - re-render: YES ( setDancer )
	 * - update: musicbox
	 * - setPositionBox()
	 */
	unselectPosition = () => {
		// console.log(TAG, 'unselectPosition');
		this.selectedBoxInfo.posIndex = -1;
	}

	/** 
	 * <PositionBox>를 편집중인 경우, scroll을 비활성화한다.
	 * - re-render: YES ( setState )
	 * - update: state.isEditing
	 * @param {boolean} isEditing <PositionBox>를 편집중인가?
	 */
	setScrollEnable = (isEditing) => {
		this.setState({isEditing: isEditing});
	}

	/**
	 * 선택되어 있는 box의 duration을 변경한다.
	 * @param {number} doUpdate
	 * @param {number} duration 
	 * @param {number} frame 수정되기 전 initial frame
	 * @param {number} did 
	 */
	resizePositionBoxLeft = (doUpdate, duration, frame = this.selectedBoxInfo.frame, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionBoxLeft(", doUpdate, duration, frame, did, ')');
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
			if(posList[i].frame == frame){
				const leftEndFrame = frame + posList[i].duration - duration;
				if(leftEndFrame < 0) {
					console.log(TAG, '왼쪽 끝이에요.');
					return;
				}
				break;
			}
		}

		// 바뀐 posIndex 구하기
		let i = 0;
		for(; ; i++){
			console.log(this.selectedBoxInfo.frame, '<=', posList[i].frame, '<', frame);

			// 바뀌기 전 시간 이상인 경우: 무시 (break)
			// [i]번째 == 선택된 positionbox의 정보
			if(frame <= posList[i].frame) break;

			// 바뀐 시간보다 작은 경우: 무시 (continue)
			if(posList[i].frame + posList[i].duration < this.selectedBoxInfo.frame) continue;

			// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
			if(posList[i].frame < this.selectedBoxInfo.frame) {
				posList[i].duration = this.selectedBoxInfo.frame - posList[i].frame - 1;
				continue;
			}
			// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
			posList.splice(i, 1);
			i--;
		}
		this.selectedBoxInfo.posIndex = i;
		this.selectedBoxInfo.frame -= (duration - this.selectedBoxInfo.duration);	// ++ or --
		this.selectedBoxInfo.duration = duration;

		if(!doUpdate){
			this.forceUpdate();
		}

		// update DB & allPosList
		else{
			this.DB_DELETE('position', 
				['nid=?', 'did=?', 'frame>=?', 'frame<?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.frame, frame],
				()=>{
					this.DB_UPDATE('position', 
					{duration: duration, frame: this.selectedBoxInfo.frame}, 
					['nid=?', 'did=?', 'frame=?'], 
					[this.state.noteInfo.nid, did, frame]);
				}
			);
			let i = 0;
			for(; ; i++){
				console.log(this.selectedBoxInfo.frame, '<=', this.allPosList[did][i].frame, '<', frame)

				// 바뀌기 전 시간 이상인 경우: 무시 (break)
				// [i]번째 == 선택된 positionbox의 정보
				if(this.allPosList[did][i].frame >= frame) break;

				// 바뀐 시간보다 작은 경우: 무시 (continue)
				if(this.allPosList[did][i].frame + this.allPosList[did][i].duration < this.selectedBoxInfo.frame) continue;

				// 바뀐 시간보다 크지만 duration 을 줄이면 되는 경우: duration 줄이기
				if(this.allPosList[did][i].frame < this.selectedBoxInfo.frame) {
					const reducedDuration = this.selectedBoxInfo.frame - this.allPosList[did][i].frame - 1;
					this.allPosList[did][i].duration = reducedDuration;
					this.DB_UPDATE('position', 
					{duration: reducedDuration}, 
					['nid=?', 'did=?', 'frame=?'], 
					[this.state.noteInfo.nid, did, this.allPosList[did][i].frame]);
					continue;
				}
				// 바뀐 시간 이상 && 바뀌가 전 시간보다 작은 경우: 삭제 (splice)
				// duration을 늘린 결과로 덮여진 box를 지운다.
				this.allPosList[did].splice(i, 1);
				i--;
			}	
			console.log(i, '번째에 선택된 정보가 있다!');
			this.allPosList[did][i].frame = this.selectedBoxInfo.frame;
			this.allPosList[did][i].duration = duration;
			this.setPositionBox(did);
			this.setDancer();
			this.forceUpdate();
		}
	}

	resizePositionBoxRight = (doUpdate, duration = this.selectedBoxInfo.duration, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionBoxRight(", doUpdate, duration, did, ')');
		
		const rightEndFrame = this.selectedBoxInfo.frame + duration;
		if(this.FRAME_LENGTH < rightEndFrame) {
			console.log(TAG, '오른쪽 끝이에요.');
			return;
		}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.duration = duration;
		
		if(!doUpdate){
			this.forceUpdate();
		}

		// update DB & allPosList
		else{
			this.allPosList[did][this.selectedBoxInfo.posIndex].duration = duration;

			this.DB_UPDATE('position', 
				{duration: duration}, 
				['nid=?', 'did=?', 'frame=?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.frame]);
			
			this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'frame>?', 'frame+duration<=?'], 
	  	[this.state.noteInfo.nid, did, this.selectedBoxInfo.frame, rightEndFrame]);

			console.log('selectedPositionIdx', this.selectedBoxInfo.posIndex, this.allPosList[did].length);
			// 댄서의 각 checked box 에 대해서...
			for(let i = this.selectedBoxInfo.posIndex + 1; i<this.allPosList[did].length; i++){

				console.log(rightEndFrame, '\n', this.allPosList[did][i].frame, '\n', this.allPosList[did][i].duration)

				// 시간이 바뀐 길이보다 큰 경우: 무시 (break)
				if(rightEndFrame < this.allPosList[did][i].frame) break;

				// 시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우: frame++ && duration--
				if(rightEndFrame < this.allPosList[did][i].frame + this.allPosList[did][i].duration){
					console.log('시간이 바뀐 길이보다 작지만 duration을 줄이면 되는 경우');
					
					const originFrame = this.allPosList[did][i].frame;
					this.allPosList[did][i].duration -= (rightEndFrame + 1 - originFrame);
					this.allPosList[did][i].frame = rightEndFrame + 1;

					console.log(originFrame, '->', this.allPosList[did][i].frame, this.allPosList[did][i].frame)

					this.DB_UPDATE('position', 
						{duration: this.allPosList[did][i].duration, frame: this.allPosList[did][i].frame}, 
						['nid=?', 'did=?', 'frame=?'], 
						[this.state.noteInfo.nid, did, originFrame]);
					break;
				}
				// 바뀐 길이에 완전히 덮여버린 경우: 삭제 (splice)
				this.allPosList[did].splice(i, 1);
				i--;
			}
			this.setPositionBox(did);
			this.setDancer();
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
	movePositionBox = (doUpdate, to, from = this.selectedBoxInfo.frame, did = this.selectedBoxInfo.did) => {
		console.log(TAG, 'movePositionBox (', doUpdate, to, from, did, ')');

		if(to < 0 || this.FRAME_LENGTH < to + this.selectedBoxInfo.duration){
			console.log('범위 밖으로 나갔습니다.')
			return;
		}

		let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		let myPosInfo;
		let shouldDelete = [];	// 삭제 되어야 할 position의 frame
		let shouldUpdate = [];	// 업데이트 되어야 할 position의 [frame, {updated_value}]
		let shouldInsert = [];	// 새로 생성 되어야 할 position의 {inserted_value}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.frame = to;

		// 댄서의 각 checked box 에 대해서...
		const rightEndFrame = this.selectedBoxInfo.frame + this.selectedBoxInfo.duration;

		let saveOrigin = false;
		let findIndex = false;

		for(let i=0; i<posList.length; i++){
			// 자기 자신 정보를 저장해놓고 삭제
			if(posList[i].frame == from){
				// console.log('case 1: 자기 자신 제거');
				myPosInfo = {...posList.splice(i, 1)[0], frame: to};
				shouldDelete.push(from);
				i--;
				saveOrigin = true;
				continue;
			}

			// selected box 왼쪽 끝보다 뒤에 있는 경우: 무시 (continue)
			if(posList[i].frame + posList[i].duration < this.selectedBoxInfo.frame) {
				// console.log('case 2: 뒤에 있는 경우 무시');
				continue;
			}

			// 시작 시간이 뒤에 있는 경우
			if(posList[i].frame < this.selectedBoxInfo.frame){
				// 시작 시간은 뒤에 있으나 조금 잘리는 경우: duration 줄이기
				if(posList[i].frame + posList[i].duration <= rightEndFrame){
					// console.log('case 3-1: 시작 시간은 뒤에 있으나 조금 잘리는 경우 duration 줄이기');
					posList[i].duration = this.selectedBoxInfo.frame - posList[i].frame - 1;
					shouldUpdate.push([posList[i].frame, {duration: posList[i].duration}]);
					continue;
				}
				// 시작 시간은 뒤에 있으나 중간에 잘리는 경우: 둘로 나누기
				else{
					// console.log('case 3-2: 시작 시간은 뒤에 있으나 중간에 잘리는 경우 둘로 나누기');
					const newPos = {...posList[i], frame: rightEndFrame+1, duration: posList[i].duration+posList[i].frame-rightEndFrame-1};
					posList[i].duration = this.selectedBoxInfo.frame - posList[i].frame - 1;
					posList.splice(i+1, 0, newPos);
					shouldUpdate.push([posList[i].frame, {duration: posList[i].duration}]);
					shouldInsert.push(newPos);
					i++;
					if(!findIndex){
						// console.log('FIND INDEX::', i);
						this.selectedBoxInfo.posIndex = i;
						findIndex = true;
					}
					continue;
				}
			}

			// 완전히 포개진 경우: 삭제
			if(this.selectedBoxInfo.frame <= posList[i].frame && posList[i].frame + posList[i].duration <= rightEndFrame){
				// console.log('case 4: 완전히 포개진 경우 삭제');
				shouldDelete.push(posList[i].frame);
				posList.splice(i, 1);
				i--;
				continue;
			}

			// 시작 시간은 포함되지만 duration을 줄이면 되는 경우: frame 증가 && duration 감소
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 아직 뒤에 있다면 break 하지 않는다.
			if(this.selectedBoxInfo.frame <= posList[i].frame && posList[i].frame <= rightEndFrame  && rightEndFrame < posList[i].frame + posList[i].duration){
				// console.log('case 5: 시작 시간은 포함되지만 duration을 줄이면 되는 경우: frame 증가 && duration 감소');
				
				posList[i].duration -= (rightEndFrame + 1 - posList[i].frame);
				shouldUpdate.push([posList[i].frame, {frame: rightEndFrame + 1, duration: posList[i].duration}]);
				posList[i].frame = rightEndFrame + 1;
				if(!findIndex) {
					// console.log('FIND INDEX::', i);
					this.selectedBoxInfo.posIndex = i;
					findIndex = true;
				}
				// 본인의 박스를 이미 지난 경우
				if(saveOrigin)
					break;
				// 본인의 박스가 뒤에 있는 경우
				continue;
			}

			// 시간이 바뀐 길이보다 큰 경우: 무시 (continue)
			// 이후로는 겹치지 않는 것들이지만, 본인의 box가 아직 뒤에 있다면 break 하지 않는다.
			if(rightEndFrame < posList[i].frame) {
				// console.log('case 6: 시간이 바뀐 길이보다 큰 경우: 무시 (continue)');
				if(!findIndex) {
					// console.log('FIND INDEX::', i);
					this.selectedBoxInfo.posIndex = i;
					findIndex = true;
				}
				// 본인의 박스를 이미 지난 경우
				if(saveOrigin)
					break;
				// 본인의 박스가 뒤에 있는 경우
				continue;
			}
		}

		if(!findIndex) {
			// console.log('FIND INDEX::', posList.length);
			this.selectedBoxInfo.posIndex = posList.length;
		}
		posList.splice(this.selectedBoxInfo.posIndex, 0, myPosInfo);
		shouldInsert.push(myPosInfo);

		this.posList = posList; 	// for DB debug
		// console.log('shouldDelete:', shouldDelete);
		// console.log('shouldUpdate:', shouldUpdate);
		// console.log('shouldInsert:', shouldInsert);

		if(!doUpdate){
			// this.setPositionBox(did, posList);
			this.forceUpdate();
		}
		else{
			shouldDelete.forEach(frame => {
				this.DB_DELETE('position', ['nid=?', 'did=?', 'frame=?'], [this.state.noteInfo.nid, did, frame]);
			});
			shouldUpdate.forEach(([frame, set]) => {
				this.DB_UPDATE('position', set, ['nid=?', 'did=?', 'frame=?'], [this.state.noteInfo.nid, did, frame]);
			});
			shouldInsert.forEach(value => {
				this.DB_INSERT('position', {...value, nid: this.state.noteInfo.nid});
			});

			this.allPosList[did] = posList;
			this.setPositionBox(did);
			this.setDancer();
			this.forceUpdate();
		}
	}

	moveTimeMarker = (frame) => {
		if(frame < 0 || frame > this.FRAME_LENGTH)
			return;
			
		this.setDancer(frame);
		this.setState({frame: frame});
	}

	changeAlignWithCoordinate = () => {
		this.alignWithCoordinate = !this.alignWithCoordinate;
		this.DB_UPDATE('note', 
			{alignWithCoordinate: this.alignWithCoordinate}, 
			['nid=?'], 
			[this.state.noteInfo.nid]);
		this.forceUpdate();
	}
	
	closeDBScreen = () => {
		this.setState({isDBPop: false});
	}

	editFrame = (text) => {
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
		const frame = Number(text);

		// 변경
		if(!isNaN(frame) && text!='' && frame > 0){
			this.movePositionBox(true, frame);
		}
		else{
			Alert.alert("취소", "올바르지 않은 형식입니다. 1 이상, 노래 길이 이하의 숫자를 입력해 주세요.");
		}
	}

	editDuration = (text) => {
		text = text.replace(/ /gi, '');

		if(!isNaN(Number(text)) && text != '' && Number(text) >= 1)
			this.resizePositionBoxRight(true, Math.round( Number(text) ));
		else
			Alert.alert("취소", "올바르지 않은 형식입니다. 1 이상, 노래 길이를 넘어가지 않도록 입력해 주세요.");
	}

	editX = (text) => {
		text = text.replace(/ /gi, '');
		if(!isNaN(Number(text)) && text != ''){
			let posx = Math.round(Number(text));
			posx = Math.abs(posx) > Math.floor(width/2) ? Math.floor(width/2) * Math.sign(posx) : posx;
			this.DB_UPDATE('position', 
				{posx: posx}, 
				['nid=?', 'did=?', 'frame=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.frame]);
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
				['nid=?', 'did=?', 'frame=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.frame]);

			this.selectedBoxInfo.posy = posy;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posy = posy;
			this.forceUpdate();
		}
		else
			Alert.alert("취소", "올바르지 않은 형식입니다.");
	}

	editMusic = () => {
		console.log('edit Music');
		for(let did=0; did<this.allPosList.length; did++){
			for(let i=0; i<this.allPosList[did].length; i++){
				console.log("INSERT INTO position VALUES (0, "+did+", "+this.allPosList[did][i].frame*12+", "+this.allPosList[did][i].posx+", "+this.allPosList[did][i].posy+", "+this.allPosList[did][i].duration+");");
			}
		}
	}

	editTitle = (newTitle) => {
		console.log(TAG, 'editTitle');
		this.setState({noteInfo: {...this.state.noteInfo, title: newTitle}});
		this.DB_UPDATE('note', {title: '\"'+newTitle+'\"'}, ['nid=?'], [this.state.noteInfo.nid]);
	}
	
	onPlaySubmit = (frame, isPlay = this.state.isPlay) => {
		console.log(TAG, 'onPlaySubmit(', frame, isPlay, ')');

		this.positionBoxScrollHorizontal.scrollTo({x: frame*this.boxWidth, animated: false});
		
		// 플레이 중이 아닐 경우: frame에 맞는 위치로 이동
		if(!isPlay) this.setDancer(frame);

		// <Dancer> 애니메이션 시작
		if(isPlay != this.isPlayAnim){
			this.setDancer(this.state.frame, isPlay);
			this.isPlayAnim = isPlay;
		}
		this.setState({frame: frame, isPlay: isPlay});
	}

	/**
	 * 스크린에서의 무대 크기를 리턴한다.
	 */
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
							"ORDER BY did, frame;",
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
								this.setCoordinate();
								this.setDancer();

								this.setDancerName();

								this.setTimeTexts();
								this.setTimeBox();
								this.setTimeBoxTouchZone();

								// this.setHorizontalLine();
								this.setPositionBoxs();
								this.setPositionBoxTouchZone();
								
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

		// this.setDancer();

		return(
			<SafeAreaView style={{flex: 1, flexDirection: 'column'}}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
				noteInfo={{music: this.state.noteInfo.music, musicLength: this.state.noteInfo.musicLength, bpm: this.state.noteInfo.bpm, sync: this.state.noteInfo.sync}}
				onPlaySubmit={this.onPlaySubmit}
				frame={this.state.frame}/>

				<KeyboardAvoidingView 
				behavior={Platform.OS == "ios" ? "padding" : "height"}
				style={{flex: 1}}>

					<View flexDirection='row' style={{flex: 1}}>
						<View flexDirection='column'>
							
							{/* dancer 이름 리스트 위 공백 */}
							<View style={{height: this.boxHeight + 10}}/>

							{/* dancer 이름 */}
							<ScrollView
							bounces={false}						// 오버스크롤 막기 (iOS)
							decelerationRate={0}			// 스크롤 속도 (iOS)
							scrollEnabled={!this.state.isEditing}
							showsVerticalScrollIndicator={false}
							ref={ref => (this.nameScroll = ref)}
							scrollEventThrottle={16}
							// music box list와 동시에 움직이는 것처럼 보이기 위해 scrollTo의 animated를 false로 한다.
							onScroll={event => this.positionBoxScrollVertical.scrollTo({y: event.nativeEvent.contentOffset.y, animated: false})}
							>
								<View style={{flexDirection: 'column'}}>
									{ this.dancerName }
								</View>
							</ScrollView>
						</View>

						{/* BEAT + POSITION */}
						{/* 가로 스크롤 */}
						<ScrollView
						horizontal={true}
						bounces={false} 					// 오버스크롤 막기 (iOS)
						decelerationRate={0.7}		// 스크롤 속도 (iOS)
						scrollEnabled={!this.state.isEditing}
						showsHorizontalScrollIndicator={false}
						ref={ref => (this.positionBoxScrollHorizontal = ref)}>

							{/* 세로 스크롤 */}
							<ScrollView
							bounces={false} 						// 오버스크롤 막기 (iOS)
							decelerationRate={0}
							stickyHeaderIndices={[0]}		// 0번째 View (BEAT 숫자) 고정
							scrollEnabled={!this.state.isEditing}
							showsVerticalScrollIndicator={false}
							ref={ref => (this.positionBoxScrollVertical = ref)}
							scrollEventThrottle={16}
							onScroll={event => this.nameScroll.scrollTo({y: event.nativeEvent.contentOffset.y, animated: false})}>

								{/* TIME 숫자 표시 */}
								<View
								style={{
									flexDirection: 'column',
									paddingHorizontal: BOX_WIDTH_MAX,}}>
										{/* TIME 숫자 텍스트 */}
										<View 
										style={{
											flexDirection: 'row', 
											width: this.boxWidth*(this.FRAME_LENGTH+1), 
											height: BOX_HEIGHT_MIN, 
											// paddingHorizontal: BOX_WIDTH_MAX/2,
											alignItems: 'center', justifyContent: 'space-between',
											}}>
											{this.timeTexts }
										</View>
										{/* TIME 눈금 */}
										<View 
										style={{
											flexDirection: 'row', 
											width: this.boxWidth*(this.FRAME_LENGTH+1), 
											height: 10, 
											// paddingHorizontal: BOX_WIDTH_MAX/2,
											alignItems: 'center', justifyContent: 'space-between',
											}}>
											{this.timeBoxs }
										</View>

										{/* BEAT 터치 박스 */}
										{ this.timeBoxTouchZone }
									
								</View>

								{/* POSITION 박스들 */}
								<View 
								style={{
									marginHorizontal: BOX_WIDTH_MAX, 
									}}>
									<View flexDirection='column'>
										{ this.positionBox }
									</View>
									{/* POSITION 터치존 */}
									{ this.positionBoxTouchZone }
								</View>
								
								{/* POSITION CHECKER */}
								<PositionChecker
								boxWidth={this.boxWidth}
								boxInfo={this.selectedBoxInfo}
								setScrollEnable={this.setScrollEnable}
								resizePositionBoxLeft={this.resizePositionBoxLeft}
								resizePositionBoxRight={this.resizePositionBoxRight}
								movePositionBox={this.movePositionBox}
								unselectPosition={this.unselectPosition}
								containerStyle={{
									height: this.boxHeight, 
									width: this.boxWidth * this.selectedBoxInfo.duration, 
									position: 'absolute',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									left: BOX_WIDTH_MAX + this.boxWidth * this.selectedBoxInfo.frame,
									top: (this.boxHeight + 10) + this.boxHeight * this.selectedBoxInfo.did,
								}}
								boxStyle={{
									height: this.positionboxHeight, 
									width: this.positionboxWidth + this.boxWidth * (this.selectedBoxInfo.duration-1),
									borderRadius: this.positionboxWidth/2,
									borderColor: COLORS.green,
									borderWidth: 2,
								}}
								buttonStyle={{
									position: 'absolute',
									height: this.boxHeight, 
									width: 10,  
									backgroundColor: COLORS.green, 
									borderRadius: 5}}
								/>
								
							</ScrollView>
							
							{/* TIME MARKER */}
							<TimeMarker
							frame={this.state.frame}
							boxWidth={this.boxWidth}
							boxHeight={this.boxHeight}
							setScrollEnable={this.setScrollEnable}
							moveTimeMarker={this.moveTimeMarker}/>

							{/* TIME MARKER 세로선 */}
							<View
							pointerEvents='none'	// 뒤에 있는 POSITION BOX를 터치 가능하도록 하기 위해
							style={{
								height: '100%', 
								position: 'absolute', 
								left: BOX_WIDTH_MAX + this.boxWidth * this.state.frame,
								top: this.boxHeight,
								alignItems: 'center',
								}}>
								<View
								style={{
									flex: 1,
									width: 1,
									backgroundColor: COLORS.green}}/>
							</View>

						</ScrollView>
					</View>

					{/* 하단 메뉴 */}
					{/* 선택한 POSITION 정보 */}
					{this.selectedBoxInfo.posIndex == -1 ?
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

						<TouchableOpacity onPress={()=>this.resizeBoxWidth('reduce')} activeOpacity={1} style={styles.menuButton}>
							<CustomIcon name='box-width-down' size={30} color={COLORS.grayMiddle}/>
							<Text style={styles.menuText}>표간격 좁게</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={()=>this.resizeBoxWidth('expand')} activeOpacity={1} style={styles.menuButton}>
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
					:
					<View style={styles.selectContainer}>

						<Text style={styles.selectText}>시작:</Text>
						<TextInput style={styles.selectTextInput} onEndEditing={(event)=>this.editFrame(event.nativeEvent.text)}>
							{this.selectedBoxInfo.frame}
						</TextInput>

						<Text style={styles.selectText}>  길이:</Text>
						<TextInput style={styles.selectTextInput} onEndEditing={(event)=>this.editDuration(event.nativeEvent.text)}>
							{this.selectedBoxInfo.duration}
						</TextInput>

						<Text style={styles.selectText}>  X:</Text>
						<TextInput style={styles.selectTextInput} onEndEditing={(event)=>this.editX(event.nativeEvent.text)}>
							{this.selectedBoxInfo.posx}
						</TextInput>

						<Text style={styles.selectText}>  Y:</Text>
						<TextInput style={styles.selectTextInput} onEndEditing={(event)=>this.editY(event.nativeEvent.text)}>
							{this.selectedBoxInfo.posy}
						</TextInput>
					</View>
					}

					{/* PLAY 중일 때 터치 막는 VIEW */}
					{this.state.isPlay ?
					<View style={{width: '100%', height: '100%', position: 'absolute', backgroundColor: '#00000099'}}/>
					: <View/>}
					
				</KeyboardAvoidingView>

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
			</TouchableWithoutFeedback>
			</SafeAreaView>
		)
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
		height: 70,
		alignItems: 'center',
		backgroundColor:COLORS.grayLight,
		padding: 10,
		borderColor: COLORS.green,
		borderWidth: 2,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
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