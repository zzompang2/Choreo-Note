import React, { useRef } from "react";
import { 
	Dimensions, View, Animated
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PlayerBar/";
const { width } = Dimensions.get('window');
const styles = getStyleSheet();

const useConstructor = (callBack = () => {}) => {
  const hasBeenCalled = useRef(false);
	console.log(TAG, 'myConstructor:', hasBeenCalled.current);
  if (hasBeenCalled.current) return;
  callBack();
  hasBeenCalled.current = true;
}

export default function PlayerBar({ curTime, musicLength }) {
	useConstructor(() => {
		this.musicTimeString = musicLengthFormat(musicLength);
		this.thumbLeft = new Animated.Value(0);
	});

	function musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + Math.floor(time % 60)}`;
	}

	const trackLeftStyle = { width: Animated.add(width * curTime / (musicLength*1000), this.thumbLeft) };
	this.thumbLeft.setValue(0);

	return (
		<View style={styles.playerBar__track}>
			<Animated.View style={[styles.playerBar__trackLeft, trackLeftStyle]} />
		</View>
	)
}