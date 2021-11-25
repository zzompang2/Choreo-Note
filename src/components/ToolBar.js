import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import Pause from "../assets/icons/Pause";
import Play from "../assets/icons/Play";
import getStyleSheet, { COLORS } from "../values/styles";
import Coordinate from "../assets/icons/Large(32)/Coordinate";
import Snap from "../assets/icons/Large(32)/Snap";
import Rotate from "../assets/icons/Large(32)/Rotate";
import Dancer from "../assets/icons/Large(32)/Dancer";
import Setting from "../assets/icons/Large(32)/Setting";
import ToolBarForFormation from './ToolBarForFormation';
const TAG = "ToolBar/";
const styles = getStyleSheet();

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
	selectedPosTime,
	deleteFormation,
	copyFormation,
	pasteFormation,
	copiedFormationData,
}) {
	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />

	return (
		<View>
			{listViewItemSeparator()}
							
			<ToolBarForFormation
				selectedPosTime={selectedPosTime}
				deleteFormation={deleteFormation}
				copyFormation={copyFormation}
				pasteFormation={pasteFormation}
				copiedFormationData={copiedFormationData} />
			<View style={styles.toolBar}>

				{/* 격자 보기 */}
				<TouchableOpacity
				disabled={isPlay}
				style={styles.toolBar__tool}>
					<Coordinate color={!isPlay ? COLORS.container_30 : COLORS.container_20} />
					<Text style={{
					color: !isPlay ? COLORS.container_30 : COLORS.container_20,
					fontSize: 12,
					fontFamily: 'GmarketSansTTFMedium',
					marginTop: 8}}>격자 보기</Text>
				</TouchableOpacity>

				{/* 좌표축에 맞추기 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setAlignWithCoordinate}
				style={styles.toolBar__tool}>
					<Snap color={ !isPlay ? alignWithCoordinate ? COLORS.container_50 : COLORS.container_30 : COLORS.container_20 } />
					<Text style={{
					color: !isPlay ? alignWithCoordinate ? COLORS.container_50 : COLORS.container_30 : COLORS.container_20,
					fontSize: 12,
					fontFamily: 'GmarketSansTTFMedium',
					marginTop: 8}}>격자 맞추기</Text>
				</TouchableOpacity>

				{/* id / name 표시 */}
				{/* <TouchableOpacity
				onPress={changeDisplayType}
				style={styles.toolBar__tool}>
					<Text style={{color: displayName ? COLORS.container_white : COLORS.container_40}}>name</Text>
				</TouchableOpacity> */}

				{/* 무대 회전 */}
				<TouchableOpacity
				onPress={rotateStage}
				style={styles.toolBar__tool}>
					<Rotate color={!isPlay ? isRotate ? COLORS.container_50 : COLORS.container_30 : COLORS.container_20} />
					<Text style={{
					color: !isPlay ? isRotate ? COLORS.container_50 : COLORS.container_30 : COLORS.container_20,
					fontSize: 12,
					fontFamily: 'GmarketSansTTFMedium',
					marginTop: 8}}>무대 회전</Text>
				</TouchableOpacity>
				
				{/* Dancer 수정 */}
				<TouchableOpacity
				disabled={isPlay}
				onPress={setDancerScreen}
				style={styles.toolBar__tool}>
					<Dancer color={!isPlay ? COLORS.container_30 : COLORS.container_20} />
					<Text style={{
						color: !isPlay ? COLORS.container_30 : COLORS.container_20,
						fontSize: 12,
						fontFamily: 'GmarketSansTTFMedium',
						marginTop: 8}}>댄서</Text>
				</TouchableOpacity>

				{/* 설정 */}
				<TouchableOpacity
					style={styles.toolBar__tool}>
						<Setting color={!isPlay ? COLORS.container_30 : COLORS.container_20} />
						<Text style={{
						color: !isPlay ? COLORS.container_30 : COLORS.container_20,
						fontSize: 12,
						fontFamily: 'GmarketSansTTFMedium',
						marginTop: 8}}>설정</Text>
					</TouchableOpacity>
			</View>
		</View>
	)
}