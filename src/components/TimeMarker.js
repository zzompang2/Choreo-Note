import React from "react";
import { 
	PanResponder, Animated, View,
} from "react-native";
import { COLORS } from '../values/Colors'

const TAG = "TimeMarker/";
const BOX_WIDTH_MAX = 30;

export default class TimeMarker extends React.Component {
	constructor(props) {
		super(props);
		console.log(TAG, 'constructor');
		this.boxInfo;

		this.markerResponder = PanResponder.create({
			// 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      onStartShouldSetPanResponder: (e, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
				console.log(TAG, 'centerResponder/', "터치 시작");
				// scroll lock
				this.props.setScrollEnable(true);
				// 초기 상태 저장
				this.initialFrame = this.props.frame;
      },

			// 터치이벤트 진행중...
			onPanResponderMove: (e, gesture) => {
				const changedFrame = this.initialFrame + Math.round(gesture.dx / this.props.boxWidth);

				if(this.props.frame != changedFrame)
				this.props.moveTimeMarker(changedFrame);
					// this.props.moveTimeMarker(false, changedFrame, this.initialValue.frame);
			},

			// (추측) 터치이벤트가 비정상적으로 종료될 때
			// onPanResponderRelease를 실행한다.
			onPanResponderTerminationRequest: (event, gesture) => false,

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				console.log(TAG, 'centerResponder/', "터치 끝");
				// scroll lock
				this.props.setScrollEnable(false);
			},
		})
	}

	render(){
		console.log(TAG, 'render');

		this.boxInfo = this.props.boxInfo;

		return(
			<View 
			style={{
				width: this.props.boxWidth,
				position: 'absolute', 
				left: BOX_WIDTH_MAX/2 + this.props.boxWidth * this.props.frame,
				top: this.props.boxHeight - 10,
				justifyContent: 'center', 
				alignItems: 'center',}}>

				<Animated.View
				{...this.markerResponder.panHandlers}
				style={{
					height: 20,
					width: 14,
					backgroundColor: COLORS.green,
					}}>
				</Animated.View>
			</View>
		)
	}
}