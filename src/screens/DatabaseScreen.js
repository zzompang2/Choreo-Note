import React from 'react';
import {
	SafeAreaView, View, Text, TouchableOpacity, FlatList, ScrollView
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import getStyleSheet from '../values/styles';
// import IconIonicons from 'react-native-vector-icons/Ionicons';

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
					console.log(notes);
					txn.executeSql(
						"SELECT * FROM dancers",
						[],
						(txn, result) => {
							for (let i = 0; i < result.rows.length; i++)
							dancers.push({...result.rows.item(i), key: i});
							console.log(dancers);
							txn.executeSql(
								"SELECT * FROM times",
								[],
								(txn, result) => {
									for (let i = 0; i < result.rows.length; i++)
									times.push({...result.rows.item(i), key: i});
									console.log(times);
									txn.executeSql(
										"SELECT * FROM positions",
										[],
										(txn, result) => {
											for (let i = 0; i < result.rows.length; i++)
											positions.push({...result.rows.item(i), key: i});
											console.log(positions);
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
				<View style={styles.navigationBar}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
							{/* <IconIonicons name="chevron-back" size={20} style={styles.navigationBar__button} /> */}
						</TouchableOpacity>
						<Text style={styles.navigationBar__title}>Database</Text>
					</View>
				</View>

				{/* notes 리스트 */}
				<ScrollView 
				horizontal={true} 
				style={{height: 70, flexGrow: 0}}>
				<View>
					<Text style={styles.dbTable}>NOTES</Text>
					<View style={styles.dbEntry}>
						<Text style={{...styles.dbTable, width: 30}}>nid</Text>
						<Text style={{...styles.dbTable, width: 100}}>title</Text>
						<Text style={{...styles.dbTable, width: 110}}>createDate</Text>
						<Text style={{...styles.dbTable, width: 110}}>editDate</Text>
						<Text style={{...styles.dbTable, width: 60}}>무대비율</Text>
						<Text style={{...styles.dbTable, width: 60}}>번호/이름</Text>
					</View>

					<FlatList
					data={notes}
					keyExtractor={(item, idx) => idx.toString()}
					renderItem={({ item, index }) =>
					<View style={styles.dbEntry}>
						<Text style={{...styles.dbText, width: 30}}>{item.nid}</Text>
						<Text style={{...styles.dbText, width: 100}}>{item.title}</Text>
						<Text style={{...styles.dbText, width: 110}}>{item.createDate}</Text>
						<Text style={{...styles.dbText, width: 110}}>{item.editDate}</Text>
						<Text style={{...styles.dbText, width: 60}}>{item.stageRatio}</Text>
						<Text style={{...styles.dbText, width: 60}}>{item.displayName}</Text>
					</View>
					} />
				</View>
				</ScrollView>

				{/* dancers 리스트 */}
				<ScrollView 
				horizontal={true} 
				style={{height: 110, flexGrow: 0}}>
				<View>
					<Text style={styles.dbTable}>DANCERS</Text>
					<View style={styles.dbEntry}>
						<Text style={{...styles.dbTable, width: 30}}>nid</Text>
						<Text style={{...styles.dbTable, width: 80}}>did</Text>
						<Text style={{...styles.dbTable, width: 100}}>name</Text>
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
						<Text style={{...styles.dbText, width: 100}}>{item.name}</Text>
						<Text style={{...styles.dbText, width: 80}}>{item.color}</Text>
					</View>
					} />
				</View>
				</ScrollView>

				{/* times 리스트 */}
				<View style={{height: 200, flexGrow: 0}}>
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
				</View>

				{/* positions 리스트 */}
				<Text style={styles.dbTable}>POSITIONS</Text>
				<View style={styles.dbEntry}>
					<Text style={{...styles.dbTable, width: 30}}>nid</Text>
					<Text style={{...styles.dbTable, width: 30}}>time</Text>
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
					<Text style={{...styles.dbText, width: 30}}>{item.time}</Text>
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