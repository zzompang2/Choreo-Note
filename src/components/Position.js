import React from "react";
import { 
	View, Text, StyleSheet, PanResponder, Animated, Dimensions,
} from "react-native";
import { COLORS } from '../values/Colors'

const TAG = "Position/";

export default class Position extends React.Component {
	constructor(props) {
		super(props);

		console.log(TAG, 'constructor');
		this.state = {
			pan: new Animated.ValueXY(),
		}
		// this._val = { x:0, y:0 };
		this.duration = this.props.duration;

		// this.state.pan.addListener((value) => this._val = value);

		this.panResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, "onPanResponderGrant/터치 시작");

				// scroll lock
				this.props.positionTouchHandler(true);

        // // drag되기 전 초기 위치 저장
        // this._prevVal = {x: this._val.x, y: this._val.y}

        // this.state.pan.setOffset({
				// 	x: this._val.x,
				// 	y: this._val.y,
        // })
        // this.state.pan.setValue({x:0, y:0});
        // //this.onChange();
      },

       // moving 제스쳐가 진행중일 때 실행.
       // 마우스 따라 움직이도록 하는 코드.
      //  onPanResponderMove:
      //  Animated.event(
      //    [null, 
      //    { dx: this.state.pan.x, 
      //      dy: this.state.pan.y }
      //    ], 
      //    {useNativeDriver: false}
			//  ),
			onPanResponderMove: (e, gesture) => {
				const _changedDuration = this.duration + Math.round(gesture.dx / this.boxSize);

				// this.props.duration : FormationScreen 에서의 duration 값 (드래그 도중 변함)
				// this.duration : 드래그를 시작하기 전 duration 값 (드래그 도중 변하지 않음)
				// _changedDuration : 드래그 거리 기반으로 계산한 duration 값 (드래그 도중 변함)

				if(this.props.duration != _changedDuration && _changedDuration >= 0){
					// this.duration = _changedDuration;
					this.props.changeDuration(_changedDuration);	// this.props.duration = _changedDuration

					// console.log('duration change!');
				}
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, "onPanResponderRelease/터치 끝");
				
				// scroll unlock
				this.props.positionTouchHandler(false);
				this.duration = this.props.duration;

        // this.state.pan.setOffset({x: 0, y: 0});
        this.forceUpdate();
      }
		})
	}

	render(){
		console.log(TAG, 'render');
		selectedStyle = {backgroundColor: COLORS.yellow};
		
		this.boxSize = this.props.boxSize;
		// this.duration = this.props.duration;

		// const panStyle = { transform: this.state.pan.getTranslateTransform() }

		return(
			<Animated.View
			{...this.panResponder.panHandlers}
			style={[{
				height: 10, 
				width: 10 + this.boxSize * this.props.duration, 
				marginHorizontal: this.boxSize/2 - 5,
				backgroundColor: COLORS.red,
				borderRadius: 5,
				position: 'absolute'
			}, selectedStyle]}/>
		)
	}
}