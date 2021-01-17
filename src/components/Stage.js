import React from "react";
import { 
	Dimensions, View,
} from "react-native";
import getStyleSheet from "../values/styles";
import Coordinate from "../components/Coordinate";
import Dancer from "./Dancer";

const { width } = Dimensions.get('window');
const TAG = "Stage/";

export default class Stage extends React.Component {

  render() {
		const { positionsAtSameTime, changeDancerPosition, selectedPosTime, dancers } = this.props;
		const styles = getStyleSheet();
		const height = width / this.props.stageRatio;

		const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;

		return (
			<View style={{...styles.stage, height: height, ...selectedStageStyle}}>
				<Coordinate height={height} />
				{positionsAtSameTime.map((pos, did) =>
				<Dancer
				key={did}
				changeDancerPosition={changeDancerPosition}
				dancer={dancers[did]}
				selectedPosTime={selectedPosTime}
				curPos={{
					x: pos.x,
					y: pos.y
				}} />)}
			</View>
    )
  }
}