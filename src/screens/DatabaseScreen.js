import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, Switch, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

// custom library
import { COLORS } from '../values/Colors'
import { FONTS } from '../values/Fonts'

let db = SQLite.openDatabase({ name: 'ChoreoNoteDB.db' });
const TAG = "DatabaseScreen/";

export default class DatabaseScreen extends React.Component {
	constructor(props){
		super(props);

		this.refresh();
	}

	refresh = () => {
		this.dancerList = [];
		this.positionList = [];

		db.transaction(txn => {
      txn.executeSql(
				"SELECT * " +
				"FROM dancer " +
				"WHERE nid=?;",
        [this.props.nid],
        (tx, res) => {
					console.log(TAG, "DB SELECT SUCCESS!");
					for (let i = 0; i < res.rows.length; i++) {
						this.dancerList.push({...res.rows.item(i), key: this.dancerList.length}); // {nid, did, name, color}
					}
					this.forceUpdate();
				},
				(e) => {console.log(TAG, "DB SELECT ERROR:", e)}
			)

			txn.executeSql(
				"SELECT * " +
				"FROM position " +
				"WHERE nid=?;",
        [this.props.nid],
        (tx, res) => {
					console.log(TAG, "DB SELECT SUCCESS!");
					for (let i = 0; i < res.rows.length; i++) {
						this.positionList.push({...res.rows.item(i), key: this.positionList.length}); // {nid, did, time, posx, posy, duration}
					}
					this.forceUpdate();
				},
				(e) => {console.log(TAG, "DB SELECT ERROR:", e)}
			)
		});
	}

	render() {
		console.log(TAG, "render");
		let positionList = [];

		this.props.allPosList.forEach(posList => {
			posList.forEach(pos => {
				positionList.push({...pos, key: positionList.length});
			});
		});
		
		return(
			<View style={{flexDirection: 'column', height: '40%', backgroundColor: COLORS.blackLight}}>
				<View style={styles.toolbar}>
					<TouchableOpacity onPress={this.props.closeDBScreen}>
						<IconIonicons name="close-outline" size={20} color="#ffffff"/>
					</TouchableOpacity>
					<Text style={styles.toolbarTitle}>Database</Text>	
					<TouchableOpacity onPress={this.refresh}>
						<IconIonicons name="reload" size={20} color="#ffffff"/>
					</TouchableOpacity>
				</View>

				<View style={{flex: 1, flexDirection: 'row'}}>
					<View 
					style={{flexDirection: 'column', width: '40%', padding: 5}}>

						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>nid</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>did</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>name</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>color</Text>
						</View>
						<FlatList
						data={this.dancerList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item, index}) => 
						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.nid}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.did}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.name}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.color}</Text>
						</View>
						}/>

						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>nid</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>did</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>name</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>color</Text>
						</View>
						<FlatList
						data={this.props.dancerList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item, index}) => 
						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{this.props.nid}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.did}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.name}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.color}</Text>
						</View>
						}/>
						
					</View>

					<View style={{flexDirection: 'column', width: '60%', padding: 5}}>

						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>nid</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>did</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>time</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>posx</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>posy</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>duration</Text>
						</View>
						<FlatList
						ItemSeparatorComponent={this.listViewItemSeparator}
						data={this.positionList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item, index}) => 
						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.nid}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.did}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.time}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.posx}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.posy}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.duration}</Text>
						</View>
						}/>

						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>nid</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>did</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>time</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>posx</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>posy</Text>
							<Text numberOfLines={1} style={[styles.columnText, {flex:1}]}>duration</Text>
						</View>
						<FlatList
						ItemSeparatorComponent={this.listViewItemSeparator}
						data={positionList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({item, index}) => 
						<View style={{flexDirection: 'row'}}>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{this.props.nid}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.did}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.time}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.posx}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.posy}</Text>
							<Text numberOfLines={1} style={[styles.rowText, {flex:1}]}>{item.duration}</Text>
						</View>
						}/>

					</View>
				</View>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	toolbar: {
		width:'100%', 
		height:40,
		flexDirection: 'row', 
		backgroundColor:COLORS.grayDark, 
		alignItems: 'center', 
		justifyContent: 'space-between', 
		paddingHorizontal: 20,
	},
	toolbarTitle: {
		color:COLORS.white, 
		fontSize: 15,
	},
	columnText: {
		fontSize: 12,
		color: COLORS.yellow, 
		borderWidth: 1, 
		borderColor: COLORS.grayDark,
		padding: 1,
		textAlign: 'center',
	},
	rowText: {
		fontSize: 12,
		color: COLORS.white, 
		borderWidth: 1, 
		borderColor: COLORS.grayDark,
		paddingHorizontal: 3,
		textAlign: 'right',
	}
});