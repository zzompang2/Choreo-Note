import React from "react";
import { 
	Dimensions, View,
} from "react-native";
import getStyleSheet from "../values/styles";

// 화면의 가로, 세로 길이 받아오기
const { width } = Dimensions.get('window');
const TAG = "Coordinate/";

export default class Coordinate extends React.Component {

	drawAxises = (styles) => {
		const { height } = this.props;
		const coordGap = 30;
		let count = 0;
		this.axises = [];

		// 중심부터 오른쪽 세로축
		for(let gap = 0; gap < width/2; gap += coordGap) {
			const thickness = count % 5 == 0 ? 3 : 1;
			count++;
			this.axises.push(
				<View 
				key={this.axises.length}
				style={{
					...styles.stageAxisVertical,
					transform: [{translateX: gap}],
					width: thickness
				}} />
			);
		}

		// 중심부터 왼쪽 세로축
		count = 1;
		for(let gap = -coordGap; gap > -width/2; gap -= coordGap) {
			const thickness = count % 5 == 0 ? 3 : 1;
			count++;
			this.axises.push(
				<View 
				key={this.axises.length}
				style={{
					...styles.stageAxisVertical,
					transform: [{translateX: gap}],
					width: thickness
				}} />
			);
		}

		// 중심부터 위쪽 가로축
		count = 0;
		for(let gap = 0; gap < height/2; gap += coordGap) {
			const thickness = count % 5 == 0 ? 3 : 1;
			count++;
			this.axises.push(
				<View 
				key={this.axises.length+1}
				style={{
					...styles.stageAxisHorizontal,
					transform: [{translateY: gap}],
					height: thickness
				}} />
			);
		}

		// 중심부터 아래쪽 가로축
		count = 1;
		for(let gap = -coordGap; gap > -height/2; gap -= coordGap) {
			const thickness = count % 5 == 0 ? 3 : 1;
			count++;
			this.axises.push(
				<View 
				key={this.axises.length+1}
				style={{
					...styles.stageAxisHorizontal,
					transform: [{translateY: gap}],
					height: thickness
				}} />
			);
		}
	}

  render() {
		const styles = getStyleSheet();
		const { height } = this.props;
		
		this.drawAxises(styles);

    return (
      <View style={{...styles.stageAxis, height: height}}>
				{this.axises}
			</View>
    )
  }
}