import React from "react";
import { 
	Dimensions, View,
} from "react-native";
import getStyleSheet from "../values/styles";
import Coordinate from "../components/Coordinate";
import { useEffect } from "react";

const { width } = Dimensions.get('window');
const TAG = "Stage/";

export default class Stage extends React.Component {

  render() {
		console.log(TAG, "render");
		const styles = getStyleSheet();
		const height = width / this.props.stageRatio;

		return (
			<View style={{...styles.stage, height: height}}>
				<Coordinate height={height} />
			</View>
    )
  }
}