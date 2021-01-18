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

		const { setCurTime } = props;

		this.musicTimeString = this.musicLengthFormat();

		this.thumbLeft = new Animated.Value(0);

		this.thumbMoveResponder = PanResponder.create({
			// 주어진 터치이벤트에 반응할지 결정
      onStartShouldSetPanResponder: () => true,

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

	musicLengthFormat() {
		const { musicLength } = this.props;
		return `${Math.floor(musicLength / 60)}:${(musicLength % 60 < 10 ? '0' : '') + musicLength % 60}`;
	}

  render() {
		const { curTime, musicLength, playMusic, isPlay } = this.props;
		const styles = getStyleSheet();
		
		const trackStyle = { left: Animated.add(playerTrackLength * curTime / musicLength, this.thumbLeft) };
		this.thumbLeft.setValue(0);

		return (
			<View style={styles.playerBar}>
				{/* Play 버튼 */}
				<TouchableOpacity
				style={styles.playerBar__timeBox}
				disabled={false}
				onPress={playMusic}>
					<IconIonicons name={isPlay ? "pause" : "play"} size={40} style={styles.playerBar__btn} />
				</TouchableOpacity>

				<View style={styles.playerBar__track}>
					<View style={styles.playerBar__trackBg} />
					<Animated.View
					{...this.thumbMoveResponder.panHandlers}
					style={[styles.playerBar__thumb, trackStyle]} />
				</View>

				<View style={styles.playerBar__timeBox}>
					<Text style={styles.playerBar__time}>{this.musicTimeString}</Text>
				</View>

			</View>
    )
  }
}