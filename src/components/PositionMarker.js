import React from "react";
import { 
	PanResponder, Animated, View
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PositionMarker/";

export default class PositionMarker extends React.Component {
	constructor(props) {
		super(props);
		this.movedRight = new Animated.Value(0);
		this.movedLeft = new Animated.Value(0);

		const { setScrollEnable, changePositionboxLength } = props;

		/*===== Left 버튼 =====*/
    this.leftBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				// scroll 막기
				setScrollEnable(false);
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, {dx: this.movedLeft}],
				{useNativeDriver: false}),

      // 터치이벤트 끝날 때
      onPanResponderRelease: (event, gesture) => {
				// scroll 다시 작동
				setScrollEnable(true);

				const preTime = this.props.time;												// 초기값
				const endTime = this.props.time + this.props.duration;	// box 의 오른쪽 끝부분
				const newTime = this.props.time + Math.round(gesture.dx / 40);
				if(preTime != newTime && newTime < endTime)
					changePositionboxLength(newTime, endTime - newTime);
      }
		});
		
		/*===== Right 버튼 =====*/
		this.rightBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				// scroll 막기
				setScrollEnable(false);
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, {dx: this.movedRight}],
				{useNativeDriver: false}),

      // 터치이벤트 끝날 때
      onPanResponderRelease: (event, gesture) => {
				// scroll 다시 작동
				setScrollEnable(true);
				const preDuration = this.props.duration;		// 초기값
				const newDuration = preDuration + Math.round(gesture.dx / 40);
				if(preDuration != newDuration && 0 < newDuration)
					changePositionboxLength(this.props.time, newDuration);
      }
    });
	}
	
	render() {
		const { time, duration } = this.props;
		const styles = getStyleSheet();

		this.movedRight.setValue(0);
		this.movedLeft.setValue(0);

		// (marker 의 width) = (기존값) + (이동한 오른쪽 거리) + (이동한 왼쪽 거리)
		this.markerWidthStyle = { width: Animated.add(40*duration, Animated.add(this.movedRight, Animated.multiply(-1, this.movedLeft))) };
		// (marker 의 left) = 0 - (이동한 왼쪽 거리)
		this.markerLeftStyle = { left: this.movedLeft };
		// (left button 의 left) = 0 - (이동한 왼쪽 거리)
		this.markerLeftBtnPosStyle = { left: Animated.add(-30, this.movedLeft) };
		// (right button 의 left) = (기존값) + (이동한 오른쪽 거리)
		this.markerRightBtnPosStyle = { left: Animated.add(40*duration, this.movedRight) };
		return (
			<Animated.View style={{left: 20+40*time}}>

				<Animated.View style={[styles.positionMarker, this.markerWidthStyle, this.markerLeftStyle]} />
				
				<Animated.View
				{...this.leftBtnResponder.panHandlers}
				style={[styles.positionMarker__leftbtn, this.markerLeftBtnPosStyle]} />

				<Animated.View
				{...this.rightBtnResponder.panHandlers}
				style={[styles.positionMarker__rightbtn, this.markerRightBtnPosStyle]} />

			</Animated.View>
    )
  }
}