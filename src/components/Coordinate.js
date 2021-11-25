import React, { useEffect } from "react";
import { View } from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import getStyleSheet from "../values/styles";

const TAG = "Coordinate/";
const styles = getStyleSheet();

export default function Coordinate({
	stageSize,
	coordinateGapInDevice,
	changeCoordinateGap,
}) {
	const { width, height } = stageSize;
	let count = 0;
	this.axises = [];

	// 중심부터 오른쪽 세로축
	for(let x = 0; x < width/2; x += coordinateGapInDevice) {
		const thickness = count % 4 == 0 ? 2 : 1;
		count++;
		this.axises.push(
			<View 
			key={this.axises.length}
			style={{
				...styles.stageAxisVertical,
				transform: [{translateX: x}],
				width: thickness
			}} />
		);
	}

	// 중심부터 왼쪽 세로축
	count = 1;
	for(let x = -coordinateGapInDevice; x > -width/2; x -= coordinateGapInDevice) {
		const thickness = count % 4 == 0 ? 2 : 1;
		count++;
		this.axises.push(
			<View 
			key={this.axises.length}
			style={{
				...styles.stageAxisVertical,
				transform: [{translateX: x}],
				width: thickness
			}} />
		);
	}

	// 중심부터 위쪽 가로축
	count = 0;
	for(let y = 0; y < height/2; y += coordinateGapInDevice) {
		const thickness = count % 4 == 0 ? 2 : 1;
		count++;
		this.axises.push(
			<View 
			key={this.axises.length+1}
			style={{
				...styles.stageAxisHorizontal,
				transform: [{translateY: y}],
				height: thickness
			}} />
		);
	}

	// 중심부터 아래쪽 가로축
	count = 1;
	for(let y = -coordinateGapInDevice; y > -height/2; y -= coordinateGapInDevice) {
		const thickness = count % 4 == 0 ? 2 : 1;
		count++;
		this.axises.push(
			<View 
			key={this.axises.length+1}
			style={{
				...styles.stageAxisHorizontal,
				transform: [{translateY: y}],
				height: thickness
			}} />
		);
	}

	// pinch 이벤트가 시작할 때 좌표 간격 초기값을 저장한다
	_onPinchHandlerStateChange = (event) => {
		if (event.nativeEvent.oldState === State.BEGAN)
		this.coordinateGapInDevice = coordinateGapInDevice;
	};
	
	// 저장했던 초기값과 pinch scale 을 이용하여 gap 을 변경한다.
	_changeCoordinateGap = (scale) => {
		const newGap = this.coordinateGapInDevice * scale;
		changeCoordinateGap(newGap);
	}

	return (
		<PinchGestureHandler
		onGestureEvent={event => this._changeCoordinateGap(event.nativeEvent.scale)}
		onHandlerStateChange={this._onPinchHandlerStateChange}
		>
			<View style={{...styles.stageAxis, height: '100%'}}>
				{this.axises}
			</View>
		</PinchGestureHandler>
	)
}