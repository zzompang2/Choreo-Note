import React, { useEffect } from "react";
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

export default function Stage({
	stageRatio,
	positionsAtCurTime,
	changeDancerPosition,
	selectedPosTime,
	dancers,
	displayName,
	coordinateGapInDevice,
	changeCoordinateGap,
	isPlay,
	isRotate,
	coordinateOn,
}) {
	this.stageRotate = new Animated.Value(0);

	useEffect(() => {
		// console.log(this.props.isRotate, nextProps.isRotate);
		if(isRotate)
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
	}, [isRotate]);

	const styles = getStyleSheet();
	const height = width / stageRatio;

	const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;
	const stageRotateStyle = {transform: [{ rotate: this.stageRotate.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '180deg']
	})}]};

	return (
		<View style={{height: width, justifyContent: 'center'}}>
		<Animated.View style={{...stageRotateStyle, ...styles.stage, height: height, ...selectedStageStyle}}>
			{ coordinateOn ?
			<Coordinate
			stageSize={{ width, height }}
			coordinateGapInDevice={coordinateGapInDevice}
			changeCoordinateGap={changeCoordinateGap} />
			: null }
			{dancers.map((dancer, idx) =>
				<Dancer
				key={dancer.key}
				changeDancerPosition={changeDancerPosition}
				dancer={dancer}
				selectedPosTime={selectedPosTime}
				curPosAnimated={positionsAtCurTime[idx]}
				displayName={displayName} />)
			}
			{/* {positionsAtCurTime.map((animated, did) =>
				<Dancer
				key={dancers[did].key}
				changeDancerPosition={changeDancerPosition}
				dancer={dancers[did]}
				selectedPosTime={selectedPosTime}
				curPosAnimated={animated}
				displayName={displayName} />)
			} */}
		</Animated.View>

			{isRotate && !isPlay ?
			<View style={{
				position: 'absolute', bottom: 0,
				width: '100%', height: 18,
				backgroundColor: COLORS.abnormal,
				alignItems: 'center', justifyContent: 'center'}}>
				<Text>무대가 회전되어 있을 때는 편집할 수 없습니다.</Text>
			</View> : null}
		</View>
	)
}