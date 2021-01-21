import React from "react";
import { 
	Dimensions, View, Animated
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "PlayerBar/";
const { width } = Dimensions.get('window');

export default class PlayerBar extends React.Component {
	constructor(props) {
		super(props);

		const { musicLength, setCurTime, bottomScrollMoveTo } = props;

		this.musicTimeString = this.musicLengthFormat(musicLength);

		this.thumbLeft = new Animated.Value(0);
	}

	musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + Math.floor(time % 60)}`;
	}

  render() {
		const { curTime, musicLength, unitTime } = this.props;
		const styles = getStyleSheet();
		
		const trackLeftStyle = { width: Animated.add(width * curTime / (musicLength*1000), this.thumbLeft) };
		this.thumbLeft.setValue(0);

		return (
			<View style={styles.playerBar__track}>
				<Animated.View style={[styles.playerBar__trackLeft, trackLeftStyle]} />
			</View>

    )
  }
}