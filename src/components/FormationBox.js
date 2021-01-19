import React from "react";
import { 
	PanResponder, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "FormationBox/";

export default class FormationBox extends React.Component {

	render() {
		const { time, duration, isSelected, selectFormationBox, unitBoxWidth } = this.props;
		const styles = getStyleSheet();
		const formationBoxStyle = isSelected ? styles.formationBoxSelected : styles.formationBox;

		return (
			<View style={{position: 'absolute', left: (unitBoxWidth/2)+unitBoxWidth*time, width: unitBoxWidth*duration}}>
				<TouchableOpacity
				// disabled={isSelected}
				onPress={() => selectFormationBox(time)}
				style={formationBoxStyle} />
			</View>
    )
  }
}

