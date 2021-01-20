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
		const { addFormation, deleteFormation, selectedPosTime, 
			formationAddable, setDancerScreen, isPlay,
			alignWithCoordinate, setAlignWithCoordinate, changeCoordinateGap } = this.props;
		const styles = getStyleSheet();
		const isSelected = selectedPosTime != undefined;

		return (
			<View style={styles.toolBar}>
				{/* Formation 추가 */}
				<TouchableOpacity 
				disabled={!formationAddable}
				onPress={addFormation}>
					<IconIonicons name="add-circle" size={40} style={formationAddable ? styles.tool : styles.toolDisabled} />
				</TouchableOpacity>
				{/* Formation 삭제 */}
				<TouchableOpacity
				disabled={!isSelected}
				onPress={deleteFormation}>
					<IconIonicons name="trash-sharp" size={40} style={isSelected ? styles.tool : styles.toolDisabled} />
				</TouchableOpacity>
				{/* Dancer 수정 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setDancerScreen}>
					<IconIonicons name="people-sharp" size={40} style={!isPlay ? styles.tool : styles.toolDisabled} />
				</TouchableOpacity>
				{/* 좌표축에 맞추기 */}
				<Switch
				trackColor={{ false: COLORS.grayLight, true: COLORS.grayLight }}
				ios_backgroundColor={COLORS.blackMiddle}
				onValueChange={setAlignWithCoordinate}
				value={alignWithCoordinate} />
				{/* 좌표 간격 바꾸기 */}
				<TouchableOpacity onPress={() => changeCoordinateGap(false)}>
					<CustomIcon name='coordinate-narrow' size={40} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => changeCoordinateGap(true)}>
					<CustomIcon name='coordinate-wide' size={40} />
				</TouchableOpacity>
			</View>
    )
  }
}