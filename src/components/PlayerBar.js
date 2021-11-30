import React, { useRef } from "react";
import { 
	Dimensions, View, Animated, Text, TouchableOpacity
} from "react-native";
import Add from "../assets/icons/Large(32)/Add";
import Pause from "../assets/icons/Large(32)/Pause";
import Play from "../assets/icons/Large(32)/Play";
import getStyleSheet, { COLORS } from "../values/styles";

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

export default function PlayerBar({ curTime, musicLength, pressPlayButton, isPlay, addFormation }) {
	useConstructor(() => {
		this.musicTimeString = musicLengthFormat(musicLength);
		this.thumbLeft = new Animated.Value(0);
	});

	function musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + Math.floor(time % 60)}`;
	}

	function curTimeFormat(millisecond) {
		const second = millisecond / 1000;
		return (
			<Text style={{color: COLORS.container_white, flex: 1, fontSize: 14, fontFamily: 'GmarketSansTTFMedium'}}>
				{Math.floor(second / 60)}:{(second % 60 < 10 ? '0' : '') + Math.floor(second % 60)}.
				<Text style={{fontSize: 12}}>
					{(millisecond % 1000 == 0 ? '00' : '') + millisecond % 1000}
				</Text>
			</Text>
		);
	}

	const trackLeftStyle = { width: Animated.add(width * curTime / (musicLength*1000), this.thumbLeft) };
	this.thumbLeft.setValue(0);

	return (
		<View style={{flexDirection: 'column', height: 50, backgroundColor: COLORS.container_10}}>
			<View style={styles.playerBar__track}>
				<Animated.View style={[styles.playerBar__trackLeft, trackLeftStyle]} />
			</View>
			<View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12}}>
			{curTimeFormat(curTime)}
				<View style={{width: 32}} />
				<TouchableOpacity
				activeOpacity={.8}
				style={{marginHorizontal: 8}}
				disabled={isPlay}
				onPress={addFormation}>
					<Add />
				</TouchableOpacity>
				<TouchableOpacity
				activeOpacity={.8}
				disabled={false}
				onPress={pressPlayButton}>
					{ isPlay ? <Pause /> : <Play /> }
				</TouchableOpacity>
				<Text style={{color: COLORS.container_40, flex: 1, textAlign: 'right', fontSize: 14, fontFamily: 'GmarketSansTTFMedium'}}>{this.musicTimeString}</Text>
			</View>
		</View>
	)
}