import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import getStyleSheet from '../values/styles';

const db = SQLite.openDatabase({ name: 'ChoreoNote.db' });

export default class DatabaseScreen extends React.Component {
	state = {
		notes: [],
		dancers: [],
		times: [],
		positions: []
	}

	componentDidMount() {
		const { notes, dancers, times, positions } = this.state;

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * FROM notes",
        [],
        (txn, result) => {
					for (let i = 0; i < result.rows.length; i++)
						notes.push({...result.rows.item(i), key: i});
					txn.executeSql(
						"SELECT * FROM dancers",
						[],
						(txn, result) => {
							for (let i = 0; i < result.rows.length; i++)
								dancers.push({...result.rows.item(i), key: i});
							txn.executeSql(
								"SELECT * FROM times",
								[],
								(txn, result) => {
									for (let i = 0; i < result.rows.length; i++)
										times.push({...result.rows.item(i), key: i});
									txn.executeSql(
										"SELECT * FROM positions",
										[],
										(txn, result) => {
											for (let i = 0; i < result.rows.length; i++)
												positions.push({...result.rows.item(i), key: i});
											this.setState({ notes, dancers, times, positions });
										}
									);
								}
							);
						}
					);
				}
			);
		});
	}
	
	render() {
		console.log('render');
		const { notes, dancers, times, positions } = this.state;
		const styles = getStyleSheet('database');

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

				{/* notes 리스트 */}
				<Text style={styles.dbTable}>NOTES</Text>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbTable, width: 30}}>nid</Text>
					<Text style={{...styles.dbTable, flex: 1}}>title</Text>
					<Text style={{...styles.dbTable, width: 80}}>createDate</Text>
					<Text style={{...styles.dbTable, width: 80}}>editDate</Text>
					<Text style={{...styles.dbTable, width: 40}}>stageRatio</Text>
				</View>

				<FlatList
				style={styles.noteList}
				data={notes}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item, index }) =>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbText, width: 30}}>{item.nid}</Text>
					<Text style={{...styles.dbText, flex: 1}}>{item.title}</Text>
					<Text style={{...styles.dbText, width: 80}}>{item.createDate}</Text>
					<Text style={{...styles.dbText, width: 80}}>{item.editDate}</Text>
					<Text style={{...styles.dbText, width: 40}}>{item.stageRatio}</Text>
				</View>
				} />

				{/* dancers 리스트 */}
				<Text style={styles.dbTable}>DANCERS</Text>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbTable, width: 30}}>nid</Text>
					<Text style={{...styles.dbTable, width: 80}}>did</Text>
					<Text style={{...styles.dbTable, flex: 1}}>name</Text>
					<Text style={{...styles.dbTable, width: 80}}>color</Text>
				</View>

				<FlatList
				style={styles.noteList}
				data={dancers}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item, index }) =>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbText, width: 30}}>{item.nid}</Text>
					<Text style={{...styles.dbText, width: 80}}>{item.did}</Text>
					<Text style={{...styles.dbText, flex: 1}}>{item.name}</Text>
					<Text style={{...styles.dbText, width: 80}}>{item.color}</Text>
				</View>
				} />

				{/* times 리스트 */}
				<Text style={styles.dbTable}>TIMES</Text>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbTable, width: 30}}>nid</Text>
					<Text style={{...styles.dbTable, width: 60}}>time</Text>
					<Text style={{...styles.dbTable, width: 60}}>duration</Text>
				</View>

				<FlatList
				style={styles.noteList}
				data={times}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item, index }) =>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbText, width: 30}}>{item.nid}</Text>
					<Text style={{...styles.dbText, width: 60}}>{item.time}</Text>
					<Text style={{...styles.dbText, width: 60}}>{item.duration}</Text>
				</View>
				} />

				{/* positions 리스트 */}
				<Text style={styles.dbTable}>POSITIONS</Text>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbTable, width: 30}}>nid</Text>
					<Text style={{...styles.dbTable, width: 60}}>time</Text>
					<Text style={{...styles.dbTable, width: 30}}>did</Text>
					<Text style={{...styles.dbTable, width: 60}}>x</Text>
					<Text style={{...styles.dbTable, width: 60}}>y</Text>
				</View>

				<FlatList
				style={styles.noteList}
				data={positions}
				keyExtractor={(item, idx) => idx.toString()}
				renderItem={({ item, index }) =>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbText, width: 30}}>{item.nid}</Text>
					<Text style={{...styles.dbText, width: 60}}>{item.time}</Text>
					<Text style={{...styles.dbText, width: 30}}>{item.did}</Text>
					<Text style={{...styles.dbText, width: 60}}>{item.x}</Text>
					<Text style={{...styles.dbText, width: 60}}>{item.y}</Text>
				</View>
				} />
			</SafeAreaView>
			</View>
		)
	}
}