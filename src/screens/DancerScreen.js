import React from 'react';
import {
  SafeAreaView, FlatList, Text, StyleSheet, TouchableOpacity, View, TextInput, Image, Alert
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

// custom library
import { COLORS } from '../values/Colors';
import { FONTS } from '../values/Fonts';

var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
TAG = "ListScreen";

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

	listViewItemSeparator = () => 
		<View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.grayMiddle }}/>
	
	listItemView = (item) => {
		console.log(TAG, 'listItemView');

		return(
			<View style={{flexDirection: 'row', alignItems: 'center',}}>

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

				<TouchableOpacity
				onPress={()=>this.deleteDancer(item.did)}>
					<IconIonicons name="trash-outline" size={20} color={COLORS.grayMiddle}/>
				</TouchableOpacity>

			</View>
		)
	}

	render(){
		console.log(TAG, 'render');

		return(
			<SafeAreaView style={{flex: 1, width: '80%', alignSelf: 'center'}}>
				<TouchableOpacity onPress={()=>this.addDancer()}>
					<IconIonicons name="person-add" size={20} color={COLORS.grayMiddle}/>
				</TouchableOpacity>
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
		console.log("dancerList:", this.state.dancerList);
		console.log("allPosList:", this.allPosList);
		this.props.route.params.changeDancerList(this.state.dancerList, this.allPosList);
	}
}


const styles = StyleSheet.create({
	button: {
    width: 15,
    height: 15,
    margin: 10,
  },
})