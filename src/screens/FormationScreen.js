import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Sound from 'react-native-sound';
// Enable playback in silence mode
Sound.setCategory('Playback');

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

// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

// 화면의 가로, 세로 길이 받아오기
const {width, height} = Dimensions.get('window');

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteInfo: props.route.params.noteInfo,	// {nid, title, date, music, radiusLevel, coordinateLevel, alignWithCoordinate, stageWidth, stageHeight}
			time: 0,
			isPlay: false,		// play 중인가?
			isEditing: false,	// <Positionbox>를 편집중인가?
			isMenuPop: false,	// 세팅 모드인가?
			isDBPop: false,		// DB 스크린이 켜져 있는가?
			dancers: [],
		}
		this.allPosList = [];	// nid, did, time, posx, posy, duration
		this.dancerList = [];	// nid, did, name
		this.nameColumn = [],
		this.scrollViewStyle;
		this.timeText = [];
		this.musicbox = [];	
		this.selectedBoxInfo = {posIndex: -1};
		this.boxWidth = 30;
		this.boxHeight = 30;
		this.positionboxWidth = this.boxWidth - 8;
		this.positionboxHeight = this.boxHeight - 8;
		this.stageHeight = width * this.state.noteInfo.stageHeight / this.state.noteInfo.stageWidth;
		this.scrollOffset = 0;		// 세로 스크롤 위치

		this.coordinateLevel = this.state.noteInfo.coordinateLevel;
		this.radiusLevel = this.state.noteInfo.radiusLevel;
		this.alignWithCoordinate = this.state.noteInfo.alignWithCoordinate ? true : false;		// 좌표에 맞물려 이동

		this.setCoordinate();

		this.load();
	}

	// Load the sound file '[your_music_title].mp3' from the app bundle
	// See notes below about preloading sounds within initialization code below.
	load = () => {
		console.log(TAG, 'load');
		// console.log(Sound.MAIN_BUNDLE);
		// console.log(Sound.DOCUMENT);
		// console.log(Sound.LIBRARY);
		// console.log(Sound.CACHES);
		
		let fileName;
		let filePath;

		if(this.state.noteInfo.music == 'Sample'){
			fileName = 'Sample.mp3';
			filePath = Sound.MAIN_BUNDLE;
		}
		else{
			fileName = this.state.noteInfo.music;
			filePath = Sound.DOCUMENT;
		}
		
		// this.sound = new Sound(fileName, filePath, (error) => {
		this.sound = new Sound('Love.mp3', Sound.DOCUMENT, (error) => {
			if (error) {
				console.log('failed to load the sound', error);
				return;
			}
			// this.sound == TRUE
			// loaded successfully!
			console.log('duration in seconds: ' + this.sound.getDuration(), 'number of channels: ' + this.sound.getNumberOfChannels());
			this.setState({musicLength: Math.ceil(this.sound.getDuration())});
		});
		// Reduce the volume by half
		// this.sound.setVolume(1);

		// Set the pan value.
		// Position the sound to the full right in a stereo field
		// ranging from -1.0 (full left) through 1.0 (full right).
		this.sound.setPan(1);
		
		// Loop indefinitely until stop() is called
		this.sound.setNumberOfLoops(-1);
		
		// Get properties of the player instance
		console.log('volume: ' + this.sound.getVolume());
		console.log('pan: ' + this.sound.getPan());
		console.log('loops: ' + this.sound.getNumberOfLoops());
	}

	// Play the sound with an onEnd callback
	playMusic = () => {
		console.log(TAG, 'playMusic');
		if(!this.sound){
			return;
		}
		if(this.state.isPlay) this.pause();
		
		this.sound.setCurrentTime(this.state.time);

		this.sound.play((success) => {
			if (success) {
				console.log(TAG, 'MUSIC PLAY!!');
			} else {
				console.log(TAG, 'playback failed due to audio decoding errors');
			}
		});
	}
	
	// Stop the sound and rewind to the beginning
	stop = () => {
		console.log(TAG, 'stop');
		this.sound.stop(() => {
			// Note: If you want to play a sound after stopping and rewinding it,
			// it is important to call play() in a callback.
			this.sound.play();
		});
	}

	// Seek to a specific point in seconds
	// this.sound.setCurrentTime(2.5);
	
	// Get the current playback point in seconds
	// this.sound.getCurrentTime((seconds) => console.log('at ' + seconds));
		
	// Release the audio player resource
	// this.sound.release();

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
			for(let time=0; time <= this.state.noteInfo.musicLength; time++){
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
		
		// this.musicbox.splice(0, 1,
		// 	<View key={0} flexDirection='row'>
		// 		{ _timeText }
		// 	</View>
		// );

		this.timeTextSelect =
			<View key={0} flexDirection='row'>
				{ _timeText }
			</View>
	}

	/** did번째 댄서의 music box를 초기화한다.
	 * - re-render: NO
	 * - update: this.musicbox
	 * @param {number} did 
	 * @param {array} posList (default) this.allPosList[did]
	 */
	setMusicbox = (did, posList = this.allPosList[did]) => {
		console.log(TAG, 'setMusicbox (', did, 'posList )');
		let rowView = [];
		
		// did번째 댄서에 대한 position이 하나도 없는 경우
		if(posList.length == 0){
			for(let time=0; time<=this.state.noteInfo.musicLength; time++){
				rowView.push(
					<TouchableOpacity key={rowView.length} activeOpacity={1} onLongPress={()=>this.addPosition(did, time)}>
						<View style={this.styles('uncheckedBox')}></View>
					</TouchableOpacity>
				)
			}
		}
		else{
			let prevTime = -1;
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
							width: this.positionboxWidth + this.boxWidth * duration, 
							backgroundColor: dancerColor[this.dancerList[did].color],
						}]}/>
					</TouchableOpacity>
				)
				prevTime = curTime + duration;
			}

			// 마지막 대열~노래 끝부분까지 회색박스 채우기
			for(let i=prevTime+1; i<=this.state.noteInfo.musicLength; i++){
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
						borderRadius: 5,
						left: this.boxWidth * this.selectedBoxInfo.time - this.boxWidth/2,
					}}
					boxStyle={[this.styles('checkedBox'), {
						width: this.positionboxWidth + this.boxWidth * this.selectedBoxInfo.duration,
						backgroundColor: dancerColor[this.dancerList[did].color],
					}]}
					buttonStyle={{height: this.boxHeight, width: this.boxWidth/2,  backgroundColor: COLORS.green, borderRadius: 5}}
					/>
				);
		}

		this.musicbox.splice(did, 1,
			<View 
			key={did}
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
		this.setDancerName();

		for(let did=0; did<this.dancerList.length; did++)
			this.setMusicbox(did);

		// 가로선만 있는 row 하나 추가
		// let rowView = [];
		// // 마지막 대열~노래 끝부분까지 회색박스 채우기
		// for(let i=0; i<=this.state.noteInfo.musicLength; i++){
		// 	rowView.push( <View key={rowView.length} style={[this.styles('uncheckedBox'), {height: height}]}/> )
		// }
		// this.musicbox.push(
		// 	<View 
		// 	key={-1}
		// 	flexDirection='row'>
		// 		{rowView}
		// 	</View>
		// )			
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

	setDancerName = () => {
		console.log(TAG, "setDancerName: dancerNum = " + this.dancerList.length);
		const dancerNum = this.dancerList.length;
		this.nameColumn = [];	// +10 : timeBox에서 positionbox와의 간격
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
	setDancer = () => {
		console.log(TAG, "setDancer: dancerNum = " + this.dancerList.length);
		
		const dancerNum = this.dancerList.length;
		const radiusLength = 8 + this.radiusLevel * 2;

		let _dancers = [];
		
		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer
				key={_dancers.length}
				did={i}
				isSelected={this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == i ? true : false}
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
		}
		this.setState({dancers: _dancers});
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
		let newPos = {did: did, posx: posx, posy: posy, time: time, duration: 0};
		let posList = this.allPosList[did];	// 참조 형식

		for(var i=0; i<posList.length; i++){	// for문 밖에서도 사용하므로 let이 아닌 var
			// 0번째보다 이전 시간인 경우는 존재하지 않는다. 드래그할 수 없게 막았기 때문.

			// i번째 box에 속한 경우: UPDATE
			if(posList[i].time <= time && time <= posList[i].time + posList[i].duration){
				// selected box인 경우
				if(this.selectedBoxInfo.posIndex != -1 && this.selectedBoxInfo.did == did && this.selectedBoxInfo.time == posList[i].time){
					this.selectedBoxInfo.posx = posx;
					this.selectedBoxInfo.posy = posy;
				}
				newPos = {...newPos, time: posList[i].time, duration: posList[i].duration};
				posList.splice(i, 1, newPos);
				this.DB_UPDATE('position', {posx: posx, posy: posy}, ['nid=?', 'did=?', 'time=?'], [this.state.noteInfo.nid, did, posList[i].time]);
				this.setMusicbox(did);
				this.setDancer();
				return;
			}
			// 어떤 box에도 속하지 않은 경우: INSERT
			else if(time < posList[i].time)
				break;
		}
		// 모든 박스를 확인하고 for문을 나온 경우: INSERT
		posList.splice(i, 0, newPos);
		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, time: time, posx: posx, posy: posy, duration: 0})
		this.setMusicbox(did);
		this.setDancer();
	}

	/** 기존 저장되어 있는 값들을 기반으로 position DB에 좌표를 추가한다.
	 * - re-render: YES ( setDancer() )
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
		let i=0;	// 추가될 위치 index

		// 리스트에 아무것도 없는 경우
		if(posList.length == 0){
			posx = 0;
			posy = 0;
		}
		else{
			// 들어갈 index 찾기
			for(; i<posList.length; i++){
				if(time < posList[i].time)
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
				const dx = (posList[i].posx - posList[i-1].posx) * (time - posList[i-1].time) / (posList[i].time - posList[i-1].time)
				const dy = (posList[i].posy - posList[i-1].posy) * (time - posList[i-1].time) / (posList[i].time - posList[i-1].time)
				posx = posList[i-1].posx + dx;
				posy = posList[i-1].posy + dy;
				posx = Math.round(posx);
				posy = Math.round(posy);
			}
		}
		posList.splice(i, 0, {did: did, posx: posx, posy: posy, time: time, duration: 0});

		this.DB_INSERT('position', {nid: this.state.noteInfo.nid, did: did, time: time, posx: posx, posy: posy, duration: 0});
		this.setMusicbox(did);
		this.setDancer();	// 추가해서 댄서가 active될 수 있으므로.
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
					this.positionboxWidth += 2;
					// this.positionboxHeight ++;
					this.setMusicboxs();
					this.forceUpdate();
					break;
				}
				return;
				
			case 'reduce':
				if(this.boxWidth > 20){
					this.boxWidth -= 2;
					this.positionboxWidth -= 2;
					// this.positionboxHeight --;
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
	 * - re-render: YES ( setDancer )
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
	 * - re-render: YES ( setDancer )
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

		this.setMusicbox(did);
		this.setDancer();	// 선택된 댄서 아이콘 보여주기 위해
	}

	/**
	 * 선택되어 있는 position box을 선택 취소한다.
	 * - re-render: YES ( setDancer )
	 * - update: musicbox
	 * - setMusicbox()
	 */
	unselectPosition = () => {
		console.log(TAG, 'unselectPosition');

		if(this.selectedBoxInfo.posIndex != -1){
			this.selectedBoxInfo.posIndex = -1;

			this.setMusicbox(this.selectedBoxInfo.did);
			this.setDancer(); // 선택된 댄서 아이콘 취소하기 위해
		}
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
	 * @param {number} time 수정되기 전 initial time
	 * @param {number} did 
	 */
	resizePositionboxLeft = (doUpdate, duration, time = this.selectedBoxInfo.time, did = this.selectedBoxInfo.did) => {
		console.log(TAG, "resizePositionboxLeft(", doUpdate, duration, time, did, ')');
		/**
		 * posList = [...this.allPosList[did]]
		 *  
		 * JSX 표현은 '참조 형식'이라 같은 값을 가리킨다. (포인터 개념)
		 * posList 변경시 allPosList의 값도 바뀐다.
		 * 
		 * 따라서 JSON.parse 를 사용하여 값을 복사해준다.
		 */
		let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
		
		// 변경했을 때 시간이 0보다 작아지는 것을 방지하기 위해
		// 변경 후 시간을 계산
		for(let i=0; i<posList.length; i++){
			if(posList[i].time == time){
				const leftEndTime = time + posList[i].duration - duration;
				if(leftEndTime < 0) {
					console.log(TAG, '왼쪽 끝이에요.');
					return;
				}
				break;
			}
		}

		if(!doUpdate){
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
				()=>{
					this.DB_UPDATE('position', 
					{duration: duration, time: this.selectedBoxInfo.time}, 
					['nid=?', 'did=?', 'time=?'], 
					[this.state.noteInfo.nid, did, time]);
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
		
		const rightEndTime = this.selectedBoxInfo.time + duration;
		if(this.state.noteInfo.musicLength < rightEndTime) {
			console.log(TAG, '오른쪽 끝이에요.');
			return;
		}

		// 화면에 보이는 선택된 값 업데이트를 위해
		this.selectedBoxInfo.duration = duration;

		if(!doUpdate){
			let posList = JSON.parse(JSON.stringify(this.allPosList[did]));
			posList[this.selectedBoxInfo.posIndex].duration = duration;

			// 댄서의 각 checked box 에 대해서...
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
			this.allPosList[did][this.selectedBoxInfo.posIndex].duration = duration;

			this.DB_UPDATE('position', 
				{duration: duration}, 
				['nid=?', 'did=?', 'time=?'], 
				[this.state.noteInfo.nid, did, this.selectedBoxInfo.time]);
			
			this.DB_DELETE('position', 
	  	['nid=?', 'did=?', 'time>?', 'time+duration<=?'], 
	  	[this.state.noteInfo.nid, did, this.selectedBoxInfo.time, rightEndTime]);

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

	/**
	 * 
	 * @param {boolean} doUpdate 
	 * @param {number} to 
	 * @param {number} from 
	 * @param {number} did 
	 */
	movePositionbox = (doUpdate, to, from = this.selectedBoxInfo.time, did = this.selectedBoxInfo.did) => {
		console.log(TAG, 'movePositionbox (', doUpdate, to, from, did, ')');

		if(to < 0 || this.state.noteInfo.musicLength < to + this.selectedBoxInfo.duration) return;

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

		// 음악이 load되지 않은 경우
		if(!this.sound) return;

		// 음악이 이미 플레이 중인 경우
		if(this.state.isPlay) return;		

		this.sound.play((success) => {
			if (success) {
				console.log(TAG, 'MUSIC PLAY!!');
			} else {
				console.log(TAG, 'playback failed due to audio decoding errors');
			}
		});
		
		this.interval = setInterval(() => {
			this.setTimebox(this.state.time+1);
			// time에 맞게 scroll view를 강제 scroll하기
			this.musicboxScrollHorizontal.scrollTo({x: (this.state.time+1)*this.boxWidth, animated: false});
			this.setState({time: this.state.time+1}, () => {
				if(this.state.time == this.state.noteInfo.musicLength)
					this.pause();
			});
		}, 1000);

		// 애니메이션 재생
		this.setState({isPlay: true}, () => {
			this.setDancer();
		});
	}

	pause = () => {
		console.log(TAG, "pause");
		clearInterval(this.interval);
	
		// music pause
		this.sound.pause();
		this.sound.setCurrentTime(this.state.time);

		// state 변경 후 dancer 위치 업데이트
		this.setState({isPlay: false}, () => {
			this.setDancer();
		});
	}

	jumpTo = (time) => {
		let dest = this.state.time + time;
		if(dest < 0) dest = 0;
		else if (dest > this.state.noteInfo.musicLength) dest = this.state.noteInfo.musicLength;

		this.setTimebox(dest);
		this.musicboxScrollHorizontal.scrollTo({x: (dest)*this.boxWidth, animated: false});
		this.setState({time: dest}, () => {
			this.setDancer();
		});
	}

	editTime = (text) => {
		/**
		 * JavaScript에는 replaceAll 함수가 없다. 
		 * 따라서 정규식을 사용해 replace으로 replaceAll의 효과를 사용했다.
		 * 
		 * text.replaceAll(' ', '') => text.replace(/ /gi, '')
		 * g: 발생할 모든 pattern에 대한 전역 검색
		 * i: 대/소문자 구분 안함
		 * m: 여러 줄 검색
		 */
		text = text.replace(/ /gi, '').split(':');

		let min = 0;
		let sec;
		let time = -1;
		
		// time 구하기
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

		// 변경
		if(time >= 0) {
			this.movePositionbox(true, time);
		
		// 	time = time > this.state.noteInfo.musicLength ? this.state.noteInfo.musicLength : time;
		// 	// UPDATE DB
		// 	// selectedBoxInfo 값을 변경하기 전에 원래값 기반으로 DB 먼저 수정.
		// 	this.DB_UPDATE('position', 
		// 		{time: time}, 
		// 		['nid=?', 'did=?', 'time=?'], 
		// 		[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.time]);
		// 	this.selectedBoxInfo.time = time;
		// 	this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].time = time;
		// 	this.setMusicbox(this.selectedBoxInfo.did);
		// 	this.setDancer();
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
				['nid=?', 'did=?', 'time=?'], 
				[this.state.noteInfo.nid, this.selectedBoxInfo.did, this.selectedBoxInfo.time]);
			this.selectedBoxInfo.posx = posx;
			this.allPosList[this.selectedBoxInfo.did][this.selectedBoxInfo.posIndex].posx = posx;
			this.setDancer();
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
				<Text style={styles.selectText}>시작:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editTime(event.nativeEvent.text)}>
					{isSelected ? this.timeFormat(this.selectedBoxInfo.time) : ''}</TextInput>
				<Text style={styles.selectText}> 길이:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editDuration(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.duration : ''}</TextInput>
				<Text style={styles.selectText}> X:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editX(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.posx : ''}</TextInput>
				<Text style={styles.selectText}> Y:</Text>
				<TextInput style={styles.selectTextInput} editable={isSelected} onEndEditing={(event)=>this.editY(event.nativeEvent.text)}>
					{isSelected ? this.selectedBoxInfo.posy : ''}</TextInput>
			</View>
		)
	}

	menuView = () =>
	<ScrollView horizontal={true} bounces={false} decelerationRate={0} showsHorizontalScrollIndicator={false}
	style={{flexDirection: 'row', maxHeight: 70}}>

		<TouchableOpacity 
		activeOpacity={1} style={styles.menuButton}
		onPress={() => {
			if(this.state.isPlay) { this.pause(); }
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

		<TouchableOpacity onPress={()=>this.resizeMusicList('reduce')} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='box-width-down' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>표간격 좁게</Text>
		</TouchableOpacity>

		<TouchableOpacity onPress={()=>this.resizeMusicList('expand')} activeOpacity={1} style={styles.menuButton}>
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

		<TouchableOpacity onPress={()=>{}} activeOpacity={1} style={styles.menuButton}>
			<CustomIcon name='edit-music' size={30} color={COLORS.grayMiddle}/>
			<Text style={styles.menuText}>노래 편집</Text>
		</TouchableOpacity>	

	</ScrollView>

	editTitle = (newTitle) => {
		console.log(TAG, 'editTitle');
		this.setState({noteInfo: {...this.state.noteInfo, title: newTitle}});
		this.DB_UPDATE('note', {title: '\"'+newTitle+'\"'}, ['nid=?'], [this.state.noteInfo.nid]);
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
							"ORDER BY did, time;",
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
								this.setMusicboxs();
								this.setDancer();
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
		this.pause();
		this.props.route.params.updateNoteList(this.state.noteInfo);
	}

	render() {
		console.log(TAG, "render");

		const buttonColor = this.state.isPlay ? COLORS.grayMiddle : COLORS.blackDark;

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

					<Text style={{flex: 1, width: 40, fontSize: 14, textAlign: 'center'}}>{this.timeFormat(this.state.noteInfo.musicLength)}</Text>

				</View>

				<View flexDirection='row' style={{flex: 1}}>
					
					{/* dancer 이름 */}
					<View flexDirection='column'>
						<View style={{height: this.boxHeight + 10}}/>
						<ScrollView
						bounces={false}						// 오버스크롤 막기 (iOS)
						decelerationRate={0}			// 스크롤 속도 (iOS)
						showsVerticalScrollIndicator={false}
						ref={ref => (this.nameScroll = ref)}
						scrollEventThrottle={16}
						// music box list와 동시에 움직이는 것처럼 보이기 위해 scrollTo의 animated를 false로 한다.
						onScroll={event => this.musicboxScrollVertical.scrollTo({y: event.nativeEvent.contentOffset.y, animated: false})}
						onScrollEndDrag={event => {
							// ceil로 한 이유: floor/round로 하면 맨 마지막 항목이 일부 짤리는 경우가 생길 수 있다.
							this.scrollOffset = Math.ceil(event.nativeEvent.contentOffset.y/this.boxHeight) * this.boxHeight;
							this.nameScroll.scrollTo({y: this.scrollOffset});
							this.musicboxScrollVertical.scrollTo({y: this.scrollOffset});}}>
							<View style={{flexDirection: 'column'}}>
								{ this.nameColumn }
							</View>
						</ScrollView>
					</View>

					<ScrollView 
					horizontal={true}
					bounces={false} 					// 오버스크롤 막기 (iOS)
					decelerationRate={0.5}		// 스크롤 속도 (iOS)
					scrollEnabled={!this.state.isEditing}
					showsHorizontalScrollIndicator={false}
					ref={ref => (this.musicboxScrollHorizontal = ref)}>

						<ScrollView
						bounces={false} 						// 오버스크롤 막기 (iOS)
						stickyHeaderIndices={[0]}		// 0번째 View 고정
						scrollEnabled={false}				// 스크롤 막기
						showsVerticalScrollIndicator={false}
						ref={ref => (this.musicboxScrollVertical = ref)}>

							<View flexDirection='row' style={{backgroundColor: COLORS.grayLight}}>
								<View style={{width: this.boxWidth/2}}/>
								{ this.timeTextSelect }
								<View style={{width: this.boxWidth/2}}/>
							</View>
							
							<View flexDirection='row'>
								<View style={{width: this.boxWidth/2}}/>
								<View flexDirection='column'>
									{ this.musicbox }
								</View>
								<View style={{width: this.boxWidth/2}}/>
							</View>

						</ScrollView>

					</ScrollView>
				</View>

				{this.menuView()}

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
					height: this.positionboxHeight, 
					width: this.positionboxWidth, 
					borderRadius: this.positionboxWidth/2,
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
})