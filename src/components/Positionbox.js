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
		this.state = {
			pan: new Animated.ValueXY(),
		}

		console.log(this.props.style);

		this.duration = this.props.duration;
	
		this.panResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, "onPanResponderGrant/터치 시작");

				// scroll lock
				this.props.setScrollEnable(true);
      },

			onPanResponderMove: (e, gesture) => {
				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// this.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// _changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				const _changedDuration = this.duration + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.duration != _changedDuration && _changedDuration >= 0){
					this.props.changeDuration(_changedDuration, true);	// this.props.duration = _changedDuration
				}
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, "onPanResponderRelease/터치 끝:");
				
				// scroll unlock
				this.props.setScrollEnable(false);

				// 그냥 클릭한 경우: select 취소
				if(gesture.dx == 0){
					this.props.unselectPosition();
					return;
				}
				else{
					this.duration = this.props.duration;
					this.props.changeDuration(this.duration, false);
				}
      }
		})
	}

	render(){
		console.log(TAG, 'render');

		return(
			<Animated.View {...this.panResponder.panHandlers}
			style={this.props.containerStyle}>
				<View style={this.props.style}/>
			</Animated.View>
		)
	}
}