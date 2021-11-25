import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import Pause from "../assets/icons/Pause";
import Play from "../assets/icons/Play";
import getStyleSheet, { COLORS } from "../values/styles";

const TAG = "ToolBar/";

export default function ToolBar({
	setDancerScreen,
	isPlay,
	alignWithCoordinate,
	setAlignWithCoordinate,
	pressPlayButton,
	changeDisplayType,
	displayName,
	rotateStage,
	isRotate,
}) {
	const styles = getStyleSheet();

	return (
		<View style={styles.toolBar}>
			<View style={{flexDirection: 'row', margin: 10}}>
				{/* Dancer 수정 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setDancerScreen}
				style={[styles.toolBar__toolDisabled, {width: 90}]}>
					<Text style={{color: !isPlay ? COLORS.container_white : COLORS.container_40}}>dancers</Text>
				</TouchableOpacity>
				<View style={{width: 40}} />
			</View>

			{/* Play 버튼 */}
			<TouchableOpacity
			disabled={false}
			onPress={pressPlayButton}>
				{/* <IconIonicons name={isPlay ? "pause" : "play"} style={styles.playerBar__btn} /> */}
				{isPlay ? <Pause /> : <Play /> }
			</TouchableOpacity>

			<View style={{flexDirection: 'row', width: 130, margin: 10, justifyContent: 'space-between'}}>
				{/* 좌표축에 맞추기 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setAlignWithCoordinate}
				style={alignWithCoordinate ? styles.toolBar__tool : styles.toolBar__toolDisabled}>
					<Text style={{color: alignWithCoordinate ? COLORS.container_white : COLORS.container_40}}>align</Text>
				</TouchableOpacity>
				{/* id / name 표시 */}
				<TouchableOpacity
				onPress={changeDisplayType}
				style={displayName ? styles.toolBar__tool : styles.toolBar__toolDisabled}>
					<Text style={{color: displayName ? COLORS.container_white : COLORS.container_40}}>name</Text>
				</TouchableOpacity>
				{/*  */}
				<TouchableOpacity
				onPress={rotateStage}
				style={isRotate ? styles.toolBar__tool : styles.toolBar__toolDisabled}>
					<Text style={{color: isRotate ? COLORS.container_white : COLORS.container_40}}>rotate</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}