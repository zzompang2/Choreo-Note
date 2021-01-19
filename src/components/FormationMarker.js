import React from "react";
import { 
	Dimensions, PanResponder, Animated
} from "react-native";
import getStyleSheet from "../values/styles";

const { width } = Dimensions.get('window');
const TAG = "FormationMarker/";

export default class FormationMarker extends React.Component {
	constructor(props) {
		super(props);
		this.movedBody = new Animated.Value(0);
		this.movedRight = new Animated.Value(0);
		this.movedLeft = new Animated.Value(0);

		const { setScrollEnable, changeFormationBoxLength, selectFormationBox } = props;

		/*===== Box 드래그 앤 드랍 =====*/
		this.boxMoveResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: () => true,

      // 터치이벤트 발생할 때 scroll 막기
      onPanResponderGrant: () => setScrollEnable(false),
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, {dx: this.movedBody}],
				{useNativeDriver: false}),

      // 터치이벤트 끝날 때
      onPanResponderRelease: (event, gesture) => {
				// scroll 다시 작동
				setScrollEnable(true);
				
				// 터치만 한 경우
				if(Math.abs(gesture.dx) < 5)
					selectFormationBox();

				// state 업데이트
				const newTime = this.props.time + Math.round(gesture.dx / this.props.unitBoxWidth) * this.props.unitTime;
				console.log(newTime, this.props.time);
				if(newTime != this.props.time)
					changeFormationBoxLength(newTime, this.props.duration);
      }
		});

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
				const newTime = this.props.time + Math.round(gesture.dx / this.props.unitBoxWidth) * this.props.unitTime;
				if(preTime != newTime && newTime < endTime)
					changeFormationBoxLength(newTime, endTime - newTime);
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
				const newDuration = preDuration + Math.round(gesture.dx / this.props.unitBoxWidth) * this.props.unitTime;
				if(preDuration != newDuration && 0 < newDuration)
					changeFormationBoxLength(this.props.time, newDuration);
      }
    });
	}
	
	render() {
		const { time, duration, unitBoxWidth, unitTime } = this.props;
		const styles = getStyleSheet();

		this.movedBody.setValue(0);
		this.movedRight.setValue(0);
		this.movedLeft.setValue(0);

		this.containerLeftStyle = { left: Animated.add(width/2 + unitBoxWidth*(time/unitTime), this.movedBody) };
		// (marker 의 width) = (기존값) + (이동한 오른쪽 거리) + (이동한 왼쪽 거리)
		this.markerWidthStyle = { width: Animated.add(unitBoxWidth*(duration/unitTime), Animated.add(this.movedRight, Animated.multiply(-1, this.movedLeft))) };
		// (marker 의 left) = 0 - (이동한 왼쪽 거리)
		this.markerLeftStyle = { left: this.movedLeft };
		// (left button 의 left) = 0 - (이동한 왼쪽 거리)
		this.markerLeftBtnPosStyle = { left: Animated.add(-30, this.movedLeft) };
		// (right button 의 left) = (기존값) + (이동한 오른쪽 거리)
		this.markerRightBtnPosStyle = { left: Animated.add(unitBoxWidth*(duration/unitTime), this.movedRight) };
		return (
			<Animated.View style={this.containerLeftStyle}>

				<Animated.View
				{...this.boxMoveResponder.panHandlers}
				style={[styles.formationMarker, this.markerWidthStyle, this.markerLeftStyle]} />
				
				<Animated.View
				{...this.leftBtnResponder.panHandlers}
				style={[styles.formationMarker__leftbtn, this.markerLeftBtnPosStyle]} />

				<Animated.View
				{...this.rightBtnResponder.panHandlers}
				style={[styles.formationMarker__rightbtn, this.markerRightBtnPosStyle]} />

			</Animated.View>
    )
  }
}