import React, { useRef } from "react";
import { 
	Dimensions, PanResponder, Animated, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const { width } = Dimensions.get('window');
const TAG = "FormationMarker/";
const styles = getStyleSheet();

export default function FormationMarker({
	time, duration, unitBoxWidth, unitTime, selectFormationBox,
	changeFormationBoxLength, setScrollEnable
}) {

	const movedLeft = useRef(new Animated.Value(0)).current;
	const movedRight = useRef(new Animated.Value(0)).current;

	/*===== Left 버튼 =====*/
	const leftBtnResponder = PanResponder.create({

		// 주어진 터치이벤트에 반응할지 결정
		onStartShouldSetPanResponder: (event, gesture) => true,

		// 터치이벤트 발생할 때
		onPanResponderGrant: (event, gesture) => setScrollEnable(false),
		
		// MOVE 제스쳐가 진행 중일 때 (계속 실행)
		onPanResponderMove: Animated.event(
			[null, {dx: movedLeft}],
			{useNativeDriver: false}),

		// 터치이벤트 끝날 때
		onPanResponderRelease: (event, gesture) => {
			setScrollEnable(true);
			const preTime = time;												// 초기값
			const endTime = time + duration;	// box 의 오른쪽 끝부분
			let newTime = time + Math.round(gesture.dx / unitBoxWidth) * unitTime;
			if(preTime != newTime && newTime < endTime)
				changeFormationBoxLength(newTime, endTime - newTime);
		}
	});
	
	/*===== Right 버튼 =====*/
	const rightBtnResponder = PanResponder.create({

		// 주어진 터치이벤트에 반응할지 결정
		onStartShouldSetPanResponder: (event, gesture) => true,

		// 터치이벤트 발생할 때
		onPanResponderGrant: (event, gesture) => setScrollEnable(false),
		
		// MOVE 제스쳐가 진행 중일 때 (계속 실행)
		onPanResponderMove: Animated.event(
			[null, {dx: movedRight}],
			{useNativeDriver: false}),

		// 터치이벤트 끝날 때
		onPanResponderRelease: (event, gesture) => {
			setScrollEnable(true);
			const preDuration = duration;		// 초기값
			const newDuration = preDuration + Math.round(gesture.dx / unitBoxWidth) * unitTime;
			if(preDuration != newDuration && 0 < newDuration)
				changeFormationBoxLength(time, newDuration);
		}
	});

	movedRight.setValue(0);
	movedLeft.setValue(0);

	const containerLeftStyle = { left: width/2 + unitBoxWidth*(time/unitTime) };
	// (marker 의 width) = (기존값) + (이동한 오른쪽 거리) + (이동한 왼쪽 거리)
	const markerWidthStyle = { width: Animated.add(unitBoxWidth*(duration/unitTime), Animated.add(movedRight, Animated.multiply(-1, movedLeft))) };
	// (marker 의 left) = 0 - (이동한 왼쪽 거리)
	const markerLeftStyle = { left: movedLeft };
	// (left button 의 left) = 0 - (이동한 왼쪽 거리)
	const markerLeftBtnPosStyle = { left: Animated.add(-30, movedLeft) };
	// (right button 의 left) = (기존값) + (이동한 오른쪽 거리)
	const markerRightBtnPosStyle = { left: Animated.add(unitBoxWidth*(duration/unitTime), movedRight) };
	return (
		<Animated.View style={containerLeftStyle}>

			<TouchableOpacity
			activeOpacity={1}
			onPress={() => selectFormationBox(undefined)}>
				<Animated.View
				style={[styles.formationMarker, markerWidthStyle, markerLeftStyle]} />
			</TouchableOpacity>
			
			<Animated.View
			{...leftBtnResponder.panHandlers}
			style={[styles.formationMarker__leftbtn, markerLeftBtnPosStyle]} />

			<Animated.View
			{...rightBtnResponder.panHandlers}
			style={[styles.formationMarker__rightbtn, markerRightBtnPosStyle]} />

		</Animated.View>
	)
}