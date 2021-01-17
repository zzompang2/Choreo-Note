import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList, TextInput, Animated
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import getStyleSheet, { COLORS, getDancerColors } from '../values/styles';
import IconIonicons from 'react-native-vector-icons/Ionicons';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });
const TAG = "DancerScreen/";

export default class DancerScreen extends React.Component {
		constructor(props) {
		super(props);

		this.state = {
			nid: undefined,
			dancers: [],
			times: [],
			isAddBtnAppear: false
		}

		this.btnWidth = new Animated.Value(70);
		this.btnScale = new Animated.Value(0);
		this.deleteBtnAnim = [];
	}

	changeName = (text, did) => {
		const { nid, dancers } = this.state;

		const dancer = {...dancers[did]};
		dancer.name = text;
		const newDancers = [...dancers.slice(0, did), dancer, ...dancers.slice(did+1)];

		this.setState({ dancers: newDancers });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE dancers SET name=? WHERE nid=? AND did=?",
				[text, nid, did]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.props.route.params.updateEditDate();
	}

	changeColor = (did) => {
		const dancerColors = getDancerColors();
		const { nid, dancers } = this.state;

		const dancer = {...dancers[did]};
		dancer.color = dancer.color+1 >= dancerColors.length ? 0 : dancer.color+1;
		const newDancers = [...dancers.slice(0, did), dancer, ...dancers.slice(did+1)];

		this.setState({ dancers: newDancers });

		db.transaction(txn => {
			txn.executeSql(
				"UPDATE dancers SET color=? WHERE nid=? AND did=?",
				[dancer.color, nid, did]);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.props.route.params.updateEditDate();
	}

	controlAddButton = () => {
		const { isAddBtnAppear } = this.state;

		if(!isAddBtnAppear) {
			Animated.spring(
				this.btnWidth, {
					toValue: 330,
					friction: 5,
					tension: 100,
					useNativeDriver: false
			}).start();
			Animated.timing(
				this.btnScale, {
					toValue: 1,
					duration: 700,
					delay: 200,
					useNativeDriver: true
				}
			).start();
		}

		else {
			Animated.timing(
				this.btnScale, {
					toValue: 0,
					duration: 1,
					useNativeDriver: true
				}
			).start();
			Animated.spring(
				this.btnWidth, {
					toValue: 70,
					friction: 10,
					tension: 70,
					useNativeDriver: false
			}).start();
		}

		this.setState({ isAddBtnAppear: !isAddBtnAppear });
	}

	addDancer = (colorIdx) => {
		const { nid, dancers, times } = this.state;
		const did = dancers.length;
		const name = "HAM";
		const newDancer = { nid, did, name, color: colorIdx };
		const newDancers = dancers.concat(newDancer);
		this.deleteBtnAnim.push([ new Animated.Value(10), new Animated.Value(0) ]);
		this.setState({ dancers: newDancers });

		db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO dancers VALUES (?, ?, ?, ?)",
				[nid, did, name, colorIdx]);

			for(let i=0; i < times.length; i++) {
				const time = times[i];
				txn.executeSql(
					"INSERT INTO positions VALUES (?, ?, ?, 0, 0)",
					[nid, time.time, did]);
			}
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
		this.props.route.params.updateEditDate();
	}

	deleteDancer = (did) => {
		// 처음으로 클릭 된 경우
		if(this.deleteEnable != did) {
			this.deleteButtonDisable();

			this.deleteEnable = did;
			Animated.timing(
				this.deleteBtnAnim[this.deleteEnable][0], {
					toValue: 40,
					duration: 600,
					useNativeDriver: false
				}
			).start();
			Animated.timing(
				this.deleteBtnAnim[this.deleteEnable][1], {
					toValue: 1,
					duration: 600,
					useNativeDriver: false
				}
			).start();
		}
		// 두 번째로 클릭 된 경우: delete
		else {
			const { nid, dancers } = this.state;
			const afterDeletedEntry = [...dancers.slice(did+1)];
			afterDeletedEntry.map(dancer => dancer.did = dancer.did - 1);
			const newDancers = [...dancers.slice(0, did), ...afterDeletedEntry];

			this.deleteButtonDisable();
			this.deleteBtnAnim.pop();

			this.setState({ dancers: newDancers });

			db.transaction(txn => {
				txn.executeSql(
					"DELETE FROM dancers WHERE nid=? AND did=?",
					[nid, did]);
	
				txn.executeSql(
					"DELETE FROM positions WHERE nid=? AND did=?",
					[nid, did]);

				for(;did < dancers.length; did++) {
					txn.executeSql(
						"UPDATE dancers SET did=? WHERE nid=? AND did=?",
						[did-1, nid, did]);
					txn.executeSql(
						"UPDATE positions SET did=? WHERE nid=? AND did=?",
						[did-1, nid, did]);
					}
			});
			this.props.route.params.updateEditDate();
		}
	}

	deleteButtonDisable = () => {
		if(this.deleteEnable != undefined) {
			Animated.timing(
				this.deleteBtnAnim[this.deleteEnable][0], {
					toValue: 10,
					duration: 600,
					useNativeDriver: false
				}
			).start();
			Animated.timing(
				this.deleteBtnAnim[this.deleteEnable][1], {
					toValue: 0,
					duration: 600,
					useNativeDriver: false
				}
			).start();
			this.deleteEnable = undefined;
		}
	}

	// <FlatList> 구분선
	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	componentDidMount() {
		const nid = this.props.route.params.nid;

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM dancers WHERE nid = ? ORDER BY did",
				[nid],
				(txn, result) => {
					const dancers = [];
					for (let i = 0; i < result.rows.length; i++)
					dancers.push({...result.rows.item(i), key: i});

					for(let i=0; i<dancers.length; i++)
					this.deleteBtnAnim.push([ new Animated.Value(10), new Animated.Value(0) ]);

					txn.executeSql(
						"SELECT * FROM times WHERE nid = ? ORDER BY time",
						[nid],
						(txn, result) => {
							const times = [];
							for (let i = 0; i < result.rows.length; i++)
							times.push({...result.rows.item(i), key: i});
							
							this.setState({ nid, dancers, times });
					});
				}
			);				
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	componentWillUnmount(){
		this.props.route.params.updateStateFromDB();
	}
	
	render() {
		console.log(TAG, 'render');
		const { nid, dancers } = this.state;
		const {
			changeName,
			changeColor,
			controlAddButton,
			addDancer,
			deleteDancer,
			deleteButtonDisable,
		} = this;
		const styles = getStyleSheet();
		const dancerColors = getDancerColors();

		const addBtnContainerStyle = { width: this.btnWidth };
		const addBtnStyle = { transform: [{ scale: this.btnScale }]};

		deleteButtonDisable();

		return(
			<View style={styles.bg}>
			<SafeAreaView style={styles.bg}>
				{/* Tool Bar */}
				<View style={styles.toolbar}>
					<Text style={styles.toolbarTitle}>Database</Text>
					<TouchableOpacity
					onPress={() => this.props.navigation.goBack()}>
						<Text style={styles.toolbarButton}>뒤로</Text>
					</TouchableOpacity>
				</View>

				{/* Dancer 리스트 */}
				<FlatList
				style={styles.noteList}
				data={dancers}
				keyExtractor={(item, idx) => idx.toString()}
				ItemSeparatorComponent={this.listViewItemSeparator}
				renderItem={({ item, index }) =>
				<View>
				<View style={styles.dancerEntry}>
					<TouchableOpacity
					onPress={() => changeColor(item.did)}
					style={{...styles.dancerEntry__color, backgroundColor: dancerColors[item.color]}}>
						<Text style={styles.dancerEntry__text}>{item.did+1}</Text>
					</TouchableOpacity>
					<TextInput
					maxLength={30}
					style={{...styles.dancerEntry__input}}
					placeholder="이름을 입력해 주세요."
					onEndEditing={e => changeName(e.nativeEvent.text, item.did)}
					autoCorrect={false}>
						{item.name}
					</TextInput>
					<TouchableOpacity
					onPress={() => deleteDancer(item.did)}
					style={styles.dancerEntry__btn}>
						<Animated.View style={[
							styles.dancerEntry__btnIcon, 
							{
								height: this.deleteBtnAnim[item.did][0],
								width: Animated.add(12, Animated.multiply(-1/5, this.deleteBtnAnim[item.did][0])),
								backgroundColor: this.deleteBtnAnim[item.did][1].interpolate({
									inputRange: [0, 1],
									outputRange: [COLORS.blackDark, COLORS.grayDark]
								}),
								transform: [{
									rotate: this.deleteBtnAnim[item.did][1].interpolate({
										inputRange: [0, 1],
										outputRange: ['0deg', '45deg']
									})
								}]
							}
						]} />
						<Animated.View style={[
							styles.dancerEntry__btnIcon, 
							{
								width: this.deleteBtnAnim[item.did][0],
								height: Animated.add(12, Animated.multiply(-1/5, this.deleteBtnAnim[item.did][0])),
								backgroundColor: this.deleteBtnAnim[item.did][1].interpolate({
									inputRange: [0, 1],
									outputRange: [COLORS.blackDark, COLORS.grayDark]
								}),
								transform: [{
									rotate: this.deleteBtnAnim[item.did][1].interpolate({
										inputRange: [0, 1],
										outputRange: ['0deg', '45deg']
									})
								}
							]}
						]} />
					</TouchableOpacity>
				</View>
				{/* 맨 마지막 entry 에만 여백 공간을 둔다. 버튼에 가려지지 않게 하기 위해 */}
				{index == dancers.length-1 ? <View style={{height: 120}} /> : null}
				</View>
				} />
				{/* Add 버튼 */}
				<View>
					<Animated.View style={[styles.dancerAddBtnContainer, addBtnContainerStyle]}>
						{dancerColors.map((color, idx) => 
						<TouchableOpacity 
						key={idx}
						style={[styles.dancerAddBtn, {backgroundColor: color}, addBtnStyle]}
						onPress={() => addDancer(idx)}/>)}
						<TouchableOpacity
						style={styles.dancerControlBtn}
						onPress={controlAddButton} />
					</Animated.View>
				</View>
			</SafeAreaView>
			</View>
		)
	}
}