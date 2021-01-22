import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import getStyleSheet from "../values/styles";
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

				<TouchableOpacity
				style={styles.playerBar__timeBox}
				disabled={false}
				onPress={pressPlayButton}>
					<IconIonicons name={isPlay ? "pause" : "play"} style={styles.playerBar__btn} />
				</TouchableOpacity>
				{/* Dancer 수정 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setDancerScreen}>
					<Text style={!isPlay ? styles.toolBar__tool : styles.toolBar__toolDisabled}>dancers</Text>
				</TouchableOpacity>
				{/* 좌표축에 맞추기 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setAlignWithCoordinate}>
					<Text style={alignWithCoordinate ? styles.toolBar__tool : styles.toolBar__toolDisabled}>align</Text>
				</TouchableOpacity>
				{/* id / name 표시 */}
				<TouchableOpacity
				onPress={changeDisplayType}>
					<Text style={displayName ? styles.toolBar__tool : styles.toolBar__toolDisabled}>name</Text>
				</TouchableOpacity>
			</View>
    )
  }
}