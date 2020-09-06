import React from 'react';
import {
	SafeAreaView, StyleSheet, View, Text, Dimensions, TouchableOpacity, Alert, TextInput, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

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

export default class MakeNoteScreen2 extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			nid: this.props.route.params.nid,
		};
		this.ratio = 1;					// 무대 세로/가로
		this.dancerList = [];		// {nid, did, name, color}
		this.allPosList = [];		// {nid, did, beat, posx, posy, duration}
		this.dancers = [];			// dancer View
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
		this.noteInfo  = this.props.route.params.noteInfo;
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

		const screen = this.getStageSizeOnScreen();

		for(let x=Math.ceil((-screen.width/2)/coordinateSpace)*coordinateSpace; x<screen.width/2; x=x+coordinateSpace){
			for(let y=Math.ceil((-screen.height/2)/coordinateSpace)*coordinateSpace; y<screen.height/2; y=y+coordinateSpace){
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
			this.allPosList.push({nid: this.state.nid, did: i, beat: 0, posx: posx, posy: posy, duration: 0});
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
	listViewItemSeparator = () => <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>
	
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
		// dancer DB 추가
		for(let i=0; i<this.dancerList.length; i++){
			db.transaction(txn => {
				txn.executeSql(
					"INSERT INTO dancer VALUES (?, ?, ?, ?);",
					[this.noteInfo.nid, i, this.dancerList[i].name, this.dancerList[i].color]
				);
			});
		}

		// position DB 추가
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

		console.log('INSERT INTO note VALUES (', this.noteInfo.nid, this.noteInfo.title, this.noteInfo.date, this.noteInfo.music, this.noteInfo.musicLength, this.noteInfo.bpm, this.noteInfo.sync,
		this.noteInfo.radiusLevel, this.noteInfo.coordinateLevel, this.noteInfo.stageWidth, this.noteInfo.stageHeight, ')');
		// DB note 추가하고 리스트로 이동
		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO note VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);", 
				[this.noteInfo.nid, this.noteInfo.title, this.noteInfo.date, this.noteInfo.music, this.noteInfo.musicLength, this.noteInfo.bpm, this.noteInfo.sync,
					this.noteInfo.radiusLevel, this.noteInfo.coordinateLevel, this.noteInfo.stageWidth, this.noteInfo.stageHeight],
				() => {
					this.props.route.params.updateNoteList(this.noteInfo);
					this.props.navigation.navigate('List');
				},
				(e) => {console.log('ERROR:', e);}
			);
		});
	}

	getStageSizeOnScreen = () => {
		let screenWidth = width;
		let screenHeight = width * this.noteInfo.stageHeight / this.noteInfo.stageWidth;
		if(screenHeight > height/3){
			console.log(screenHeight, '>', height/3);
			screenHeight = height/3;
			screenWidth = height/3 * this.noteInfo.stageWidth / this.noteInfo.stageHeight;
		}

		return {width: screenWidth, height: screenHeight};
	}

	/**
	 * 
	 * @param {{}} musicInfo {music: [music title], path: [music file path]}
	 */

	componentDidMount() {
		this.setCoordinate();
		this.setDancer(1);
	}

	render() {
		console.log(TAG, 'render');
		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>

				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}} style={styles.toolbarButton}>
					<Text style={styles.buttonText}>이전</Text>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>{this.noteInfo.title}</Text>

					<TouchableOpacity style={styles.toolbarButton} onPress={this.completeMakingNote}>
						<Text style={styles.buttonText}>완료</Text>
					</TouchableOpacity>
				</View>

				
				{/* 무대 비율 & 댄서 인원 수 */}
				<View style={styles.selectContainer}>
					<Text style={styles.selectText}>무대 크기(cm):</Text>
					<TextInput maxLength={5} style={[styles.selectTextInput, {width: 60}]} placeholder={'가로'} placeholderTextColor={COLORS.grayMiddle}
					onEndEditing={(event)=>this.setStage(event.nativeEvent.text, 0)}>
						{this.noteInfo.stageWidth}</TextInput>
					<Text style={styles.selectText}>x</Text>
					<TextInput maxLength={5} style={[styles.selectTextInput, {width: 60}]} placeholder={'세로'} placeholderTextColor={COLORS.grayMiddle}
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

				<View style={{flexDirection: 'row', justifyContent: 'center', height: 50}}>
					{/* 댄서 크기 수정 */}
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

					{/* 좌표 간격 수정 */}
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
				<View style={{width: width, height: height/3, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white}}>
					<View style={[this.getStageSizeOnScreen(), {alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.grayLight}]}>
						{ this.coordinate }
						{ this.dancers }
					</View>
				</View>

				{/* 댄서 이름, 색 편집 */}
				<View style={[styles.dancerItem, {backgroundColor: COLORS.grayLight, height: 30}]}>
					<Text style={{width: 30, color: COLORS.grayDark}}>번호</Text>
					<Text style={{flex: 1, color: COLORS.grayDark}}>이름</Text>
					<Text style={{width: 34, color: COLORS.grayDark}}>색상</Text>
				</View>

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
						placeholderTextColor={COLORS.grayMiddle}
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
				
				{this.listViewItemSeparator()}


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
		height: 50,
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
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
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