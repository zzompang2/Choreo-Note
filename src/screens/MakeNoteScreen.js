import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Sound from 'react-native-sound';
// Enable playback in silence mode
Sound.setCategory('Playback');

// custom library
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];
let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "MakeNoteScreen/";

const {width, height} = Dimensions.get('window');
const STAGE_SIZE_MIN = 500;
const STAGE_SIZE_MAX = 3000;

export default class MakeNoteScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			nid: this.props.route.params.nid,
		};
		this.ratio = 1;					// 무대 세로/가로
		this.dancerList = [];		// {nid, did, name, color}
		this.allPosList = [];		// {nid, did, time, posx, posy, duration}
		this.formationList = [
			[
				{did:0, posx:0, posy:0},
			],
			[
				{did:0, posx:-60, posy:0},
				{did:1, posx:60, posy:0},
			],
			[
				{did:0, posx:-60, posy:30},
				{did:1, posx:0, posy:-30},
				{did:2, posx:60, posy:30},
			],
		];
		this.noteInfo  = {
			nid: this.state.nid, 
			title: '', 
			date: this.props.route.params.date, 
			music: 'love.mp3',		// sample music 
			musicLength: 30, 
			radiusLevel: 3, 
			coordinateLevel: 3, 
			alignWithCoordinate: 1,
			stageWidth: 1200,
			stageHeight: 600,
		};

		this.setCoordinate();
		this.setDancer(1);
	}

	/**
	 * 
	 * @param {number} ratio 무대 세로/가로
	 */
	setCoordinate = () => {
		console.log(TAG, 'setCoordinate');
		const coordinateSpace = 15 + this.noteInfo.coordinateLevel*5;
		const stageHeight = width * this.noteInfo.stageHeight / this.noteInfo.stageWidth;
		this.coordinate = [];

		for(let x=Math.round((-width/2)/coordinateSpace)*coordinateSpace; x<width/2; x=x+coordinateSpace){
			for(let y=Math.ceil((-stageHeight/2+1)/coordinateSpace)*coordinateSpace; y<stageHeight/2; y=y+coordinateSpace){
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
		this.forceUpdate();
	}

	setDancer = (num = this.dancerList.length) => {
		console.log(TAG, "setDancer");
		this.dancers = [];
	
		if(isNaN(num)){
			num = this.parseTextToNum(num);
		}

		if(num < 0 || num > 20){
			console.log('0명 이상, 20명 이하만 가능합니다.');
			return;
		}

		const radiusLength = 8 + this.noteInfo.radiusLevel * 2;;
		const height = 90;

		this.allPosList = [];
		
		if(num <= this.dancerList.length){
			const deleteNum = this.dancerList.length - num;
			for(let i=0; i<deleteNum; i++)
				this.dancerList.pop();
		}
		else{
			for(let i=this.dancerList.length; i<num; i++)
				this.dancerList.push({nid: this.state.nid, did: i, name: '', color: 0});
		}
		
		for(let i=0; i<num; i++){
			const posx = this.formationList[num-1][i].posx;
			const posy = this.formationList[num-1][i].posy;
			this.allPosList.push({nid: this.state.nid, did: i, time: 0, posx: posx, posy: posy, duration: 0});
		}

		for(let i=0; i<num; i++){
      this.dancers.push(
				<View
				key={this.dancers.length}
				style={[
					{transform: [{translateX: this.allPosList[i].posx}, {translateY: this.allPosList[i].posy}]},
					{
						backgroundColor: dancerColor[this.dancerList[i].color],
						position: 'absolute',
						alignItems: 'center',
						justifyContent: 'center',
						width: radiusLength*2, 
						height: radiusLength*2, 
						borderRadius: radiusLength
					}
				]}>
					<Text style={{textAlign: 'center', fontSize: radiusLength}}>{i+1}</Text>
				</View>
			)
		}
		this.forceUpdate();
	}

	parseTextToNum = (text) => {
		// number -> number
		if(!isNaN(text))
			return text;
		
		const noSpace = text.replace(/ /gi, '');
		if(isNaN(Number(noSpace)) || noSpace == ''){
			console.log('숫자가 아닙니다.');
			return text;
		}
		return Number(noSpace);
	}

	setStage = (width = 0, height = 0) => {
		width = this.parseTextToNum(width);
		height = this.parseTextToNum(height);

		if(isNaN(width) || isNaN(height)) return;
		
		if(width == 0) width = this.noteInfo.stageWidth;
		else if(width < STAGE_SIZE_MIN) width = STAGE_SIZE_MIN;
		else if(width > STAGE_SIZE_MAX) width = STAGE_SIZE_MAX;

		if(height == 0) height = this.noteInfo.stageHeight;
		else if(height < STAGE_SIZE_MIN) height = STAGE_SIZE_MIN;
		else if(height > STAGE_SIZE_MAX) height = STAGE_SIZE_MAX;
			
		this.noteInfo.stageWidth = width;
		this.noteInfo.stageHeight = height;

		this.setCoordinate();
	}
	

	// flatList 구분선
	listViewItemSeparator = () => 
		<View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>
	
	resizeDancer = (type) => {
		switch(type){
			case 'up':
				if(this.noteInfo.radiusLevel < 5){
					this.noteInfo.radiusLevel++;
					break;
				}
				return;
			case 'down':
				if(this.noteInfo.radiusLevel > 1){
					this.noteInfo.radiusLevel--;
					break;
				}
				return;
			default:
				return;
		}
		this.setDancer();
	}

	resizeCoordinate = (type) => {
		switch(type){
			case 'up':
				if(this.noteInfo.coordinateLevel < 5){
					this.noteInfo.coordinateLevel++;
					break;
				}
				return;
			case 'down':
				if(this.noteInfo.coordinateLevel > 1){
					this.noteInfo.coordinateLevel--;
					break;
				}
				return;
			default:
				return;
		}
		this.setCoordinate();
	}

	completeMakingNote = () => {
		// 이름이 공백인 경우
		if(this.noteInfo.title.replace(/ /gi, '') == ''){
			console.log('제목을 적어주세요.');
			Alert.alert('제목이 비어있음', '제목을 입력해 주세요.');
			return;
		}

		// 노래가 없는 경우

		// 노래 있는 경우
		// 재생해보고 musicLength 업데이트

		// dancer 추가
		for(let i=0; i<this.dancerList.length; i++){
			db.transaction(txn => {
				txn.executeSql(
					"INSERT INTO dancer VALUES (?, ?, ?, ?);",
					[this.noteInfo.nid, i, this.dancerList[i].name, this.dancerList[i].color]
				);
			});
		}

		// position 추가
		for(let i=0; i<this.allPosList.length; i++){
			db.transaction(txn => {
				txn.executeSql(
					"INSERT INTO position VALUES (?, ?, 0, ?, ?, 0);",
					[this.noteInfo.nid, this.allPosList[i].did, this.allPosList[i].posx, this.allPosList[i].posy],
					() => {console.log('success!');},
					(e) => {console.log('ERROR', e);}
				);
			});
		}

		// 노트 추가하고 리스트로 이동
		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO note VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);", 
				[this.noteInfo.nid, this.noteInfo.title, this.noteInfo.date, this.noteInfo.music, this.noteInfo.musicLength, 
					this.noteInfo.radiusLevel, this.noteInfo.coordinateLevel, this.noteInfo.stageWidth, this.noteInfo.stageHeight],
				() => {
					this.props.route.params.updateNoteList(this.noteInfo);
					this.props.navigation.goBack();
				},
				(e) => {console.log('ERROR:', e);}
			);
		});
	}

	render() {
		console.log(TAG, 'render');
		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>

				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}} style={styles.toolbarButton}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>새로운 노트 만들기</Text>

					<TouchableOpacity style={styles.toolbarButton} onPress={this.completeMakingNote}>
						<Text style={styles.buttonText}>완료</Text>
					</TouchableOpacity>
				</View>

				{/* 노트 제목 */}
				<View style={styles.noteItem}>
					<TextInput 
					numberOfLines={1}
					maxLength={30}
					style={styles.title}
					placeholder="노트 제목을 입력해 주세요."
					onChangeText={text=>{this.noteInfo.title = text;}}>
						{this.noteInfo.title}
					</TextInput>
					<View style={styles.rowContainer}>
						<IconIonicons name="calendar" size={15} color={COLORS.grayMiddle}/>
						<Text numberOfLines={1} style={styles.date}> {this.noteInfo.date}</Text>
						<IconIonicons name="musical-notes" size={15} color={COLORS.grayMiddle}/>
						<Text numberOfLines={1} style={styles.music}> {this.noteInfo.music == '' ? '노래 없음' : this.noteInfo.music}</Text>
					</View>
				</View>
				
				{this.listViewItemSeparator()}

				{/* 무대 비율 버튼 */}
				{/* <View flexDirection='row'>
					<Text>무대 비율</Text>
					<TouchableOpacity onPress={()=>{this.ratio = 1; this.setCoordinate();}} style={styles.stageSizeButton}>
						<Text style={styles.stageSizeText}>1:1</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>{this.ratio = 3/4; this.setCoordinate();}} style={styles.stageSizeButton}>
						<Text style={styles.stageSizeText}>4:3</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>{this.ratio = 9/16; this.setCoordinate();}} style={styles.stageSizeButton}>
						<Text style={styles.stageSizeText}>16:9</Text>
					</TouchableOpacity>
				</View> */}

				{/* 무대 비율 & 댄서 인원 수 */}
				<View style={styles.selectContainer}>
					<Text style={styles.selectText}>무대 크기(cm):</Text>
					<TextInput maxLength={5} style={[styles.selectTextInput, {width: 60}]} 
					onEndEditing={(event)=>this.setStage(event.nativeEvent.text, 0)}>
						{this.noteInfo.stageWidth}</TextInput>
					<Text style={styles.selectText}>x</Text>
					<TextInput maxLength={5} style={[styles.selectTextInput, {width: 60}]} 
					onEndEditing={(event)=>this.setStage(0, event.nativeEvent.text)}>
						{this.noteInfo.stageHeight}</TextInput>
						
					<View style={{width: 30}}/>

					<Text style={styles.selectText}>댄서:</Text>
					<TextInput style={[styles.selectTextInput, {width: 40}]} 
					placeholder={"0"}
					numberOfLines={1}
					maxLength={2}
					onEndEditing={(event)=>{this.setDancer(event.nativeEvent.text)}}>
						{this.dancers.length}
						</TextInput>
					<Text style={styles.selectText}> 명</Text>
				</View>

				<View style={{flexDirection: 'row', justifyContent: 'center'}}>
					{/* 댄서 크기 조절 */}
					{/* <Text>댄서 크기</Text>
					<TouchableOpacity onPress={()=>this.resizeDancer('down')} activeOpacity={1} style={styles.menuButton}>
						<IconIonicons name='remove-circle' size={30} color={COLORS.grayMiddle}/>
					</TouchableOpacity>

					<Text>{this.noteInfo.radiusLevel}</Text>

					<TouchableOpacity onPress={()=>this.resizeDancer('up')} activeOpacity={1} style={styles.menuButton}>
						<IconIonicons name='add-circle' size={30} color={COLORS.grayMiddle}/>
					</TouchableOpacity> */}

					{/* 좌표 간격 조절 */}
					{/* <Text>좌표 간격</Text>
					<TouchableOpacity onPress={()=>this.resizeCoordinate('down')} activeOpacity={1} style={styles.menuButton}>
						<IconIonicons name='remove-circle' size={30} color={COLORS.grayMiddle}/>
					</TouchableOpacity>

					<Text>{this.noteInfo.coordinateLevel}</Text>

					<TouchableOpacity onPress={()=>this.resizeCoordinate('up')} activeOpacity={1} style={styles.menuButton}>
						<IconIonicons name='add-circle' size={30} color={COLORS.grayMiddle}/>
					</TouchableOpacity> */}
					
					{/* <TouchableOpacity onPress={()=>this.resizeStage()} activeOpacity={1} style={styles.menuButton}>
						<View style={{alignItems: 'center', justifyContent: 'center'}}>
							<CustomIcon name='dancer-down' size={30} color={COLORS.grayMiddle}/>
							<Text style={{position: 'absolute', color: COLORS.white, fontSize: 12}}>{this.noteInfo.stageRatio}</Text>
						</View>
						<Text style={styles.menuText}>무대 사이즈</Text>
					</TouchableOpacity> */}

					<TouchableOpacity onPress={()=>this.resizeDancer('down')} activeOpacity={1} style={styles.menuButton}>
						<View style={{alignItems: 'center', justifyContent: 'center'}}>
							<CustomIcon name='dancer-down' size={30} color={COLORS.grayMiddle}/>
							<Text style={{position: 'absolute', color: COLORS.white, fontSize: 12}}>{this.noteInfo.radiusLevel}</Text>
						</View>
						<Text style={styles.menuText}>댄서 작게</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>this.resizeDancer('up')} activeOpacity={1} style={styles.menuButton}>
						<View style={{alignItems: 'center', justifyContent: 'center'}}>
							<CustomIcon name='dancer-up' size={30} color={COLORS.grayMiddle}/>
							<Text style={{position: 'absolute', color: COLORS.white, fontSize: 14}}>{this.noteInfo.radiusLevel}</Text>
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
							<Text style={{position: 'absolute', color: COLORS.grayMiddle, fontSize: 14}}>{this.noteInfo.coordinateLevel}</Text>
						</View>
						<Text style={styles.menuText}>좌표 넓게</Text>
					</TouchableOpacity>

				</View>

				{/* 무대 */}
				{/* <View style={{height: width, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.grayMiddle}}> */}
					<View style={{width: width, height: width * this.noteInfo.stageHeight / this.noteInfo.stageWidth, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.grayLight}}>
						{ this.coordinate }
						{ this.dancers }
					</View>
				{/* </View> */}

				{/* 댄서 이름, 색 편집 */}
				<FlatList
				showsVerticalScrollIndicator={false}
				data={this.dancerList}
				ItemSeparatorComponent={this.listViewItemSeparator}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({item}) => 
					<View style={styles.dancerItem}>

						<Text 
						style={{width: 20, fontSize: 16, color: COLORS.grayMiddle,}}>
							{item.did+1}
						</Text>

						<TextInput
						maxLength={10}
						style={{flex: 1, fontSize: 16, color: COLORS.blackDark, padding: 10,}}
						placeholder="이름을 입력해 주세요."
						onEndEditing={(event)=>{this.dancerList[item.did].name = event.nativeEvent.text;}}
						autoCorrect={false}>
							{item.name}
						</TextInput>

						<TouchableOpacity activeOpacity={1} onPress={()=>{
							this.dancerList[item.did].color = (this.dancerList[item.did].color+1)%dancerColor.length; 
							this.setDancer();
						}}>
							<View style={{
								width: 20, 
								height: 20,
								borderRadius: 10,
								backgroundColor: dancerColor[item.color],
								marginHorizontal: 15}}/>
						</TouchableOpacity>

					</View>
				}
				/>

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
		fontFamily: FONTS.binggrae,	
	},
	toolbarButton: {
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noteItem: {
		
		height: 65,
		flexDirection: 'column',
		marginLeft: 15,
    marginRight: 15,
	},
	rowContainer: {
		flexDirection:'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	title: {
		flex: 1,
		color: COLORS.blackDark,
		fontSize: 18,
		marginTop: 5,
		paddingVertical: 5,
    fontFamily: FONTS.binggrae_bold,
	},
	date: {
		width: 70,
    color: COLORS.grayMiddle, 
		fontSize:12,
    //fontFamily: FONTS.binggrae2,
  },
  music: {
    color: COLORS.grayMiddle, 
    fontSize:12,
    //fontFamily: FONTS.binggrae2,
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
	buttonText: {
		color: COLORS.white,
	},
	// stageSizeButton: {
	// 	width: 60,
	// 	height: 30,
	// 	backgroundColor: COLORS.grayLight,
	// 	borderRadius: 20,
	// 	alignItems: 'center',
	// 	justifyContent: 'center',
	// 	margin: 10,
	// },
	// stageSizeText: {
	// 	fontSize: 16
	// },
	dancerItem: {
		flex: 1,
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 15,
    marginRight: 15,
	},
	selectContainer: {
		flexDirection: 'row', 
		width:'100%', 
		height:50,
		alignItems: 'center',
		padding: 10,
	},
	selectText: {
		fontSize: 12,
		textAlign: 'left',
		color: COLORS.grayMiddle,
		padding: 3,
	},
	selectTextInput: {
		fontSize: 14,
		textAlign: 'center',
		color: COLORS.grayDark,
		padding: 3,
		margin: 3,
		borderRadius: 5,
		borderColor: COLORS.grayMiddle,
		borderWidth: 1,
	},
})