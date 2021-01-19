import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "PlayerBar/";
const { width } = Dimensions.get('window');
const playerTrackLength = width-125;

export default class PlayerBar extends React.Component {
	constructor(props) {
		super(props);

		const { musicLength, setCurTime, bottomScrollMoveTo } = props;

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
				const newTime = this.props.curTime + 1000 * Math.round(gesture.dx * this.props.musicLength / playerTrackLength);
				// scroll 이동 & curTime 도 설정됨
				bottomScrollMoveTo(newTime / this.props.unitTime * this.props.unitBoxWidth);
      }
		});
	}

	musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + Math.floor(time % 60)}`;
	}

  render() {
		const { curTime, musicLength, pressPlayButton, isPlay, unitTime } = this.props;
		const styles = getStyleSheet();
		
		const thumbStyle = { left: Animated.add(playerTrackLength * curTime / (musicLength*1000), this.thumbLeft) };
		const trackLeftStyle = { width: Animated.add(playerTrackLength * curTime / (musicLength*1000), this.thumbLeft) };
		const trackRightStyle = { width: Animated.add(playerTrackLength * (musicLength*1000-curTime) / (musicLength*1000), Animated.multiply(-1, this.thumbLeft)) };
		this.thumbLeft.setValue(0);

		return (
			<View style={styles.playerBar}>
				{/* Play 버튼 */}
				<TouchableOpacity
				style={styles.playerBar__timeBox}
				disabled={false}
				onPress={pressPlayButton}>
					<IconIonicons name={isPlay ? "pause" : "play"} style={styles.playerBar__btn} />
				</TouchableOpacity>

				<View style={styles.playerBar__timeBox}>
					<Text style={styles.playerBar__time}>{this.musicLengthFormat(curTime/1000)}</Text>
				</View>

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