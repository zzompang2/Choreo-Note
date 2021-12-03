import React, { useEffect, useState } from 'react';
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

import getStyleSheet, { COLORS, getDancerColors } from '../values/styles';
import Left from '../assets/icons/Large(32)/Arrow/Left';
import Add from '../assets/icons/Medium(24)/Add';
import Minus from '../assets/icons/Medium(24)/Minus';
import Down from '../assets/icons/Medium(24)/Down';
import Up from '../assets/icons/Medium(24)/Up';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });
const TAG = 'EditNoteScreen/';
const styles = getStyleSheet();
const dancerColors = getDancerColors();

const stageRatioData = [
	{width: 1, height: 1},
	{width: 4, height: 3},
	{width: 3, height: 2},
	{width: 2, height: 1},
]
export default function EditNoteScreen(props) {
	const nid = props.route.params.nid;
	const [ title, setTitle ] = useState('새로운 노트');
	const [ dancers, setDancers ] = useState([{name: '', color: 0}, {name: '', color: 0}]);
	const [ musicList, setMusicList ] = useState([]);
	const [ selectedMusic, setSelectedMusic ] = useState('');
	const [ isValidTitle, setValidTitle ] = useState(true);
	const [ stageRatioIdx, setStageRatioIdx ] = useState(0);
	const [ isMusicPopup, setMusicPopup ] = useState(false);

	musicLoad = () => {
		console.log(RNFS.DocumentDirectoryPath);
		RNFS.readDir(RNFS.DocumentDirectoryPath).then(files => {
			const musicList = [];
			files.forEach(file => {
				musicList.push(file.name);
				console.log(TAG, 'loaded music name:', file.name);
			});
			setMusicList(musicList);
		});
	}

	selectMusic = (name) => {
		setSelectedMusic(name);
		setMusicPopup(false);
	}

	getStageRatio = (idx) => {
		const data = stageRatioData[idx];
		return data.width / data.height;
	}

	goToFormationScreen = () => {
		const { getTodayDate, getDatabaseData } = props.route.params;
		// 노래 길이 계산
		this.sound = new Sound(selectedMusic, Sound.DOCUMENT, (error) => {
			// 노래 가져오기 실패
			if (selectedMusic != '' && error) {
				Alert.alert('노래', '노래를 가져오지 못했습니다.');
				return;
			}
			// 노래 가져오기 성공
			else {
				const musicLength = selectedMusic == '' ? 60 : Math.ceil(this.sound.getDuration());
				const createDate = getTodayDate();
				const stageRatio = getStageRatio(stageRatioIdx);
				
				console.log('MUSIC LOAD SUCCESS:', musicLength);

				db.transaction(async txn => {
					await txn.executeSql(
						"UPDATE metadata SET nidMax=? WHERE id=0",
						[nid]
					);
					txn.executeSql(
						"INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
						[nid, title, createDate, createDate, stageRatio, selectedMusic, musicLength, 0],
						txn => {
							for(let did=0; did<dancers.length; did++) {
								// 무대 가로를 1000 으로 기준
								const posx = dancers.length == 1 ? 0 : did * (600 / (dancers.length-1)) - 300;
								txn.executeSql(
									"INSERT INTO dancers VALUES (?, ?, ?, ?)",
									[nid, did, dancers[did].name, dancers[did].color]);
	
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

					props.navigation.navigate('Formation', { 
						nid: nid,
						getTodayDate: getTodayDate,
						getDatabaseData: getDatabaseData,
					});
				},
				e => console.log("DB ERROR", e),
				(e) => console.log("DB SUCCESS", e));
			}
		});
	}

	changeTitle = (event) => {
		const title = event.nativeEvent.text.trim();
		
		console.log(TAG, "changeTitle", title);

		if(title == '') 
		setValidTitle(false);

		else {
			setTitle(title);
			setValidTitle(true);
		}
	}

	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	useEffect(() => {
		musicLoad();
	}, [])

	return(
		<View style={styles.bg}>
		<SafeAreaView style={styles.bg}>
		<TouchableOpacity 
		style={{flex: 1}} 
		onPress={() => {
			Keyboard.dismiss();
			if(isMusicPopup) setMusicPopup(false);
		}}
		activeOpacity={1}>

			{/* Tool Bar */}
			<View style={styles.navigationBar}>
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					<TouchableOpacity
					activeOpacity={.8}
					onPress={() => props.navigation.goBack()}
					style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}
					>
						<Left />
					</TouchableOpacity>
					<Text style={styles.navigationBar__title}>노트 세부 설정</Text>
				</View>
				<TouchableOpacity
				style={{height: '100%', justifyContent: 'center'}}
				activeOpacity={.8}
				disabled={!isValidTitle}
				onPress={() => {
					Keyboard.dismiss();
					goToFormationScreen();
					}}>
					<Text style={{ ...styles.navigationBarText, color: isValidTitle ? COLORS.key : COLORS.container_30 }}>확인</Text>
				</TouchableOpacity>
			</View>

			{listViewItemSeparator()}

			<View style={{flex: 1, marginHorizontal: 50}}>

				{/* Note 제목 */}
				<Text style={styles.editNote__title}>제목</Text>
				<View style={{...styles.editNote__box, borderWidth: isValidTitle ? 0 : 2 }}>
				<TextInput
				style={styles.editNote__input}
				maxLength={30}
				placeholder="제목을 적어주세요."
				placeholderTextColor={COLORS.container_40}
				onChange={event => changeTitle(event)}
				autoCorrect={false}>
					{title}
				</TextInput>
				</View>

				{/* Select Music */}
				<Text style={styles.editNote__title}>노래</Text>

				<View style={{zIndex: 100, alignItems: 'center'}}>
					<TouchableOpacity
					activeOpacity={.8}
					style={{...styles.editNote__box, paddingRight: 8}}
					onPress={() => setMusicPopup(!isMusicPopup)}
					>
						<Text style={styles.editNote__input}>
							{selectedMusic == '' ? '1분 정적' : selectedMusic}
						</Text>
						{ isMusicPopup ? <Up /> : <Down /> }
					</TouchableOpacity>

					{ isMusicPopup ?
					<FlatList
					style={styles.editNote__musicList}
					data={['', ...musicList]}
					keyExtractor={(item, idx) => idx.toString()}
					ItemSeparatorComponent={listViewItemSeparator}
					showsVerticalScrollIndicator={false}
					renderItem={({ item, index }) =>
						<TouchableOpacity
						activeOpacity={.8}
						key={index}
						style={styles.editNote__musicEntry}
						onPress={() => selectMusic(item)}>
							<Text
							numberOfLines={2}
							style={{...styles.editNote__input, color: selectedMusic == item ? COLORS.key : COLORS.container_30}}>
								{index == 0 ? '1분 정적(초기값)' : item}
							</Text>
						</TouchableOpacity>
					} />
					: null }
				</View>

				{/* Stage 비율 */}
				<Text style={styles.editNote__title}>무대 비율</Text>

				<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
				{stageRatioData.map((data, idx) =>
				<TouchableOpacity
				key={idx}
				activeOpacity={.8}
				onPress={() => setStageRatioIdx(idx)}
				style={{
					width: 45/data.height*data.width, height: 45,
					borderRadius: 4, backgroundColor: idx == stageRatioIdx ? COLORS.key : COLORS.container_20,
					alignItems: 'center', justifyContent: 'center'
				}}>
					<Text style={{color: idx == stageRatioIdx ? COLORS.container_black : COLORS.container_40, fontSize: 12}}>{data.width}:{data.height}</Text>
				</TouchableOpacity>
				)}
				</View>

				<View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: 4}}>
					<Text style={styles.editNote__title}>댄서</Text>
					<TouchableOpacity
					activeOpacity={.8}
					style={{width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}}
					onPress={() => {
						const newDancers = [...dancers, {name: '', color: 0}];
						setDancers(newDancers);
					}}>
						<Add />
					</TouchableOpacity>
				</View>

				<FlatList
				style={{...styles.dancerList, flexGrow: 0}}
				data={dancers}
				keyExtractor={(item, idx) => idx.toString()}
				ItemSeparatorComponent={listViewItemSeparator}
				showsVerticalScrollIndicator={false}
				// bounces={false}
				renderItem={({ item, index }) =>
				<View key={index} style={styles.dancerEntry}>
					<TouchableOpacity
					activeOpacity={1}
					style={{...styles.dancerEntry__color, backgroundColor: dancerColors[item.color]}}
					onPress={() => {
						const dancer = {...dancers[index]};
						dancer.color = dancer.color+1 >= dancerColors.length ? 0 : dancer.color+1;
						const newDancers = [...dancers.slice(0, index), dancer, ...dancers.slice(index+1)];

						setDancers(newDancers);
					}}>
						<Text style={styles.dancerEntry__text}>
							{index+1}
						</Text>
					</TouchableOpacity>
					<TextInput
					style={styles.dancerEntry__input}
					maxLength={30}
					placeholder={`이름없는 댄서`}
					placeholderTextColor={COLORS.container_40}
					onChange={event => {
						const newDancers = [...dancers.slice(0, index), {...dancers[index], name: event.nativeEvent.text.trim()}, ...dancers.slice(index+1)];
						setDancers(newDancers);
					}}
					autoCorrect={false}>
						{item.name}
					</TextInput>
					<TouchableOpacity
					activeOpacity={.8}
					style={{width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}}
					onPress={() => {
						if(dancers.length > 1){
							const newDancers = [...dancers.slice(0, index), ...dancers.slice(index+1)];
							setDancers(newDancers);
						}
					}}>
						<Minus />
					</TouchableOpacity>
				</View>
				} />
			</View>
		</TouchableOpacity>
		</SafeAreaView>
		</View>
	)
}