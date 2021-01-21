import React from "react";
import { 
	View, TouchableOpacity, Switch, Text
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';
// custom icon 
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/font/config.json';
const CustomIcon = createIconSetFromFontello(fontelloConfig);

const TAG = "ToolBar/";

export default class ToolBar extends React.Component {

  render() {
		const {
			setDancerScreen,
			isPlay,
			alignWithCoordinate,
			setAlignWithCoordinate,
			changeCoordinateGap,
			changeUnitBoxWidth,
			pressPlayButton,
		} = this.props;
		const styles = getStyleSheet();

		return (
			<View style={styles.toolBar}>

				<TouchableOpacity
				style={styles.playerBar__timeBox}
				disabled={false}
				onPress={pressPlayButton}>
					<IconIonicons name={isPlay ? "pause" : "play"} style={styles.playerBar__btn} />
				</TouchableOpacity>
				{/* Dancer 수정 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setDancerScreen}>
					<Text style={!isPlay ? styles.toolBar__tool : styles.toolBar__toolDisabled}>dancers</Text>
				</TouchableOpacity>
				{/* 좌표축에 맞추기 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setAlignWithCoordinate}>
					<Text style={alignWithCoordinate ? styles.toolBar__tool : styles.toolBar__toolDisabled}>align</Text>
				</TouchableOpacity>
				{/* 좌표 간격 바꾸기 */}
				<TouchableOpacity onPress={() => changeCoordinateGap(false)}>
					<CustomIcon name='coordinate-narrow' size={40} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => changeCoordinateGap(true)}>
					<CustomIcon name='coordinate-wide' size={40} />
				</TouchableOpacity>
				{/* timebox 너비 바꾸기 */}
				<TouchableOpacity onPress={() => changeUnitBoxWidth(false)}>
					<CustomIcon name='box-width-down' size={40} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => changeUnitBoxWidth(true)}>
					<CustomIcon name='box-width-up' size={40} />
				</TouchableOpacity>
			</View>
    )
  }
}