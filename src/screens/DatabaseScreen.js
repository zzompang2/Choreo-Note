import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class DatabaseScreen extends React.Component {
	state = {
		data: []
	}

	componentDidMount() {
		const { data } = this.state;

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM note;",
        [],
        (txn, result) => {
					console.log("DB SUCCESS!");
					for (let i = 0; i < result.rows.length; i++)
						data.push({...result.rows.item(i), key: data.length});
					this.setState({ data });
				}
			);
		});
	}
	
	render() {
		const { data } = this.state;

		return(
			<SafeAreaView>
				<Text>Database</Text>
				<TouchableOpacity
				onPress={() => this.props.navigation.goBack()}>
					<Text>go back</Text>
				</TouchableOpacity>
				<FlatList
				data={data}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item }) =>
					<View style={{flexDirection: 'row'}}>
						<Text numberOfLines={1}>{item.nid}</Text>
						<Text numberOfLines={1}>{item.title}</Text>
						<Text numberOfLines={1}>{item.date}</Text>
					</View>
				} />
			</SafeAreaView>
		)
	}
}