import React from "react";
import { 
	PanResponder, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "FormationBox/";

export default class FormationBox extends React.Component {

	render() {
		const { time, duration, isSelected, selectFormationBox } = this.props;
		const styles = getStyleSheet();
		const formationBoxStyle = isSelected ? styles.formationBoxSelected : styles.formationBox;

		return (
			<View style={{position: 'absolute', left: 20+40*time, width: 40*duration}}>
				<TouchableOpacity
				// disabled={isSelected}
				onPress={() => selectFormationBox(time)}
				style={formationBoxStyle} />
			</View>
    )
  }
}

