import React from "react";
import { 
	Dimensions, View,
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "Coordinate/";

export default class Coordinate extends React.Component {

	drawAxises = (styles) => {
		const { stageSize: { width, height }, coordinateGapInDevice } = this.props;
		let count = 0;
		this.axises = [];

		// 중심부터 오른쪽 세로축
		for(let x = 0; x < width/2; x += coordinateGapInDevice) {
			const thickness = count % 5 == 0 ? 2 : 1;
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
			const thickness = count % 5 == 0 ? 2 : 1;
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
			const thickness = count % 5 == 0 ? 2 : 1;
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
			const thickness = count % 5 == 0 ? 2 : 1;
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
	}

	shouldComponentUpdate(nextProps) {
		if(this.props.stageSize != nextProps.stageSize ||
			this.coordinateGapInDevice != nextProps.coordinateGapInDevice)
		return true;

		return false;
	}

  render() {
		const styles = getStyleSheet();		
		this.drawAxises(styles);

    return (
      <View style={{...styles.stageAxis, height: '100%'}}>
				{this.axises}
			</View>
    )
  }
}