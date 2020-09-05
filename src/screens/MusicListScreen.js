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

// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

const TAG = "MusicListScreen/";

const {width, height} = Dimensions.get('window');

export default class MusicListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state = {}
		this.musicList = [];

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
				this.musicList.push({music: 'Sample', musicLength: Math.ceil(sound.getDuration())})
			}
		});	
	}

	// flatList 구분선
	listViewItemSeparator = () => <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>

	timeFormat = (sec) => Math.floor(sec/60) + ':' + ( Math.floor(sec%60) < 10 ? '0'+Math.floor(sec%60) : Math.floor(sec%60) )

	componentDidMount() {
		// DOCUMENT 있는 파일들 검색
		// readDir(dirpath: string)
		RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
			// console.log('file:', files);

			// 각 파일들에 대해 sound load 시도
			for(let i=0; i<files.length; i++){
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

	render() {
		
		return(
			<SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>

				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.goBack();}} style={styles.toolbarButton}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>노래 선택</Text>

					<TouchableOpacity style={styles.toolbarButton} onPress={()=>{
						this.props.route.params.getMusicInfo({music: '', musicLength: 0});
						this.props.navigation.goBack();
					}}>
						<Text style={{color: COLORS.white}}>제거</Text>
					</TouchableOpacity>
				</View>

				{/* 노래 column 할목 */}
				<View style={{height: 30, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', backgroundColor: COLORS.grayMiddle}}>
					<Text style={{flex: 2}}>파일 이름</Text>
					<Text style={{flex: 1}}>재생 시간</Text>
					<Text style={{flex: 1}}>크기</Text>
					{/* <Text style={{flex: 1}}>수정일</Text> */}
				</View>

				<Text style={{fontSize: 10, color: COLORS.grayDark, backgroundColor: COLORS.grayLight, margin: 5, padding: 10}}>
					Sample Music 정보{'\n'}
					Song : OpticalNoise - Colorless{'\n'}
					Follow Artist : https://opticalnoise.biglink.to/platf...{'\n'}
					Music promoted by DayDreamSound : https://youtu.be/G0qtpekYWHA</Text>

				{/* 노래 목록 */}
				<View style={{flex: 1}}>
					<FlatList
					showsVerticalScrollIndicator={false}
					data={this.musicList}
					ItemSeparatorComponent={this.listViewItemSeparator}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item}) => 
						<TouchableOpacity style={styles.musicItem}
						onPress={()=>{
							this.props.route.params.getMusicInfo(item);
							this.props.navigation.goBack();
						}}>
							<Text style={{flex: 2}}>{item.music}</Text>
							<Text style={{flex: 1}}>{this.timeFormat(item.musicLength)}</Text>
							<Text style={{flex: 1}}>{item.size}MB</Text>
							{/* <Text style={{flex: 1}}>{item.mtime}</Text> */}
						</TouchableOpacity>
					}/>
				</View>
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
	musicItem: {
		height: 50,
		flexDirection: 'row',
		marginLeft: 15,
		marginRight: 15,
		alignItems: 'center',
	},
})