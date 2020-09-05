import React from "react";
import { 
	PanResponder, Animated, View,
} from "react-native";
import { COLORS } from '../values/Colors'

const TAG = "Positionbox/";

export default class Positionbox extends React.Component {
	constructor(props) {
		super(props);
		console.log(TAG, 'constructor');
		this.beat;
		this.duration;
	
		this.leftResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
				// 초기 상태 저장
				this.initialValue = {beat: this.beat, duration: this.duration};
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.initialValue.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const changedDuration = this.initialValue.duration - Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.duration != changedDuration && changedDuration >= 0)
					this.props.resizePositionboxLeft(false, changedDuration, this.initialValue.beat);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 끝");
				// scroll unlock
				this.props.setScrollEnable(false);

				this.props.resizePositionboxLeft(true, this.props.duration, this.initialValue.beat);
      }
		})

		this.centerResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'centerResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
				// 초기 상태 저장
				this.initialValue = {beat: this.beat, duration: this.duration};
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				const changedBeat = this.initialValue.beat + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.beat != changedBeat)
					this.props.movePositionbox(false, changedBeat, this.initialValue.beat);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'centerResponder/', "터치 끝");
				// scroll unlock
				this.props.setScrollEnable(false);
				// 그냥 클릭한 경우: select 취소
				if(gesture.dx == 0){
					this.props.unselectPosition();
					return;
				}
				else{
					// 이동!
					this.props.movePositionbox(true, this.beat, this.initialValue.beat);
				}
      }
		})

		this.rightResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'rightResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
				// 초기 상태 저장
				this.initialValue = {beat: this.beat, duration: this.duration};
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.initialValue.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const changedDuration = this.initialValue.duration + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.duration != changedDuration && changedDuration >= 0)
					this.props.resizePositionboxRight(false, changedDuration);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'rightResponder/', "터치 끝");
				
				// scroll unlock
				this.props.setScrollEnable(false);

				// this.duration = this.props.duration;	// 바뀐 duration 값 저장
				this.props.resizePositionboxRight(true);
      }
		})
	}

	render(){
		console.log(TAG, 'render');

		this.beat = this.props.beat;
		this.duration = this.props.duration;

		return(
			<View style={this.props.containerStyle}>

				<Animated.View {...this.leftResponder.panHandlers}
				style={this.props.buttonStyle}/>

				<Animated.View {...this.centerResponder.panHandlers} 
				style={this.props.boxStyle}/>

				<Animated.View {...this.rightResponder.panHandlers}
				style={this.props.buttonStyle}/>
			
			</View>
		)
	}
}