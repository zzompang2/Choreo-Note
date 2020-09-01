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

					<View style={styles.menuItem}>
						<Text style={styles.menuText}>댄서 크기</Text>
						<TouchableOpacity onPress={()=>this.props.resizeDancer('down')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-back" size={24} color={COLORS.grayMiddle}/>
						</TouchableOpacity>
						<Text style={styles.menuValueText}>{this.props.radiusLevel}</Text>
						<TouchableOpacity onPress={()=>this.props.resizeDancer('up')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-forward" size={24} color={COLORS.grayMiddle}/>
						</TouchableOpacity>
					</View>

					{this.listViewItemSeparator}

					<View style={styles.menuItem}>
						<Text style={styles.menuText}>좌표 간격</Text>
						<TouchableOpacity onPress={()=>this.props.resizeCoordinate('down')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-back" size={24} color={COLORS.grayMiddle}/>
						</TouchableOpacity>
						<Text style={styles.menuValueText}>{this.props.coordinateLevel}</Text>
						<TouchableOpacity onPress={()=>this.props.resizeCoordinate('up')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-forward" size={24} color={COLORS.grayMiddle}/>
						</TouchableOpacity>
					</View>

					{this.listViewItemSeparator}

					<View style={styles.menuItem}>
						<Text style={styles.menuText}>표 너비</Text>
						<TouchableOpacity onPress={()=>this.props.resizeMusicList('reduce')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-back" size={24} color={COLORS.grayMiddle} />
						</TouchableOpacity>
						<Text style={styles.menuValueText}>{this.props.boxWidth}</Text>
						<TouchableOpacity onPress={()=>this.props.resizeMusicList('expand')} style={styles.menuButton} activeOpacity={.9}>
							<IconIonicons name="caret-forward" size={24} color={COLORS.grayMiddle}/>
						</TouchableOpacity>
					</View>

					{this.listViewItemSeparator}

					<View style={styles.menuItem}>
						<Text style={styles.menuText}>좌표 맞춤</Text>
						<View style={{flex: 1, alignItems: 'center'}}>
							<Switch
							style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
							trackColor={{true: COLORS.red}}
							thumbColor={COLORS.white}
							ios_backgroundColor={COLORS.grayDark}
							onValueChange={this.props.changeAlignWithCoordinate}
							value={this.alignWithCoordinate}/>
						</View>
					</View>

					{this.listViewItemSeparator}

					<TouchableOpacity 
					style={styles.menuItem}
					onPress={this.props.moveToDancer}>
						<Text style={styles.menuText}>댄서 편집</Text>
					</TouchableOpacity>

					{this.listViewItemSeparator}

					<TouchableOpacity 
					style={styles.menuItem}
					onPress={this.props.openDBScreen}>
						<Text style={styles.menuText}>DB</Text>
					</TouchableOpacity>
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
		paddingHorizontal: 10,
	},
	menuItem: {
		height: 50,
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