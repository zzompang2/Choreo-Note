import React from "react";
import { 
	PanResponder, View
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PositionMarker/";

export default class PositionMarker extends React.Component {
	constructor(props) {
		super(props);

		const { time, duration, setScrollEnable, changePositionboxLength } = props;
    this.leftBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preTime = time;												// 초기값 저장
				this.endTime = time + duration;	// 초과를 막기 위한 time 의 max 값
				setScrollEnable(false);										// scroll 막기
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: (event, gesture) => {
				this.newTime = this.preTime + Math.round(gesture.dx / 40);
				if(time != this.newTime && this.newTime < this.endTime)
					changePositionboxLength(this.newTime, this.endTime-this.newTime);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				setScrollEnable(true);
      }
		});
		
		this.rightBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preDuration = duration;				// 초기값 저장
				setScrollEnable(false);						// scroll 막기
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: (event, gesture) => {
				this.newDuration = this.preDuration + Math.round(gesture.dx / 40);
				if(duration != this.newDuration && 0 < this.newDuration)
					changePositionboxLength(time, this.newDuration);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				setScrollEnable(true);
      }
    });
	}
	
	render() {
		const { time, duration } = this.props;
		const styles = getStyleSheet();

		return (
			<View style={{position: 'absolute', left: 20+40*time, width: 40*duration}}>
				<View
				{...this.leftBtnResponder.panHandlers}
				style={styles.positionbox__leftbtn} />

				<View
				{...this.rightBtnResponder.panHandlers}
				style={{...styles.positionbox__rightbtn, left: 40*duration}} />

			</View>
    )
  }
}