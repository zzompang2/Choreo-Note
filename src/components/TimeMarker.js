import React from "react";
import { 
	PanResponder, Animated, View
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "TimeMarker/";

export default class TimeMarker extends React.Component {
	constructor(props) {
		super(props);

    /** Initialize PanResponder with move handling **/
    this.panResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => !this.props.isPlay,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preTime = this.props.curTime;		// 초기 위치 저장
				this.props.setScrollEnable(false);		// scroll 막기
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: (event, gesture) => {
				const newTime = this.preTime + Math.round(gesture.dx / this.props.unitBoxWidth) * this.props.unitTime;
				if(this.props.curTime != newTime)
					this.props.setCurTime(newTime);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				this.props.setScrollEnable(true);
      }
    });
	}
	
	render() {
		const { curTime, unitBoxWidth, unitTime } = this.props;
		const styles = getStyleSheet();

		return (
      <Animated.View
      pointerEvents='auto'
      {...this.panResponder.panHandlers}
			style={[styles.timeMarkerContainer, {width: unitBoxWidth, left: curTime / unitTime * unitBoxWidth}]}>
				<View style={styles.timeMarker} />
			</Animated.View>
    )
  }
}