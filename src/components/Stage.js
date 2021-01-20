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
		const { stageRatio, positionsAtCurTime, changeDancerPosition, selectedPosTime,
			dancers, displayName, unitTime } = this.props;
		const styles = getStyleSheet();
		const height = width / stageRatio;

		const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;

		return (
			<View style={{...styles.stage, height: height, ...selectedStageStyle}}>
				<Coordinate height={height} />
				{positionsAtCurTime.map((animated, did) =>
				<Dancer
				key={did}
				changeDancerPosition={changeDancerPosition}
				dancer={dancers[did]}
				selectedPosTime={selectedPosTime}
				curPosAnimated={animated}
				displayName={displayName} />)}
			</View>
    )
  }
}