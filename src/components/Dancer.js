import React from "react";
import { 
	PanResponder, Animated, Text
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "Dancer/";

export default class Dancer extends React.Component {
	constructor(props) {
		super(props);
		this.pan = new Animated.ValueXY();
		
		this.curVal = { x: 0, y: 0 };
    
    // setValue() 실행시 실행됨
		this.pan.addListener(value => this.curVal = value);
		
    /** Initialize PanResponder with move handling **/
    this.panResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: (event, gesture) => {
        return true;
      },

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
        this.preVal = {...this.curVal};		// 초기 위치 저장

        this.pan.setOffset({ x: this.curVal.x, y: this.curVal.y })
        this.pan.setValue({ x: 0, y: 0 });
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, { dx: this.pan.x, dy: this.pan.y }],
				{useNativeDriver: false}		// 움직임을 부드럽지 않도록 한다
			),

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
        this.curVal = {
					x: this.preVal.x + gesture.dx,
					y: this.preVal.y + gesture.dy
				};

				this.pan.setOffset({ x: 0, y: 0 });
        this.props.setDancerPosition(this.props.did, this.curVal.x, this.curVal.y);
      }
    });
	}
	
	render() {
		const { did, curPos } = this.props;
		const styles = getStyleSheet();

		// this.curVal 을 curPos 값으로 업데이트
		this.pan.setValue(curPos);
		
		// 위치를 지정할 스타일
    const panStyle = { transform: this.pan.getTranslateTransform() };

		return (
      <Animated.View
      pointerEvents='auto'
      {...this.panResponder.panHandlers}
			style={[panStyle, styles.dancer]}>
      	<Text>{did+1}</Text>
      </Animated.View>
    )
  }
}