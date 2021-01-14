import React from 'react';
import {
  SafeAreaView, Text, TouchableOpacity
} from 'react-native';
import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class FormationScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noteInfo: {}
		}

		const nid = props.route.params.nid;
		db.transaction(txn => {
			// DB 에서 note 정보 가져오기
			txn.executeSql(
				"SELECT * FROM notes WHERE nid = ?",
				[nid],
        (txn, result) => {
					const noteInfo = result.rows.item(0);
					console.log(noteInfo);
					this.setState({ noteInfo });
				}
			);
		},
		e => console.log("DB ERROR", e),
		() => console.log("DB SUCCESS"));
	}

	render() {
		const { noteInfo } = this.state;

		return(
			<SafeAreaView>
				<Text>{noteInfo.title}</Text>
				<TouchableOpacity
				onPress={() => {
					this.props.navigation.goBack();
				}}>
					<Text>go back</Text>
				</TouchableOpacity>
			</SafeAreaView>
		)
	}
}