import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "PlayerBar/";
const { width } = Dimensions.get('window');
const playerTrackLength = width-140;

export default class PlayerBar extends React.Component {
	constructor(props) {
		super(props);

		const { musicLength, setCurTime } = props;

		this.musicTimeString = this.musicLengthFormat(musicLength);

		this.thumbLeft = new Animated.Value(0);

		this.thumbMoveResponder = PanResponder.create({
			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: () => !this.props.isPlay,

      // MOVE 제스쳐가 진행 중일 때 (계속 실행)
			onPanResponderMove: Animated.event(
				[null, {dx: this.thumbLeft}],
				{useNativeDriver: false}),

      // 터치이벤트 끝날 때
      onPanResponderRelease: (event, gesture) => {
				// state 업데이트
				const newTime = this.props.curTime + Math.round(this.props.musicLength * gesture.dx / playerTrackLength);
				setCurTime(newTime);
      }
		});
	}

	musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + time % 60}`;
	}

  render() {
		const { curTime, musicLength, pressPlayButton, isPlay } = this.props;
		const styles = getStyleSheet();
		
		const thumbStyle = { left: Animated.add(playerTrackLength * curTime / musicLength, this.thumbLeft) };
		const trackLeftStyle = { width: Animated.add(playerTrackLength * curTime / musicLength, this.thumbLeft) };
		const trackRightStyle = { width: Animated.add(playerTrackLength * (musicLength-curTime) / musicLength, Animated.multiply(-1, this.thumbLeft)) };
		this.thumbLeft.setValue(0);

		return (
			<View style={styles.playerBar}>
				{/* Play 버튼 */}
				<TouchableOpacity
				style={styles.playerBar__timeBox}
				disabled={false}
				onPress={pressPlayButton}>
					<IconIonicons name={isPlay ? "pause" : "play"} size={40} style={styles.playerBar__btn} />
				</TouchableOpacity>

				<View style={styles.playerBar__track}>
					<Animated.View style={[styles.playerBar__trackBgLeft, trackLeftStyle]} />
					<Animated.View style={[styles.playerBar__trackBgRight, trackRightStyle]} />
					<Animated.View
					{...this.thumbMoveResponder.panHandlers}
					style={[styles.playerBar__thumb, thumbStyle]} />
				</View>

				<View style={styles.playerBar__timeBox}>
					<Text style={styles.playerBar__time}>{this.musicTimeString}</Text>
				</View>

			</View>
    )
  }
}