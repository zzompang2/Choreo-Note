import React, { useRef } from "react";
import { 
	PanResponder, Animated, Text, View
} from "react-native";
import getStyleSheet, { getDancerColors } from "../values/styles";

const TAG = "Dancer/";
const styles = getStyleSheet();
const dancerColors = getDancerColors();

export default function Dancer({
	dancer,
	curPosAnimated,
	selectedPosTime,
	displayName,
	changeDancerPosition,
}) {

	const curVal = useRef({ x: 0, y: 0 });

	curPosAnimated.addListener(value => {
		curVal.x = value.x;
		curVal.y = value.y;
	});

  const panResponder = 
    PanResponder.create({
			// 주어진 터치이벤트에 반응할지 결정
      onMoveShouldSetPanResponder: () => selectedPosTime !== undefined,

			// 터치이벤트 발생할 때
      onPanResponderGrant: () => {
        console.log(TAG, 'onPanResponderGrant');
				this.preVal = {...curVal};		// 초기 위치 저장
				
				/* 터치이벤트 도중 변하는 값은 value 이다. 그러나 내가 원하는 건
						x = dx, y = dy 가 아닌 (기존값) + dx 이므로
						offset 에 (기존값) 을 저장해 놓고 value 를 0 으로 세팅한다. */
				curPosAnimated.setOffset({ x: curVal.x, y: curVal.y })
				curPosAnimated.setValue({ x: 0, y: 0 });
      },

      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
        [null, { dx: curPosAnimated.x, dy: curPosAnimated.y }],
				{useNativeDriver: false}		// 움직임을 부드럽지 않도록 한다
      ),

			// 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
				curVal.x = this.preVal.x + gesture.dx;
				curVal.y = this.preVal.y + gesture.dy;

				// 이벤트 시작 때 세팅했던 offset 을 원래대로 돌린다
        curPosAnimated.flattenOffset();	// curPosAnimated.setOffset({ x: 0, y: 0 });
				changeDancerPosition(dancer.did, curVal.x, curVal.y);
      }
    });

	// 위치를 지정할 스타일
	const panStyle = { transform: curPosAnimated.getTranslateTransform() };

	return (
		<Animated.View
		pointerEvents='auto'
		{...panResponder.panHandlers}
		style={{...panStyle, position: 'absolute'}}>
			<View style={{...styles.dancer, backgroundColor: dancerColors[dancer.color]}}>
				<Text style={styles.dancer__number}>{displayName ? dancer.name.slice(0, 2) : dancer.did+1}</Text>
			</View>
		</Animated.View>
	)
}