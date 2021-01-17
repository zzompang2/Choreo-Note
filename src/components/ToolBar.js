import React from "react";
import { 
	View, Text, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "ToolBar/";

export default class ToolBar extends React.Component {

  render() {
		const { addFormation } = this.props;
		const styles = getStyleSheet();

		return (
			<View style={styles.toolBar}>
				<TouchableOpacity onPress={addFormation}>
					<IconIonicons name="add-circle" size={50} />
				</TouchableOpacity>
			</View>
    )
  }
}