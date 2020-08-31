import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, TextInput, Dimensions, Image, TouchableOpacity, Alert, Switch,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';

// custom library
import Dancer from '../components/Dancer'
import Positionbox from '../components/Positionbox'
import { COLORS } from '../values/Colors'
import { FONTS } from '../values/Fonts'

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "FormationScreen/";
const boxSize = 25;
const positionboxSize = 15;

// 화면의 가로, 세로 길이 받아오기
const {width,height} = Dimensions.get('window');

export default class FormationScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
      db,
			noteId: props.route.params.noteId,
			time: 0,
			musicLength: 20,
			isPlay: false,		// play 중인가?
			isEditing: false,	// <Positionbox>를 편집중인가?
			dancers: [],
			nameColumn: [],
		}
		this.allPosList=[];
		this.dancerList=[];	// nid, did, name
		this.scrollView;
		this.scrollViewStyle;
		this.timeText = [];
		this.musicbox = [];	
		this.selectedPositionIdx = -1;	// unselect: -1, select: >=0

		this.coordinateLevel = props.route.params.coordinateLevel;
		this.radiusLevel = props.route.params.radiusLevel;
		this.alignWithCoordinate = false;

		this.setCoordinate();
	}

	DB_UPDATE = (table, set, where) => {
		console.log(TAG, 'DB_UPDATE');

		let setString = "*";
		let whereString = "*";

		for(let key in set)
			setString += ", " + key + "=" + set[key];
		
		for(let key in where)
			whereString += " AND " + key + "=" + where[key];
		
		setString = setString.replace("*, ", "");
		whereString = whereString.replace("* AND ", "");

		this.state.db.transaction(txn => {
			txn.executeSql(
				"UPDATE " + table + " " +
				"SET " + setString + " " +
				"WHERE " + whereString + ";",
				[],
				() => {console.log('update good')},
				(error) => {console.log('ERROR:', error)}
			);
		});
	}

	DB_DELETE = (table, where) => {
		console.log(TAG, 'DB_DELETE');
		let whereString = "*";

		for(let key in where)
			whereString += " AND " + key + "=" + where[key];
		
		whereString = whereString.replace("* AND ", "");

		this.state.db.transaction(txn => {
      txn.executeSql(
				"DELETE FROM " + table + " " +
				"WHERE " + whereString,
				[],
				() => {console.log('delete good')},
				(error) => {console.log('ERROR:', error)}
			);
		});
	}

	DB_INSERT = (table, value) => {
		console.log(TAG, 'DB_INSERT');
		let keyString = "*";
		let valueString = "*";

		for(let key in value){
			keyString += ", " + key;
			valueString += ", " + value[key];
		}
		keyString = keyString.replace("*, ", "");
		valueString = valueString.replace("*, ", "");

		this.state.db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO " + table + "(" + keyString + ")" + " VALUES (" + valueString + ");",
				[],
				() => {console.log('insert good')},
				(error) => {console.log('ERROR:', error)}
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
					<TouchableOpacity
					key={this.timeText.length}
					style={[styles.boxSize, {justifyContent: 'center', alignItems: 'center'}]}
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
				)
			}
		}

		// this.timeText: 아무 마크도 없는 pure한 array (음악 길이가 변경되지 않는 한 절대 변경되지 않음)
		// _timeText: 특정 시간이 마크되어 있는 array

		_timeText = [...this.timeText];
		_timeText[markedTime] = 
		<View
		key={markedTime}
		style={[styles.boxSize, {justifyContent: 'center', alignItems: 'center', borderColor: COLORS.grayMiddle, borderRadius: boxSize/2, borderWidth: 1}]}>
			<Text style={{fontSize: 11}}>{markedTime}</Text>
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
	 * @param did 
	 */
	setMusicbox = (did) => {
		let prevTime = 0;
		let rowView = [];
		
		for(let i=0; i<this.allPosList[did].length; i++){

			const curTime = this.allPosList[did][i].time;
			const duration = this.allPosList[did][i].duration;

			for(let time=prevTime+1; time<curTime; time++){
				rowView.push(
					<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, time)}>
						<View style={styles.uncheckedBox}></View>
					 </TouchableOpacity>
				)
			}

			rowView.push(
				<TouchableOpacity 
				key={rowView.length} 
				onPress={()=>this.selectPosition(did, i)}
				onLongPress={()=>this.deletePosition(did, curTime)}
				style={{alignItems: 'center', justifyContent: 'center'}}>
					<View style={{
						height: boxSize, 
						width: 1, 
						marginLeft: (boxSize-1)/2,
						marginRight: (boxSize-1)/2 + boxSize*duration,
						backgroundColor: COLORS.grayMiddle,
					}}/>
					{ did == this.selectedDid && i == this.selectedPositionIdx ?
					<Positionbox
					boxSize={boxSize}
					positionboxSize={positionboxSize}
					duration={duration}
					setScrollEnable={this.setScrollEnable}
					changeDuration={this.changeDuration}
					unselectPosition={this.unselectPosition}/>
					:
					<View style={{
						height: positionboxSize, 
						width: positionboxSize + boxSize * duration, 
						marginHorizontal: boxSize/2 - 5,
						backgroundColor: COLORS.red,
						borderRadius: 5,
						position: 'absolute'
					}}/>
				}
				</TouchableOpacity>
			)

			prevTime = curTime + duration;
		}

		// 마지막 대열~노래 끝부분까지 회색박스 채우기
		for(let i=prevTime+1; i<=this.state.musicLength; i++){
			rowView.push(
				<TouchableOpacity key={rowView.length} onLongPress={()=>this.addPosition(did, i)}>
					<View style={styles.uncheckedBox}></View>
				</TouchableOpacity>
			)
		}

		this.musicbox.splice(1+did, 1,
			<View 
			key={1+did}
			flexDirection='row'>
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

		// 댄서 0명일 경우: 비어있는 row 하나 추가
		if(this.dancerList.length == 0){
			let rowView = [];
			// 마지막 대열~노래 끝부분까지 회색박스 채우기
			for(let i=0; i<=this.state.musicLength; i++){
				rowView.push( <View style={styles.uncheckedBox}/> )
			}
			this.musicbox.splice(1, 1,
				<View 
				key={1}
				flexDirection='row'>
					{rowView}
				</View>
			)
		}
		// 댄서가 존재하는 경우
		else{
			for(let did=0; did<this.dancerList.length; did++)
			this.setMusicbox(did);
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
			for(let y=Math.ceil((-height/5)/coordinateSpace)*coordinateSpace; y<height/5; y=y+coordinateSpace){
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
		const dancerNum = this.allPosList.length;

		let _dancers = [];
		let _nameColumn = [ <Text key={0} style={{height: boxSize, width: 60}}/> ];

		for(let i=0; i<dancerNum; i++){
      _dancers.push(
				<Dancer 
				key={_dancers.length}
				did={i} 
				position={this.allPosList[i]} 
				dropPosition={this.dropPosition} 
				curTime={this.state.time}
				isPlay={this.state.isPlay}
				radiusLevel={this.radiusLevel}
				alignWithCoordinate={this.alignWithCoordinate}
				coordinateLevel={this.coordinateLevel}
				// elevation={100}
				/>
			)
			_nameColumn.push(
				<Text key={_nameColumn.length} style={{height: boxSize, width: 60, fontSize: 11, textAlignVertical: 'center'}}>
					{i+1}. {this.dancerList[i].name}
				</Text>
			)
		}
		this.setState({dancers: _dancers, nameColumn: _nameColumn})
	}
	
	/** <Dancer>에서 드래그 후 드랍한 위치 정보로 position DB에 추가/수정한다.
	 * - re-render: YES ( forceUpdate() )
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
				if(this.selectedPositionIdx != -1 && this.selectedDid == did && this.selectedTime == time){
					this.selectedPosx = posx;
					this.selectedPosy = posy;
				}
				newPos = {...newPos, duration: posList[i].duration};
				posList.splice(i, 1, newPos);
				this.DB_UPDATE('position', {posx: posx, posy: posy}, {nid: this.state.noteId, did: did, time: time});
				this.setMusicbox(did);
				this.forceUpdate();
				return;
			}
			// 존재하지 않는 시간인 경우: INSERT
			else if(time < posList[i].time)
				break;
		}
		posList.splice(i, 0, newPos);
		this.DB_INSERT('position', {nid: this.state.noteId, did: did, time: time, posx: posx, posy: posy, duration: 0})
		this.setMusicbox(did);
		this.forceUpdate();
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
		posList.splice(i, 0, {posx: posx, posy: posy, time: time, duration: 0});

		this.DB_INSERT('position', {nid: this.state.noteId, did: did, time: time, posx: posx, posy: posy, duration: 0});
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

		if(time == 0) {
			Alert.alert("경고", "초기 상태는 지울 수 없어요!");
			return;
		}

		let posList = this.allPosList[did];
		for(let i=0; i<posList.length; i++){
			if(time == posList[i].time){
				posList.splice(i, 1);
				break;
			}
		}

		this.DB_DELETE('position', {nid: this.state.noteId, did: did, time: time})
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
		this.DB_UPDATE('note', {coordinateLevel: this.coordinateLevel}, {nid: this.state.noteId});
		this.setCoordinate();
		this.forceUpdate();
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
		this.DB_UPDATE('note', {radiusLevel: this.radiusLevel}, {nid: this.state.noteId});
		this.setDancer();
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
	 * - update: this.selected~, musicbox
	 * - setMusicbox()
	 * @param {number} did 
	 * @param {number} positionIdx 
	 */
	selectPosition = (did, positionIdx) => {
		console.log(TAG, 'selectPosition(', did, positionIdx, ')');

		// 선택되어 있던 것 제거
		if(this.selectedPositionIdx != -1){
			this.unselectPosition();
		}
		
		this.selectedDid = did;
		this.selectedPositionIdx = positionIdx;

		this.selectedDancer = (did+1) + '. ' + '함창수';
		this.selectedTime = this.allPosList[did][positionIdx].time;
		this.selectedPosx = this.allPosList[did][positionIdx].posx;
		this.selectedPosy = this.allPosList[did][positionIdx].posy;
		this.selectedDuration = this.allPosList[did][positionIdx].duration;

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
		this.selectedPositionIdx = -1;

		this.setMusicbox(this.selectedDid);
		this.forceUpdate();
	}

	/** <Positionbox>를 편집중인 경우, scroll을 비활성화한다.
	 * - re-render: YES ( setState )
	 * - update: state.isEditing
	 * @param {boolean} isEditing <Positionbox>를 편집중인가?
	 */
	setScrollEnable = (isEditing) => {
		this.setState({isEditing: isEditing});
	}

	/** 변경된 duration을 적용하고, 편집이 끝난 경우 DB를 업데이트 한다.
	 * - re-render: YES ( forceUpdate )
	 * - update: musicbox, allPosList, selectedDuration
	 * - setMusicbox, DB_UPDATE
	 * @param {number} changedDuration 
	 * @param {boolean} isEditing 
	 */
	changeDuration = (changedDuration, isEditing) => {
		console.log(TAG, 'changeDuration', changedDuration);

		// 변경된 duration으로 수정
		const did = this.selectedDid;
		this.allPosList[did][this.selectedPositionIdx].duration = changedDuration;
		this.selectedDuration = changedDuration;
		
		// box 수정
		this.setMusicbox(did);
		this.forceUpdate();

		// 수정이 끝났다면 DB 업데이트
		if(!isEditing)
			this.DB_UPDATE('position', {duration: changedDuration}, {nid: this.state.noteId, did: this.selectedDid, time: this.selectedTime});
	}

	/** 초(sec) => "분:초" 변환한다.
	 * - re-render: NO
	 * @param {number} sec 
	 * @returns {string} 'min:sec'
	 */
	timeFormat(sec){
		return Math.floor(sec/60) + ':' + ( Math.floor(sec%60) < 10 ? '0'+Math.floor(sec%60) : Math.floor(sec%60) )
	}

	render() {
		console.log(TAG, "render");

		return(
			<SafeAreaView style={{flexDirection: 'column', flex: 1, paddingHorizontal: 5}}>

				<View style={{width: '100%', height: 50, flexDirection: 'row', backgroundColor: COLORS.yellow, alignItems: 'center', justifyContent: 'space-between'}}>
					<IconIonicons name="cog-outline" size={24} color="#ffffff"/>
					<Text>댄서{"\n"}크기</Text>
					<TouchableOpacity onPress={()=>this.resizeDancer('up')}>
						<IconIonicons name="expand" size={24} color="#ffffff"/>
					</TouchableOpacity>
					<TouchableOpacity onPress={()=>this.resizeDancer('down')}>
						<IconIonicons name="contract" size={24} color="#ffffff"/>
					</TouchableOpacity>
					<Text>좌표{"\n"}간격</Text>
					<TouchableOpacity onPress={()=>this.resizeCoordinate('up')}>
						<IconIonicons name="expand" size={24} color="#ffffff"/>
					</TouchableOpacity>
					<TouchableOpacity onPress={()=>this.resizeCoordinate('down')}>
						<IconIonicons name="contract" size={24} color="#ffffff"/>
					</TouchableOpacity>
					<Text>좌표{"\n"}맞춤</Text>
					<Switch
					trackColor={{ false: COLORS.red, true: COLORS.blue }}
					thumbColor={this.alignWithCoordinate ? "#f5dd4b" : "#f4f3f4"}
					ios_backgroundColor="#3e3e3e"
					onValueChange={() => {
						console.log("switch! change to " + !this.alignWithCoordinate);
						this.alignWithCoordinate = !this.alignWithCoordinate;
						this.setDancer();
					}}
					value={this.alignWithCoordinate}/>
					<Text>댄서{"\n"}편집</Text>
					<TouchableOpacity onPress={()=>{
						if(this.state.isPlay) this.setState({isPlay: false})
						this.props.navigation.navigate('Dancer', {noteId: this.state.noteId, dancerList: this.dancerList, allPosList: this.allPosList, changeDancerList: this.changeDancerList})}
						}>
						<IconIonicons name="people-sharp" size={24} color="#ffffff"/>
					</TouchableOpacity>
				</View>
				
				
				<View style={{height: height*2/5, alignItems: 'center', justifyContent: 'center'}}>
					<View style={{width: width, height: height*2/5, backgroundColor: COLORS.white}}/>
					{ this.coordinate }
					{ this.state.dancers }
				</View>
				
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					{ this.state.isPlay ? 
					<TouchableOpacity onPress={()=>{this.pause()}} style={{margin: 10}}>
						<IconAntDesign name="pausecircleo" size={25}/>
					</TouchableOpacity>
					:
					<TouchableOpacity onPress={()=>{this.play()}} style={{margin: 10}}>
						<IconAntDesign name="play" size={25}/>
					</TouchableOpacity>
					}
					<Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{this.timeFormat(this.state.time)}</Text>
					{ this.selectedPositionIdx != -1 ? 
						<View style={{flexDirection: 'column'}}>
							<View style={{flexDirection: 'row'}}>
								<Text style={{fontSize: 14, textAlign: 'left'}}>선택된 댄서: {this.selectedDancer}  </Text>
								<Text style={{fontSize: 14, textAlign: 'left'}}>time: {this.selectedTime}  </Text>
							</View>
							<View style={{flexDirection: 'row'}}>
								<Text style={{fontSize: 14, textAlign: 'left'}}>posx: {this.selectedPosx}  </Text>
								<Text style={{fontSize: 14, textAlign: 'left'}}>posy: {this.selectedPosy}  </Text>
								<Text style={{fontSize: 14, textAlign: 'left'}}>duration: {this.selectedDuration}  </Text>
							</View>
						</View>
						:
						<View/>
					}
				</View>

				<ScrollView style={{flex: 1}} scrollEnabled={!this.state.isEditing}>
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

			</SafeAreaView>
		)
	}

	componentDidMount() {
		console.log(TAG, "componentDidMount");

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
						this.dancerList.push(dancerResult.rows.item(i)); // {did, name}
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
				[this.state.noteId],
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

	play = async () => {
		console.log(TAG, "play");
		this.interval = setInterval(() => {
			this.setTimebox(this.state.time+1);
			// time에 맞게 scroll view를 강제 scroll하기
			this.scrollView.scrollTo({x: (this.state.time-5)*boxSize, animated: false});
			this.setState({time: this.state.time+1});
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

	// componentDidUpdate() { }

	componentWillUnmount() {
		console.log(TAG, "componentWillUnmount");
		clearInterval(this.interval);
	}
}

const styles = StyleSheet.create({
	uncheckedBox: {
		height: boxSize, 
		width: 1, 
		marginHorizontal: (boxSize-1)/2, 
		backgroundColor: COLORS.grayMiddle
	},
	boxSize: {
		height: boxSize, 
		width: boxSize,
	}
})