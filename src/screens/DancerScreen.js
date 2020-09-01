import React from 'react';
import {
  SafeAreaView, FlatList, Text, StyleSheet, TouchableOpacity, View, TextInput, Image, Alert,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

// custom library
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
TAG = "ListScreen";
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue];

export default class ListScreen extends React.Component {
	constructor(props){
		super(props);
		this.state={
			db,
			noteId: props.route.params.noteId,
			dancerList: [...props.route.params.dancerList],
		}
		this.allPosList = [...props.route.params.allPosList];
	}

	changeName = (text, did) => {
		console.log(TAG, "changeName: ", text + ", " + did)

		// SQLite DB에서 업데이트
		this.state.db.transaction(txn => {
      txn.executeSql(
				"UPDATE dancer " +
				"SET name=? " +
				"WHERE nid=? " +
				"AND did=?;",
				[text, this.state.noteId, did],
			);
		});

		let _dancerList = [...this.state.dancerList];
		_dancerList[did].name = text;
		this.setState({dancerList: _dancerList, isFocus: false});
	}

	addDancer = () => {
		console.log(TAG, "addDancer");

		const dancerNum = this.state.dancerList.length;

		this.state.db.transaction(txn => {
			txn.executeSql(
				"INSERT INTO dancer VALUES (?, ?, '');",
				[this.state.noteId, dancerNum]
			);
			txn.executeSql(
				"INSERT INTO position VALUES (?, ?, 0, 0, 0, 0);",
				[this.state.noteId, dancerNum]
			);
		});

		let _dancerList = [...this.state.dancerList];
		_dancerList.push({did: dancerNum, name: ""}); // {did, name}
		this.allPosList.push([{time: 0, posx: 0, posy: 0, duration: 0}]);
		this.setState({dancerList: _dancerList});
	}

	deleteDancer = (did) => {
		console.log(TAG, "deleteDancer");

		Alert.alert(
			"경고", 
			"정말 삭제하시겠어요? 되돌릴 수 없습니다!",
			[
				{
					text: "예!",
					onPress: () => {
						console.log(TAG, "deleteDancer: YES")
						this.state.db.transaction(txn => {
							txn.executeSql(
								"DELETE FROM position " +
								"WHERE nid=? " +
								"AND did=? ;",
								[this.state.noteId, did]
							);

							txn.executeSql(
								"DELETE FROM dancer " +
								"WHERE nid=? " +
								"AND did=? ;",
								[this.state.noteId, did]
							);

							txn.executeSql(
								"UPDATE dancer " +
								"SET did=did-1 " +
								"WHERE nid=? " +
								"AND did>?;",
								[this.state.noteId, did]
							);
						});

						let _dancerList = [...this.state.dancerList];
						_dancerList.splice(did, 1);
						for(let i=did; i<_dancerList.length; i++){
							_dancerList[i].did -= 1;
						}

						this.allPosList.splice(did, 1);
						this.setState({dancerList: _dancerList});
					},
				},
				{ text: "아니요, 안 할래요.", style: "cancel" }
			],
			{ cancelable: false }
		);
	}

	// flatList 구분선
	listViewItemSeparator = () => 
		<View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>
	
	changeColor = (did) => {
		let _dancerList = [...this.state.dancerList];
		const newColor = (_dancerList[did].color + 1) % dancerColor.length;
		_dancerList[did].color = newColor;
		this.setState({dancerList: _dancerList})

		this.state.db.transaction(txn => {
			txn.executeSql(
				"UPDATE dancer " +
				"SET color=? " +
				"WHERE nid=? " +
				"AND did=?;",
				[newColor, this.state.noteId, did]
			);
		});
	}

	listItemView = (item) => 
		<View style={styles.dancerItem}>

			<Text 
			style={{width: 20, fontSize: 16, color: COLORS.grayMiddle,}}>
				{item.did+1}
			</Text>

			<TextInput
			maxLength={10}
			style={{flex: 1, fontSize: 16, color: COLORS.blackDark, padding: 10,}}
			placeholder="이름을 입력해 주세요."
			onEndEditing={(e)=>this.changeName(e.nativeEvent.text, item.did)}>
				{item.name}
			</TextInput>

			<TouchableOpacity activeOpacity={1} onPress={()=>this.changeColor(item.did)}>
				<View style={{
					width: 20, 
					height: 20,
					borderRadius: 10,
					backgroundColor: dancerColor[item.color],
					marginHorizontal: 15}}/>
				</TouchableOpacity>

			<TouchableOpacity
			onPress={()=>this.deleteDancer(item.did)}>
				<IconIonicons name="trash-outline" size={20} color={COLORS.grayMiddle}/>
			</TouchableOpacity>

		</View>

	render(){
		console.log(TAG, 'render');

		return(
			<SafeAreaView style={{flex: 1, flexDirection: 'column', backgroundColor: COLORS.white}}>

				<View style={styles.toolbar}>
					<TouchableOpacity onPress={()=>{this.props.navigation.navigate('Formation');}}>
						<IconIonicons name="ios-arrow-back" size={24} color="#ffffff"/>
					</TouchableOpacity>

					<Text style={styles.toolbarTitle}>댄서 편집</Text>
					
					<TouchableOpacity onPress={()=>this.addDancer()}>
						<IconIonicons name="person-add" size={20} color={COLORS.white}/>
					</TouchableOpacity>
				</View>

				<FlatList
				showsVerticalScrollIndicator={false}
				data={this.state.dancerList}
				ItemSeparatorComponent={this.listViewItemSeparator}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({ item }) => this.listItemView(item)}
				/>
			</SafeAreaView>
		)
	}

	componentWillUnmount(){
		console.log(TAG, 'componentWillUnmount');
		this.props.route.params.changeDancerList(this.state.dancerList, this.allPosList);
	}
}


const styles = StyleSheet.create({
	toolbar: {
		width: '100%', 
		height: 50,
		flexDirection: 'row', 
		backgroundColor: COLORS.purple, 
		alignItems: 'center', 
		justifyContent: 'space-between', 
		paddingHorizontal: 20,
	},
	toolbarTitle: {
		color:COLORS.white, 
		fontSize: 15,
	},
	dancerItem: {
		flex: 1,
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 15,
    marginRight: 15,
	}
})