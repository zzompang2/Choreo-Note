import React from "react";
import { 
	View, Text, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "ToolBar/";

export default class ToolBar extends React.Component {

  render() {
		const { addFormation, deleteFormation, selectedPosTime } = this.props;
		const styles = getStyleSheet();
		const isSelected = selectedPosTime != undefined;

		console.log(isSelected, selectedPosTime);
		return (
			<View style={styles.toolBar}>
				<TouchableOpacity onPress={addFormation}>
					<IconIonicons name="add-circle" size={40} style={styles.tool} />
				</TouchableOpacity>

				<TouchableOpacity
				disabled={!isSelected}
				onPress={deleteFormation}>
					<IconIonicons name="trash-sharp" size={40} style={isSelected ? styles.tool : styles.toolDisabled} />
				</TouchableOpacity>
			</View>
    )
  }
}