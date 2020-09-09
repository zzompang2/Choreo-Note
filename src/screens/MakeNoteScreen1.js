import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, TextInput, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
// Enable playback in silence mode
Sound.setCategory('Playback');

// custom library
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';
import MusicPlayer from '../components/MusicPlayer';

// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "MakeNoteScreen1/";
const BOX_WIDTH_MIN = 20;
const BOX_HEIGHT_MIN = 30;

export default class MakeNoteScreen1 extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			nid: this.props.route.params.nid,
			beat: 1,
		};
		this.isPlay = false;
		this.ratio = 1;					// 무대 세로/가로
		this.dancerList = [];		// {nid, did, name, color}
		this.allPosList = [];		// {nid, did, beat, posx, posy, duration}
		this.beatBoxs = [];
		this.dancers = [];			// dancer View
		this.musicList = [];		// 노래 목록
		this.noteInfo  = {
			nid: this.state.nid, 
			title: '', 
			date: this.props.route.params.date, 
			music: '',		// sample music 
			musicLength: 0,
			bpm: 120,
			sync: 0,
			beatUnit: 4,
			radiusLevel: 3, 
			coordinateLevel: 3, 
			alignWithCoordinate: 1,
			stageWidth: 1200,
			stageHeight: 600,
		};

		this.boxWidth = 30;				// BOX 가로 길이
		this.boxHeight = 30;			// BOX 세로 길이
	}

	// flatList 구분선
	listViewItemSeparator = () => <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>
	
	secToTimeFormat = (sec) => 
		Math.floor(sec/60) + ':' +  
		(Math.floor(sec%60) < 10 ? '0' : '') +
		Math.floor(sec%60)

	completeMakingNote = () => {
		// 이름이 공백인 경우
		if(this.noteInfo.title.replace(/ /gi, '') == ''){
			console.log('제목을 적어주세요.');
			Alert.alert('제목이 비어있음', '제목을 입력해 주세요.');
			return;
		}

		// 노래가 없는 경우
		if(this.noteInfo.music == ''){
			Alert.alert('노래가 비어있음', '노래를 선택해 주세요.');
			return;
		}

		if(this.isPlay){
			Alert.alert('노래 재생중', '노래를 꺼주세요.');
			return;
		}
		this.props.navigation.navigate('MakeNote2', {noteInfo: this.noteInfo, updateNoteList: this.props.route.params.updateNoteList});
	}

	/**
	 * 
	 * @param {{}} musicInfo {music: [music title], path: [music file path]}
	 */
	getMusicInfo = (musicInfo) => {
		console.log(TAG, 'getMusicInfo');
		this.noteInfo.music = musicInfo.music;
		this.noteInfo.musicLength = musicInfo.musicLength;
		this.forceUpdate();
	}

	componentDidMount() {
		// Sample.mp3 길이 찾아 music list에 넣기
		const sound = new Sound('Sample.mp3', Sound.MAIN_BUNDLE, (error)  => {
			// load 실패한 경우
			if (error){
				console.log('sample music load 실패');
				return;
			}
			// load 성공한 경우: 리스트에 추가
			else{
				console.log('sample music load 성공');
				sound.release();
				this.musicList.push({music: 'Sample.mp3', musicLength: Math.ceil(sound.getDuration()), bpm: 120})
				this.forceUpdate();
			}
		});

		// DOCUMENT 있는 파일들 검색
		// readDir(dirpath: string)
		RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
			// console.log('file:', files);
			// 각 파일들에 대해 sound load 시도
			for(let i=0; i<files.length; i++){
				if(files[i].name == 'Sample.mp3'){
					console.log('Sample.mp3라는 이름의 파일은 피해주세요.');
					continue;
				}
				const sound = new Sound(files[i].name, Sound.DOCUMENT, (error)  => {
					// load 실패한 경우
					if (error)
						console.log(files[i].name, 'load 실패');
					// load 성공한 경우: 리스트에 추가
					else{
						console.log(files[i].name, 'load 성공');
						this.musicList.push(
							{music: files[i].name, musicLength: Math.ceil(sound.getDuration()), size: Math.ceil(files[i].size/1024/1024*10)/10, mtime: files[i].mtime.toJSON().split('T')[0]}
						)
						sound.release();
						this.forceUpdate();
					}
				});	
			}
		})
		.catch(err => {
			console.log('ERROR:', err.message, err.code);
		});
	}

	onPlaySubmit = (beat, isPlay = this.isPlay) => {
		console.log(TAG, 'onPlaySubmit(', beat, isPlay, ')');
		this.scrollHorizontal.scrollTo({x: (beat - 1) * 30, animated: false});
		this.setState({beat: beat});
		this.isPlay = isPlay;
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

		/** beat box를 초기화하거나 특정 시간을 표시한다.
	 * - if(no param) => initialize
	 * - re-render: NO
	 * - update: this.musicbox(, this.beatText)
	 */
	setBeatBox = () => {
		console.log(TAG, 'setBeatBox');		
		const BEAT_LENGTH = Math.ceil(this.noteInfo.musicLength/60*this.noteInfo.bpm);

		this.beatBoxs = [];
		for(let beat=1; beat <= BEAT_LENGTH; beat++){
			this.beatBoxs.push(
				<View key={beat} style={{flexDirection: 'column', alignItems: 'center'}}>
					{/* beat unit마다 표시 */}
					{beat%this.noteInfo.beatUnit==1 ? 
					<View style={{width: 2, height: 2, backgroundColor: COLORS.grayMiddle, position: 'absolute', top: 5}}/> 
					: <View/>}
					{/* beat 숫자 */}
					<View style={{width: BOX_WIDTH_MIN, height: BOX_HEIGHT_MIN, justifyContent: 'center'}}>
						<Text style={{fontSize: 11, textAlign: 'center'}}>{beat}</Text>
					</View>
					<View style={{height: 10, width: 1, backgroundColor: COLORS.grayMiddle}}/>
				</View>
			)
		}
	}

	setBeatBoxTouchZone = () => {
		console.log(TAG, 'setBeatBoxTouchZone');
		this.beatBoxTouchZone =
		<TouchableOpacity 
			style={{
				width: this.boxWidth*this.BEAT_LENGTH, 
				height: BOX_HEIGHT_MIN+10, 
				position: 'absolute',
			}}
			onPress={(event) => {
				const beat = Math.floor(event.nativeEvent.locationX / this.boxWidth) + 1;
				this.setState({beat: beat});
			}}/>
	}

	onPressBeat = (event) => {
		const beat = Math.floor(event.nativeEvent.locationX / 30) + 1;
		this.setState({beat: beat});
	}

	beatMarker = (markedBeat) =>
	<View
	style={[styles.beatBox, {
		position: 'absolute',
		left: 30/2 + 30* (markedBeat - 1),
		borderColor: COLORS.grayMiddle, 
		borderRadius: 99, 
		borderWidth: 1}]}>
	</View>

	render() {
		console.log(TAG, 'render');
		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>

				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}} style={styles.toolbarButton}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>새로운 노트 만들기</Text>

					<TouchableOpacity style={styles.toolbarButton} onPress={this.completeMakingNote}>
						<Text style={styles.buttonText}>다음</Text>
					</TouchableOpacity>
				</View>

				{/* 노트 제목 */}
				<View style={styles.textInputContainer}>
					<Text style={{fontSize: 14, color: COLORS.grayMiddle, marginTop: 10}}>노트 제목</Text>
					<TextInput 
					numberOfLines={1}
					maxLength={30}
					style={styles.textInput}
					placeholder="노트 제목을 입력해 주세요."
					placeholderTextColor={COLORS.grayMiddle}
					onChangeText={text=>{this.noteInfo.title = text.trim();}}>
						{this.noteInfo.title}
					</TextInput>

					<View style={{flexDirection: 'row'}}>
						{/* 선택한 노래 */}
						<View flex={2}>
							<Text style={{fontSize: 14, color: COLORS.grayMiddle, marginTop: 10}}>선택한 노래</Text>
							<View style={styles.rowContainer}>
								<IconIonicons name="musical-notes" size={15} color={COLORS.grayMiddle}/>
								<Text style={styles.textInput}> {this.noteInfo.music == '' ? '노래 없음' : this.noteInfo.music}</Text>
							</View>
						</View>

						{/* BPM */}
						<View flex={1}>
							<Text style={{fontSize: 14, color: COLORS.grayMiddle, marginTop: 10}}>BPM</Text>
							<TextInput 
							maxLength={3}
							style={[styles.textInput, {width: 50}]}
							placeholder="120"
							placeholderTextColor={COLORS.grayMiddle}
							onEndEditing={event=>{
								const bpm = this.parseTextToNum(event.nativeEvent.text);
								if(isNaN(bpm))
									Alert.alert('BPM 크기', '숫자를 입력해 주세요.')
								else if(bpm < 20 || bpm > 180)
									Alert.alert('BPM 크기', 'BPM은 20~180 값으로 입력해 주세요.')
								else{
									this.noteInfo.bpm = bpm;
									this.setBeatbox();
									this.forceUpdate();
								}
							}}>
								{this.noteInfo.bpm}
							</TextInput>
							<Text style={{fontSize: 12, color: COLORS.grayMiddle, marginBottom: 10}}>비트 / 1분</Text>
						</View>

						{/* SYNC */}
						<View flex={1}>
							<Text style={{fontSize: 14, color: COLORS.grayMiddle, marginTop: 10}}>싱크(초)</Text>
							<TextInput 
							maxLength={5}
							style={[styles.textInput, {width: 50}]}
							placeholder="0"
							placeholderTextColor={COLORS.grayMiddle}
							onEndEditing={event=>{
								const sync = this.parseTextToNum(event.nativeEvent.text);
								if(isNaN(sync))
									Alert.alert('싱크 크기', '숫자를 입력해 주세요.')
								else if(sync < 0 || sync > 10)
									Alert.alert('싱크 크기', '싱크는 0~10 값으로 입력해 주세요.')
								else{
									this.noteInfo.sync = sync;
									this.forceUpdate();
								}
							}}>
								{this.noteInfo.sync}
							</TextInput>
							<Text style={{fontSize: 12, color: COLORS.grayMiddle, marginBottom: 10}}>비트를 ?초 늦게 시작</Text>
						</View>

						{/* BEAT UNIT */}
						<View flex={1}>
							<Text style={{fontSize: 14, color: COLORS.grayMiddle, marginTop: 10}}>비트 단위</Text>
							<TextInput 
							maxLength={5}
							style={[styles.textInput, {width: 50}]}
							placeholder="4"
							placeholderTextColor={COLORS.grayMiddle}
							onEndEditing={event=>{
								const beatUnit = this.parseTextToNum(event.nativeEvent.text);
								if(isNaN(beatUnit))
									Alert.alert('비트 단위', '숫자를 입력해 주세요.')
								else if(beatUnit < 2 || beatUnit > 16)
									Alert.alert('비트 단위', '싱크는 2~16 값으로 입력해 주세요.')
								else{
									this.noteInfo.beatUnit = beatUnit;
									this.setBeatBox();
									this.forceUpdate();
								}
							}}>
								{this.noteInfo.beatUnit}
							</TextInput>
							<Text style={{fontSize: 12, color: COLORS.grayMiddle, marginBottom: 10}}>비트 위에 점 표시</Text>
						</View>

					</View>
				</View>
				
				{this.listViewItemSeparator()}

				{/* 노래 column 할목 */}
				<View style={{height: 30, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', backgroundColor: COLORS.grayMiddle}}>
					<Text style={{flex: 2}}>파일 이름</Text>
					<Text style={{flex: 1}}>재생 시간</Text>
					<Text style={{flex: 1}}>크기</Text>
					{/* <Text style={{flex: 1}}>수정일</Text> */}
				</View>

				{/* 노래 파일 주의사항 */}
				<Text style={{fontSize: 10, color: COLORS.grayDark, backgroundColor: COLORS.grayLight, margin: 5, padding: 10}}>
					파일 제목은 공백이 없고 영어/숫자로만 이루어져야 합니다.</Text>

				{/* 노래 목록 */}
				<View style={{flex: 1}}>
					<FlatList
					showsVerticalScrollIndicator={false}
					data={this.musicList}
					ItemSeparatorComponent={this.listViewItemSeparator}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item, index}) => 
						<TouchableOpacity
						activeOpacity={.7}
						onPress={()=>{
							this.getMusicInfo(item);
							this.setBeatBox();
							this.forceUpdate();
						}}>
							<View style={styles.musicItem}>
								<Text style={{flex: 2}}>{item.music}</Text>
								<Text style={{flex: 1}}>{this.secToTimeFormat(item.musicLength)}</Text>
								<Text style={{flex: 1}}>{item.size}MB</Text>
							</View>
							{index == 0 ?
							<Text style={{fontSize: 10, color: COLORS.grayMiddle, marginHorizontal: 15, marginBottom: 10}}>
							Sample Music 정보{'\n'}
							Song : OpticalNoise - Colorless{'\n'}
							Follow Artist : https://opticalnoise.biglink.to/platf...{'\n'}
							Music promoted by DayDreamSound : https://youtu.be/G0qtpekYWHA</Text>
							: 
							<View/>}
						</TouchableOpacity>
					}/>
				</View>

				{/* 노래 플레이어 */}
				<MusicPlayer
				noteInfo={{music: this.noteInfo.music, musicLength: this.noteInfo.musicLength, bpm: this.noteInfo.bpm, sync: this.noteInfo.sync}}
				onPlaySubmit={this.onPlaySubmit}
				beat={this.state.beat}/>

				{/* POSITION LIST */}
				<ScrollView
				horizontal={true}
				style={{maxHeight: 40}}
				bounces={false} 						// 오버스크롤 막기 (iOS)
				stickyHeaderIndices={[0]}		// 0번째 View 고정
				showsVerticalScrollIndicator={false}
				ref={ref => (this.scrollHorizontal = ref)}>

					<View flexDirection='row' style={{backgroundColor: COLORS.grayLight}}>
						<View style={{width: this.boxWidth/2}}/>
						
						<View>
							{/* BEAT 숫자 박스들 */}
							<View 
							style={{
								flexDirection: 'row', 
								// width: this.boxWidth*this.BEAT_LENGTH, 
								height: BOX_HEIGHT_MIN+10, 
								paddingHorizontal: (this.boxWidth - BOX_WIDTH_MIN)/2,
								alignItems: 'center', justifyContent: 'space-between'
								}}>
								{this.beatBoxs }
							</View>

							{/* BEAT 터치 박스 */}
							{ this.beatBoxTouchZone }
						</View>

						{/* BEAT Marker */}
						<View
						style={{
							height: this.boxHeight, 
							width: this.boxWidth,
							justifyContent: 'center', 
							alignItems: 'center',
							position: 'absolute',
							left: this.boxWidth/2 + this.boxWidth * (this.state.beat-1),
							borderColor: COLORS.grayMiddle, 
							borderRadius: 99,
							borderWidth: 1,
							}}>
						</View>

						<View style={{width: this.boxWidth/2}}/>
					</View>

				</ScrollView>

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
	textInputContainer: {
		flexDirection: 'column',
		marginLeft: 15,
    marginRight: 15,
	},
	rowContainer: {
		flexDirection:'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	textInput: {
		color: COLORS.blackDark,
		fontSize: 18,
		marginVertical: 10,
		borderBottomWidth: 1,
		borderColor: COLORS.grayMiddle,
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
	musicItem: {
		height: 50,
		flexDirection: 'row',
		marginLeft: 15,
		marginRight: 15,
		alignItems: 'center',
	},
	uncheckedBox:
	{
		height: 30, 
		width: 1, 
		marginHorizontal: (30-1)/2, 
		backgroundColor: COLORS.grayMiddle,
	},
	checkedBox:
	{
		height: 22, 
		width: 22, 
		borderRadius: 11,
	},
	beatBox: 
	{
		height: 30, 
		width: 30,
		justifyContent: 'center', 
		alignItems: 'center'
	}
})