import React from "react";
import { 
	PanResponder, Animated, View,
} from "react-native";
import { COLORS } from '../values/Colors'

const TAG = "PositionChecker/";

export default class PositionChecker extends React.Component {
	constructor(props) {
		super(props);
		console.log(TAG, 'constructor');
		this.boxInfo;
	
		this.leftResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
				// 초기 상태 저장
				this.initialValue = {beat: this.boxInfo.beat, duration: this.boxInfo.duration};
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.initialValue.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.boxInfo.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const changedDuration = this.initialValue.duration - Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.boxInfo.duration != changedDuration && changedDuration >= 0)
					this.props.resizePositionboxLeft(false, changedDuration, this.initialValue.beat);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 끝");
				// scroll unlock
				this.props.setScrollEnable(false);

				// const changedDuration = this.initialValue.duration - Math.round(gesture.dx / this.props.boxWidth);
				const changedDuration = this.boxInfo.duration;
				this.props.resizePositionboxLeft(true, changedDuration, this.initialValue.beat);
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
				this.initialValue = {beat: this.boxInfo.beat, duration: this.boxInfo.duration};
				console.log('initial value: ', this.initialValue);
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				const changedBeat = this.initialValue.beat + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.boxInfo.beat != changedBeat)
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
					this.props.movePositionbox(true, this.boxInfo.beat, this.initialValue.beat);
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
				this.initialValue = {beat: this.boxInfo.beat, duration: this.boxInfo.duration};
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.initialValue.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.boxInfo.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const changedDuration = this.initialValue.duration + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.boxInfo.duration != changedDuration && changedDuration >= 0)
					this.props.resizePositionboxRight(false, changedDuration);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'rightResponder/', "터치 끝");
				
				// scroll unlock
				this.props.setScrollEnable(false);

				// this.boxInfo.duration = this.props.boxInfo.duration;	// 바뀐 duration 값 저장
				this.props.resizePositionboxRight(true);
      }
		})
	}

	render(){
		console.log(TAG, 'render');

		this.boxInfo = this.props.boxInfo;

		return(
			this.boxInfo.posIndex == -1 ?
			<View/>
			:
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