import React from 'react';
import {
  SafeAreaView, StyleSheet, View, FlatList, Text, TouchableOpacity,
} from 'react-native';

import SQLite from "react-native-sqlite-storage";
var db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });

export default class ListScreen extends React.Component {
	constructor(){
		super();
		this.state = {
      db,
      dancers: [],
		}
		this.TAG = "ListScreen/";

		db.transaction(txn => {
			txn.executeSql(
				'CREATE TABLE IF NOT EXISTS "dancer"("id"	INTEGER NOT NULL, "name"	TEXT, PRIMARY KEY("id" AUTOINCREMENT));',
				[]
			);
			// txn.executeSql(
			// 	'INSERT INTO dancer VALUES (1, "zzom");'
			// )
		})
	}

	render() {
		console.log(this.TAG, "render");

		return(
			<SafeAreaView>
				<Text>goodbye haam</Text>
			</SafeAreaView>
		)
	}

	componentDidMount() {
		console.log(this.TAG, "componentDidMount");
		this.state.db.transaction(function (txn) {
      txn.executeSql(
				"SELECT * FROM dancer",
        [],
        function (tx, result) {
					var temp = [];
          // console.log('length: ', result.rows.length);
					for (let i = 0; i < result.rows.length; ++i) {
						console.log("item:", result.rows.item(i));
						temp.push(result.rows.item(i));
					}
					
			});
		});
	}
}