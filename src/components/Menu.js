import React from 'react';
import {
	SafeAreaView, StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity, Alert, Switch, FlatList,
} from 'react-native';
import SQLite from "react-native-sqlite-storage";
import IconIonicons from 'react-native-vector-icons/Ionicons';

// custom library
import { COLORS } from '../values/Colors'
import { FONTS } from '../values/Fonts'

const TAG = "Menu/";

export default class Menu extends React.Component {

	listViewItemSeparator = <View style={{ height: 0.5, backgroundColor: COLORS.grayMiddle }}/>

	render(){
		this.alignWithCoordinate = this.props.alignWithCoordinate;

		return(
			<View style={styles.menuProvider}>
				<TouchableOpacity 
				style={{width: '100%', height: '100%', position: 'absolute', backgroundColor: '#00000010'}}
				onPress={this.props.closeMenu}/>

				<View style={styles.menu}>

					<TouchableOpacity 
					style={styles.menuItem}
					onPress={this.props.openDBScreen}>
						<Text style={styles.menuText}>DB</Text>
					</TouchableOpacity>

					{this.listViewItemSeparator}
					
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	menuProvider: {
		width: '100%',
		height: '100%',
		position: 'absolute', 
		alignItems: 'flex-end',
		top: 50, 
		right: 0,
	},
	menu: {
		flexDirection: 'column', 
		backgroundColor:COLORS.grayLight, 
		borderWidth: 1,
		borderColor: COLORS.grayMiddle,
		paddingHorizontal: 15,
	},
	menuItem: {
		flex: 1,
		maxHeight: 50,
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuText: {
		width: 60,
		color: COLORS.blackDark,
	},
	menuValueText: {
		width: 20, 
		fontSize: 16,
		color: COLORS.blue,
		textAlign: 'center',
	},
	menuButton: {
		paddingHorizontal: 5
	}
})