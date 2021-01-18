import React from "react";
import { 
	View, Text, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "ToolBar/";

export default class ToolBar extends React.Component {

  render() {
		const { addFormation, deleteFormation, selectedPosTime, 
			formationAddable, moveToDancerScreen, isPlay } = this.props;
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
				onPress={moveToDancerScreen}>
					<IconIonicons name="people-sharp" size={40} style={!isPlay ? styles.tool : styles.toolDisabled} />
				</TouchableOpacity>
			</View>
    )
  }
}