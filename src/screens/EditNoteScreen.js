import React from 'react';
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	FlatList,
	TextInput,
	Alert,
	Keyboard,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

import getStyleSheet, { COLORS } from '../values/styles';
import IconIonicons from 'react-native-vector-icons/Ionicons';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });
const TAG = 'EditNoteScreen/';

const stageRatioData = [
	{width: 1, height: 1},
	{width: 4, height: 3},
	{width: 3, height: 2},
	{width: 2, height: 1},
]
export default class EditNoteScreen extends React.Component {
	state = {
		noteInfo: undefined,
		dancerNum: 2,
		musicList: [],
		selectedMusicName: '/',
		playingMusicIdx: -1,
		isValidTitle: true,
		isValidDancerNum: true,
		stageRatioIdx: 0,
	}

	musicLoad = () => {
		RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
			const musicList = [];
			musicList.push('/');
			files.forEach(file => {
				musicList.push(file.name);
				console.log('name:', file.name);
			});
			this.setState({ musicList });
		});
	}

	musicPlay = (name, idx) => {
		const { playingMusicIdx } = this.state;
		
		if(this.sound)
		this.sound.pause();

		if(playingMusicIdx == idx) {
			this.setState({ playingMusicIdx: -1 });
		}
		else {
			this.setState({ playingMusicIdx: idx });

			this.sound = new Sound(encodeURI(name), Sound.DOCUMENT, (error) => {
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

	selectMusic = (name) => {
		this.setState({ selectedMusicName: name });
	}

	getStageRatio = (idx) => {
		const data = stageRatioData[idx];
		return data.width / data.height;
	}

	goToFormationScreen = () => {
		const { noteInfo: { nid, title }, dancerNum, musicList, selectedMusicName, isValidTitle, isValidDancerNum, stageRatioIdx } = this.state;
		const { getTodayDate, updateMainStateFromDB } = this.props.route.params;

		Keyboard.dismiss();

		if(!isValidTitle)
		Alert.alert('Note Title', 'Please enter a title.');
		else if(!isValidDancerNum)
		Alert.alert('Dancer Number', 'You should write at least one dancer and up to 30 dancers.');
		else {
			if(this.sound)
			this.sound.pause();
			// 노래 길이 계산
			this.sound = new Sound(encodeURI(selectedMusicName), Sound.DOCUMENT, (error) => {
				// 노래 가져오기 실패
				if (selectedMusicName != '/' && error) {
					console.log('MUSIC LOAD FAIL', error);
					Alert.alert('Music', 'Failed to load music.');
					return;
				}
				// 노래 가져오기 성공
				else {
					const musicLength = selectedMusicName == '/' ? 60 : Math.ceil(this.sound.getDuration());
					const editDate = getTodayDate();
					const stageRatio = this.getStageRatio(stageRatioIdx);
					
					console.log('MUSIC LOAD SUCCESS:', musicLength);

					db.transaction(async txn => {
						await txn.executeSql(
							"UPDATE notes " +
							"SET title=?, music=?, musicLength=?, editDate=?, stageRatio=? " +
							"WHERE nid=?",
							[title, selectedMusicName, musicLength, editDate, stageRatio, nid],
							txn => {
								for(let did=0; did<dancerNum; did++) {
									const name = `Dancer ${did+1}`;
									const posx = dancerNum == 1 ? 0 : did * (600 / (dancerNum-1)) - 300;
									txn.executeSql(
										"INSERT INTO dancers VALUES (?, ?, ?, 0)",
										[nid, did, name]);
		
									txn.executeSql(
										"INSERT INTO positions VALUES (?, 0, ?, ?, 0)",
										[nid, did, posx]);
						
									txn.executeSql(
										"INSERT INTO positions VALUES (?, 5000, ?, ?, -100)",
										[nid, did, posx]);
								}
					
								txn.executeSql(
									"INSERT INTO times VALUES (?, 0, 3000)",
									[nid]);
		
								txn.executeSql(
									"INSERT INTO times VALUES (?, 5000, 5000)",
									[nid]);
							}
						);

						this.props.navigation.navigate('Formation', { 
							nid: nid,
							getTodayDate: getTodayDate,
							updateMainStateFromDB: updateMainStateFromDB,
						});
					},
					e => console.log("DB ERROR", e),
					(e) => console.log("DB SUCCESS", e));
				}
			});
		}
	}

	changeTitle = (event) => {
		const title = event.nativeEvent.text.trim();

		if(title == '') 
		this.setState({ isValidTitle: false });

		else {
			const noteInfo = {...this.state.noteInfo, title};
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

	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	componentDidMount() {
		const { nid } = this.props.route.params;

		this.musicLoad();

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM notes WHERE nid = ?",
				[nid],
        (txn, result) => {
					const noteInfo = result.rows.item(0);
					console.log(TAG, noteInfo);
					this.setState({ noteInfo });
				}
			);
		});
	}

	render() {
		const { noteInfo, dancerNum, musicList, selectedMusicName, playingMusicIdx,
			isValidTitle, isValidDancerNum, stageRatioIdx } = this.state;
		const {
			changeTitle,
			changeDancerNum,
			musicPlay,
			selectMusic,
			goToFormationScreen,
			listViewItemSeparator,
		} = this;
		const styles = getStyleSheet();

		return(
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
			<TouchableOpacity 
			style={{flex: 1}} 
			onPress={Keyboard.dismiss}
			activeOpacity={1}>

				{/* Tool Bar */}
				<View style={styles.navigationBar}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
							<IconIonicons name="chevron-back" size={20} style={styles.navigationBar__button} />
						</TouchableOpacity>
						<Text style={styles.navigationBar__title}>Edit Note</Text>
					</View>
					<TouchableOpacity
					onPress={() => goToFormationScreen()}>
						<Text style={styles.navigationBarText}>확인</Text>
					</TouchableOpacity>
				</View>

				{listViewItemSeparator()}

				{noteInfo == undefined ? null :
				<View style={{flex: 1, paddingHorizontal: 30}}>

					{/* Note 제목 */}
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 5}}>
						<Text style={styles.editNote__title}>Title</Text>
						<View style={[styles.editNote__flag, {backgroundColor: isValidTitle ? COLORS.green : COLORS.red}]} />
						<Text style={{color: COLORS.red}}>{isValidTitle ? '' : 'No blanks.'}</Text>
					</View>
					<TextInput
					style={styles.editNote__input}
					maxLength={30}
					placeholder="Please enter a title."
					placeholderTextColor={COLORS.grayDark}
					onChange={event => changeTitle(event)}
					autoCorrect={false}>
						{noteInfo.title}
					</TextInput>

					{/* Dancer 인원 수 */}
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 5}}>
						<Text style={styles.editNote__title}>How many dancers (up to 30)</Text>
						<View style={[styles.editNote__flag, {backgroundColor: isValidDancerNum ? COLORS.green : COLORS.red}]} />
						<Text style={{color: COLORS.red}}>{isValidDancerNum ? '' : 'Only number 1~30'}</Text>
					</View>
					<TextInput
					style={styles.editNote__input}
					maxLength={4}
					placeholder={'0'}
					placeholderTextColor={COLORS.grayDark}
					keyboardType={'number-pad'}
					onChange={event => changeDancerNum(event)}>{dancerNum}</TextInput>

					{/* Stage 비율 */}
					<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 5}}>
						<Text style={styles.editNote__title}>Stage Ratio</Text>
					</View>

					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
					{stageRatioData.map((data, idx) =>
					<TouchableOpacity
					activeOpacity={.8}
					onPress={() => this.setState({ stageRatioIdx: idx })}
					style={{
						width: 50/data.height*data.width, height: 50,
						borderWidth: 1, borderColor: idx == stageRatioIdx ? COLORS.green : COLORS.grayMiddle,
						alignItems: 'center', justifyContent: 'center'
					}}>
						<Text style={{color: idx == stageRatioIdx ? COLORS.green : COLORS.grayMiddle, fontSize: 16}}>{data.width}:{data.height}</Text>
					</TouchableOpacity>
					)}
					</View>
					
					{/* Select Music */}
					<View style={{marginTop: 20, marginBottom: 5}}>
						<Text style={styles.editNote__title}>Select Music</Text>
					</View>

					<FlatList
					style={styles.editNote__musicList}
					data={musicList}
					keyExtractor={(item, idx) => idx.toString()}
					ItemSeparatorComponent={listViewItemSeparator}
					showsVerticalScrollIndicator={false}
					renderItem={({ item, index }) =>
					<View style={styles.editNote__musicEntry}>
						<TouchableOpacity
						style={{flex: 1, height: '100%', paddingRight: 10, justifyContent: 'center'}}
						onPress={() => selectMusic(item)}>
							<Text numberOfLines={2} style={[styles.dancerEntry__text], {color: selectedMusicName == item ? COLORS.green : COLORS.grayMiddle}}>
								{item == '/' ? 'no music (60s silence)' : item}
							</Text>
						</TouchableOpacity>
						{index == 0 ? null :
						<TouchableOpacity
						onPress={() => musicPlay(item, index)}>
							<IconIonicons name={playingMusicIdx == index ? "pause" : "play"} size={20} style={styles.editNote__btn} />
						</TouchableOpacity>
						}
					</View>
					} />
				</View>
				}
			</TouchableOpacity>
			</SafeAreaView>
			</View>
		)
	}
}