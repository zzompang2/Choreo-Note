import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';


const TAG = "ToolBar/";

export default class ToolBar extends React.Component {

  render() {
		const {
			setDancerScreen,
			isPlay,
			alignWithCoordinate,
			setAlignWithCoordinate,
			pressPlayButton,
			changeDisplayType,
			displayName,
		} = this.props;
		const styles = getStyleSheet();

		return (
			<View style={styles.toolBar}>
				<View style={{flexDirection: 'row', margin: 10}}>
					{/* Dancer 수정 */}
					<TouchableOpacity
					disabled={isPlay}
					onPress={setDancerScreen}
					style={[styles.toolBar__toolDisabled, {width: 90}]}>
						<Text style={{color: !isPlay ? COLORS.white : COLORS.blackMiddle}}>dancers</Text>
					</TouchableOpacity>
				</View>

				{/* Play 버튼 */}
				<TouchableOpacity
				disabled={false}
				onPress={pressPlayButton}>
					<IconIonicons name={isPlay ? "pause" : "play"} style={styles.playerBar__btn} />
				</TouchableOpacity>

				<View style={{flexDirection: 'row', width: 90, margin: 10, justifyContent: 'space-between'}}>
					{/* 좌표축에 맞추기 */}
					<TouchableOpacity
					disabled={isPlay}
					onPress={setAlignWithCoordinate}
					style={alignWithCoordinate ? styles.toolBar__tool : styles.toolBar__toolDisabled}>
						<Text style={{color: alignWithCoordinate ? COLORS.white : COLORS.blackMiddle}}>align</Text>
					</TouchableOpacity>
					{/* id / name 표시 */}
					<TouchableOpacity
					onPress={changeDisplayType}
					style={displayName ? styles.toolBar__tool : styles.toolBar__toolDisabled}>
						<Text style={{color: displayName ? COLORS.white : COLORS.blackMiddle}}>name</Text>
					</TouchableOpacity>
				</View>
			</View>
    )
  }
}