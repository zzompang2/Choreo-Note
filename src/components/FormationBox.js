import React from "react";
import { 
	Dimensions, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const { width } = Dimensions.get('window');
const TAG = "FormationBox/";
const styles = getStyleSheet();

export default function FormationBox({
	time, duration, isSelected, selectFormationBox, unitBoxWidth, unitTime
}) {
	return (
		<View style={{position: 'absolute', left: width/2 + unitBoxWidth*(time/unitTime), width: unitBoxWidth*(duration/unitTime)}}>
			<TouchableOpacity
			// disabled={isSelected}
			onPress={() => selectFormationBox(time)}
			style={isSelected ? styles.formationBoxSelected : styles.formationBox} />
		</View>
	)
}

