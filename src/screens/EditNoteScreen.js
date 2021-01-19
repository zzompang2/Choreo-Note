import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList, TextInput, Alert, Keyboard,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

import getStyleSheet, { COLORS } from '../values/styles';
import IconIonicons from 'react-native-vector-icons/Ionicons';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class EditNoteScreen extends React.Component {
	state = {
		noteInfo: undefined,
		dancerNum: 2,
		musicList: [],
		selectedMusicPath: '',
		playingMusicIdx: -1,
		isValidTitle: true,
		isValidDancerNum: true,
		isValidMusic: false,
	}

	musicLoad = () => {
		RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
			
			const musicList = [];
			files.forEach(file => {
				musicList.push({ name: file.name, path: file.path });
				console.log('name:', file.name);
			});
			this.setState({ musicList });
		});
	}

	musicPlay = (path, idx) => {
		const { playingMusicIdx } = this.state;
		
		if(this.sound)
		this.sound.pause();

		if(playingMusicIdx == idx) {
			this.setState({ playingMusicIdx: -1 });
		}
		else {
			this.setState({ playingMusicIdx: idx });

			this.sound = new Sound(encodeURI(path), '/', (error) => {
				if (error)
				console.log('MUSIC LOAD FAIL', error);
				else {
					console.log('MUSIC LOAD SUCCESS:', Math.ceil(this.sound.getDuration()));
					this.sound.play(() => {
						this.sound.pause();
						this.setState({ playingMusicIdx: -1 });
					});
				}
			});
		}
	}

	selectMusic = (path) => {
		this.setState({ selectedMusicPath: path, isValidMusic: true });
	}

	goToFormationScreen = () => {
		const { nid } = this.state;
		const { getTodayDate } = this.props.route.params;
		this.props.navigation.navigate('Formation', { 
			nid: nid,
			getTodayDate: getTodayDate
		});
	}

	changeTitle = (text) => {
		text = text.trim();

		if(text == '') 
		this.setState({ isValidTitle: false });

		else {
			const noteInfo = {...this.state.noteInfo, title: text};
			this.setState({ noteInfo, isValidTitle: true });
		}
	}

	changeDancerNum = (event) => {
		const dancerNum = Number(event.nativeEvent.text);
		if(isNaN(dancerNum) || dancerNum <= 0 || dancerNum > 30)
		this.setState({ isValidDancerNum: false });

		else
		this.setState({ dancerNum, isValidDancerNum: true });
	}

	componentDidMount() {
		const { nid } = this.props.route.params;

		this.musicLoad();

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM notes WHERE nid = ?",
				[nid],
        (txn, result) => {
					const noteInfo = result.rows.item(0);
					console.log(noteInfo);
					this.setState({ noteInfo });
				}
			);
		});
	}

	// <FlatList> 구분선
	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	render() {
		console.log('render');
		const { noteInfo, dancerNum, musicList, selectedMusicPath, playingMusicIdx,
			isValidTitle, isValidDancerNum, isValidMusic } = this.state;
		const {
			changeTitle,
			changeDancerNum,
			musicPlay,
			selectMusic,
		} = this;
		const styles = getStyleSheet();

		if(noteInfo == undefined)
		return null;

		return(
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
			<TouchableOpacity 
			style={{flex: 1}} 
			onPress={Keyboard.dismiss}
			activeOpacity={1}>

				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<Text style={styles.toolbarTitle}>Edit Note</Text>
					<TouchableOpacity
					onPress={() => this.props.navigation.goBack()}>
						<Text style={styles.toolbarButton}>뒤로</Text>
					</TouchableOpacity>
				</View>

				<View style={{flex: 1, padding: 30}}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<Text style={styles.editNote__title}>노트 이름</Text>
						<View style={[styles.editNote__flag, {backgroundColor: isValidTitle ? COLORS.green : COLORS.red}]} />
						<Text style={{color: COLORS.red}}>{isValidTitle ? '' : '제목은 공백일 수 없습니다'}</Text>
					</View>
					<TextInput
					style={styles.editNote__input}
					maxLength={30}
					placeholder="노트 제목을 입력해 주세요."
					placeholderTextColor={COLORS.grayDark}
					onEndEditing={e => changeTitle(e.nativeEvent.text)}
					autoCorrect={false}>
						{noteInfo.title}
					</TextInput>

					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<Text style={styles.editNote__title}>댄서 명 수 (최대 30명)</Text>
						<View style={[styles.editNote__flag, {backgroundColor: isValidDancerNum ? COLORS.green : COLORS.red}]} />
						<Text style={{color: COLORS.red}}>{isValidDancerNum ? '' : '1~30 숫자이어야 합니다'}</Text>
					</View>
					<TextInput
					style={styles.editNote__input}
					maxLength={4}
					placeholder={'0'}
					placeholderTextColor={COLORS.grayDark}
					keyboardType={'number-pad'}
					onEndEditing={event => changeDancerNum(event)}>{dancerNum}</TextInput>

					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<Text style={styles.editNote__title}>노래</Text>
						<View style={[styles.editNote__flag, {backgroundColor: isValidMusic ? COLORS.green : COLORS.red}]} />
						<Text style={{color: COLORS.red}}>{isValidMusic ? '' : '선택하지 안 하면 1분 무음으로 재생됩니다'}</Text>
					</View>

					<FlatList
					// style={styles.editNote__musicList}
					data={musicList}
					keyExtractor={(item, idx) => idx.toString()}
					ItemSeparatorComponent={this.listViewItemSeparator}
					renderItem={({ item, index }) =>
					<View style={styles.editNote__musicEntry}>
						<TouchableOpacity
						style={{flex: 1, height: '100%', paddingRight: 10, justifyContent: 'center'}}
						onPress={() => selectMusic(item.path)}>
							<Text numberOfLines={2} style={[styles.dancerEntry__text], {color: selectedMusicPath == item.path ? COLORS.green : COLORS.white}}>
								{item.name}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
						onPress={() => musicPlay(item.path, index)}>
							<IconIonicons name={playingMusicIdx == index ? "pause" : "play"} size={20} style={styles.editNote__btn} />
						</TouchableOpacity>
					</View>
					} />
				</View>
			</TouchableOpacity>
			</SafeAreaView>
			</View>
		)
	}
}