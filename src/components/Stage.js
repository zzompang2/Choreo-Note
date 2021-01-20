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
			dancers, displayName, coordinateGapInDevice } = this.props;
		const styles = getStyleSheet();
		const height = width / stageRatio;

		const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;

		return (
			<View style={{...styles.stage, height: height, ...selectedStageStyle}}>
				<Coordinate stageSize={{ width, height }} coordinateGapInDevice={coordinateGapInDevice} />
				{positionsAtCurTime.map((animated, did) =>
				<Dancer
				key={dancers[did].key}
				changeDancerPosition={changeDancerPosition}
				dancer={dancers[did]}
				selectedPosTime={selectedPosTime}
				curPosAnimated={animated}
				displayName={displayName} />)}
			</View>
    )
  }
}