import React from "react";
import { 
	PanResponder, Animated, Text
} from "react-native";
import getStyleSheet, { getDancerColors } from "../values/styles";

const TAG = "Dancer/";

export default class Dancer extends React.Component {
	constructor(props) {
		super(props);

		this.curVal = { x: 0, y: 0 };
    
    // setValue() 실행시 실행됨
		this.props.curPosAnimated.addListener(value => this.curVal = value);
		
    /** Initialize PanResponder with move handling **/
    this.panResponder = PanResponder.create({

			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: () => this.props.selectedPosTime !== undefined,

      // 터치이벤트 발생할 때
      onPanResponderGrant: (event, gesture) => {
				this.preVal = {...this.curVal};		// 초기 위치 저장
				
				/* 터치이벤트 도중 변하는 값은 value 이다. 그러나 내가 원하는 건
					 x = dx, y = dy 가 아닌 (기존값) + dx 이므로
					 offset 에 (기존값) 을 저장해 놓고 value 를 0 으로 세팅한다. */
        this.props.curPosAnimated.setOffset({ x: this.curVal.x, y: this.curVal.y })
        this.props.curPosAnimated.setValue({ x: 0, y: 0 });
			},
			
      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, { dx: this.props.curPosAnimated.x, dy: this.props.curPosAnimated.y }],
				{useNativeDriver: false}		// 움직임을 부드럽지 않도록 한다
			),

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
        this.curVal = {
					x: this.preVal.x + gesture.dx,
					y: this.preVal.y + gesture.dy
				};
				// 이벤트 시작 때 세팅했던 offset 을 원래대로 돌린다
				this.props.curPosAnimated.setOffset({ x: 0, y: 0 });
        this.props.changeDancerPosition(this.props.dancer.did, this.curVal.x, this.curVal.y);
      }
    });
	}

	render() {
		const { dancer, curPosAnimated, displayName } = this.props;
		const styles = getStyleSheet();
		const dancerColors = getDancerColors();

		// 위치를 지정할 스타일
    const panStyle = { transform: curPosAnimated.getTranslateTransform() };

		return (
      <Animated.View
      pointerEvents='auto'
      {...this.panResponder.panHandlers}
			style={[panStyle, styles.dancer, {backgroundColor: dancerColors[dancer.color]}]}>
      	<Text style={styles.dancer__number}>{displayName ? dancer.name.slice(0, 2) : dancer.did+1}</Text>
      </Animated.View>
    )
  }
}