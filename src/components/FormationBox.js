import React from "react";
import { 
	Dimensions, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const { width } = Dimensions.get('window');
const TAG = "FormationBox/";

export default class FormationBox extends React.Component {

	render() {
		const { time, duration, isSelected, selectFormationBox, unitBoxWidth, unitTime } = this.props;
		const styles = getStyleSheet();
		const formationBoxStyle = isSelected ? styles.formationBoxSelected : styles.formationBox;

		return (
			<View style={{position: 'absolute', left: width/2 + unitBoxWidth*(time/unitTime), width: unitBoxWidth*(duration/unitTime)}}>
				<TouchableOpacity
				// disabled={isSelected}
				onPress={() => selectFormationBox(time)}
				style={formationBoxStyle} />
			</View>
    )
  }
}

