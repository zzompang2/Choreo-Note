import React, { useEffect, useRef } from "react";
import { 
	View, TouchableOpacity, Text, Animated
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";

const TAG = "ToolBarForFormation/";
const styles = getStyleSheet();

const useConstructor = (callBack = () => {}) => {
  const hasBeenCalled = useRef(false);
	console.log(TAG, 'myConstructor:', hasBeenCalled.current);
  if (hasBeenCalled.current) return;
  callBack();
  hasBeenCalled.current = true;
}

export default function ToolBarForFormation({
	deleteFormation,
	copyFormation,
	pasteFormation,
	copiedFormationData,
	selectedPosTime,
}) {
	useConstructor(() => {
		this.toolBarBottom = new Animated.Value(-60);
	})
	
	useEffect(() => {
		if(selectedPosTime == undefined)
		Animated.timing(
			this.toolBarBottom, {
				toValue: -60,
				duration: 200,
				useNativeDriver: false,
			}
		).start();
		else
		Animated.timing(
			this.toolBarBottom, {
				toValue: 0,
				duration: 300,
				useNativeDriver: false,
			}
		).start();
	}, [selectedPosTime]);
	
	return (
		<Animated.View style={[
			styles.toolBar,
			{
				position: 'absolute',
				bottom: this.toolBarBottom,
				justifyContent: 'space-around',
				borderTopWidth: 5, borderLeftWidth: 5, borderEndWidth: 5,
				borderTopEndRadius: 20, borderTopLeftRadius: 20,
				borderColor: COLORS.yellow,
				zIndex: 10,
			}
		]}>
			<View />
			{/* Formation 삭제 */}
			<TouchableOpacity
			onPress={deleteFormation}
			style={[styles.toolBar__toolDisabled, {width: 70}]}>
				<Text style={{color: COLORS.container_white}}>delete</Text>
			</TouchableOpacity>

			{/* Formation 복사 */}
			<TouchableOpacity
			onPress={copyFormation}
			style={[styles.toolBar__toolDisabled, {width: 70}]}>
				<Text style={{color: COLORS.container_white}}>copy</Text>
			</TouchableOpacity>

			{/* Formation 붙여넣기 */}
			<TouchableOpacity
			disabled={copiedFormationData == undefined}
			onPress={pasteFormation}
			style={[styles.toolBar__toolDisabled, {width: 70}]}>
				<Text style={{color: copiedFormationData != undefined ? COLORS.container_white : COLORS.container_40}}>paste</Text>
			</TouchableOpacity>
			<View />
		</Animated.View>
	)
}