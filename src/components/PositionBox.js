import React from "react";
import { 
	PanResponder, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PositionBox/";

export default class PositionBox extends React.Component {

	render() {
		const { time, duration, isSelected, selectPositionBox } = this.props;
		const styles = getStyleSheet();
		const positionboxStyle = isSelected ? styles.positionboxSelected : styles.positionbox;

		return (
			<View style={{position: 'absolute', left: 20+40*time, width: 40*duration}}>
				<TouchableOpacity
				// disabled={isSelected}
				onPress={() => selectPositionBox(time)}
				style={positionboxStyle} />
			</View>
    )
  }
}

