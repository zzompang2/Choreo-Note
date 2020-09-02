import React from "react";
import { 
	PanResponder, Animated, View,
} from "react-native";
import { COLORS } from '../values/Colors'

const TAG = "Positionbox/";

export default class Positionbox extends React.Component {
	constructor(props) {
		super(props);
		this.time = this.props.time;
		this.duration = this.props.duration;
	
		this.leftResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// _changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const _changedDuration = this.duration - Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.duration != _changedDuration)
					this.props.resizePositionboxLeft(false, _changedDuration, this.time);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'leftResponder/', "터치 끝");
				
				// scroll unlock
				this.props.setScrollEnable(false);

				this.props.resizePositionboxLeft(true, this.props.duration, this.time);
				
				this.time = this.props.time;					// 바뀐 time 값 저장
				this.duration = this.props.duration;	// 바뀐 duration 값 저장
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
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				
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
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				// this.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// _changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const _changedDuration = this.duration + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.duration != _changedDuration)
					this.props.resizePositionboxRight('edit', _changedDuration - this.props.duration);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'rightResponder/', "터치 끝");
				
				// scroll unlock
				this.props.setScrollEnable(false);

				this.duration = this.props.duration;
				this.props.resizePositionboxRight('update');
				//this.props.changeDuration('right', this.props.time, this.duration, false);
      }
		})
	}

	render(){
		console.log(TAG, 'render');

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