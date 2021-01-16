import React from "react";
import { 
	PanResponder, View, TouchableOpacity
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PositionBox/";

export default class PositionBox extends React.Component {
	constructor(props) {
		super(props);

		this.leftBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preTime = this.props.time;												// 초기값 저장
				this.endTime = this.props.time + this.props.duration;	// 초과를 막기 위한 time 의 max 값
				this.props.setScrollEnable(false);										// scroll 막기
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: (event, gesture) => {
				this.newTime = this.preTime + Math.round(gesture.dx / 40);
				if(this.props.time != this.newTime && this.newTime < this.endTime)
					this.props.changePositionboxLength(this.newTime, this.endTime-this.newTime);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				this.props.setScrollEnable(true);
      }
		});
		
		this.rightBtnResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => true,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preDuration = this.props.duration;				// 초기값 저장
				this.props.setScrollEnable(false);						// scroll 막기
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: (event, gesture) => {
				this.newDuration = this.preDuration + Math.round(gesture.dx / 40);
				if(this.props.duration != this.newDuration && 0 < this.newDuration)
					this.props.changePositionboxLength(this.props.time, this.newDuration);
			},

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				this.props.setScrollEnable(true);
      }
    });
	}
	render() {
		const { time, duration, isSelected, selectPositionBox } = this.props;
		const styles = getStyleSheet();

		return (
			<View style={{position: 'absolute', left: 20+40*time, width: 40*duration}}>
				<TouchableOpacity
				disabled={isSelected}
				onPress={() => selectPositionBox(time)}
				style={styles.positionbox} />
				{isSelected ?
				<View
				{...this.leftBtnResponder.panHandlers}
				style={styles.positionbox__leftbtn} />
				:
				null}
				{isSelected ?
				<View
				{...this.rightBtnResponder.panHandlers}
				style={{...styles.positionbox__rightbtn, left: 40*duration}} />
				:
				null}
			</View>
    )
  }
}

