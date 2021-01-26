import React from "react";
import { 
	Animated,
	Dimensions,
	View,
	Text,
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import Coordinate from "../components/Coordinate";
import Dancer from "./Dancer";

const { width } = Dimensions.get('window');
const TAG = "Stage/";

export default class Stage extends React.Component {
	constructor(props) {
		super(props);
		this.stageRotate = new Animated.Value(0);
	}

	shouldComponentUpdate(nextProps) {
		console.log(this.props.isRotate, nextProps.isRotate);
		if(this.props.isRotate != nextProps.isRotate) {
			if(nextProps.isRotate)
			Animated.timing(
				this.stageRotate, {
					toValue: 1,
					duration: 500,
					useNativeDriver: false,
				}
			).start();

			else
			Animated.timing(
				this.stageRotate, {
					toValue: 0,
					duration: 500,
					useNativeDriver: false,
				}
			).start();
		}
		return true;
	}

  render() {
		const { stageRatio, positionsAtCurTime, changeDancerPosition, selectedPosTime,
			dancers, displayName, coordinateGapInDevice, changeCoordinateGap, isPlay, isRotate } = this.props;
		const styles = getStyleSheet();
		const height = width / stageRatio;

		const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;
		const stageRotateStyle = {transform: [{ rotate: this.stageRotate.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '180deg']
		})}]};

		return (
			<View style={{height: width, justifyContent: 'center'}}>
			<Animated.View style={[stageRotateStyle, styles.stage, {height: height}, selectedStageStyle]}>
				<Coordinate
				stageSize={{ width, height }}
				coordinateGapInDevice={coordinateGapInDevice}
				changeCoordinateGap={changeCoordinateGap} />
				{positionsAtCurTime.map((animated, did) =>
				<Dancer
				key={dancers[did].key}
				changeDancerPosition={changeDancerPosition}
				dancer={dancers[did]}
				selectedPosTime={selectedPosTime}
				curPosAnimated={animated}
				displayName={displayName} />)}
			</Animated.View>

				{isRotate && !isPlay ?
				<View style={{
					position: 'absolute', bottom: 0,
					width: '100%', height: 18,
					backgroundColor: COLORS.yellow,
					alignItems: 'center', justifyContent: 'center'}}>
					<Text>Cannot edit formations while stage is rotated.</Text>
				</View> : null}
			</View>
    )
  }
}