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
		this.toolBarHeight = new Animated.Value(0);
	})
	
	useEffect(() => {
		if(selectedPosTime == undefined)
		Animated.timing(
			this.toolBarHeight, {
				toValue: 0,
				duration: 200,
				useNativeDriver: false,
			}
		).start();
		else
		Animated.timing(
			this.toolBarHeight, {
				toValue: 40,
				duration: 300,
				useNativeDriver: false,
			}
		).start();
	}, [selectedPosTime]);
	
	return (
		<Animated.View style={{
			flexDirection: 'row',
				height: this.toolBarHeight,
				// position: 'absolute',
				// bottom: this.toolBarHeight,
				alignItems: 'flex-start',
				justifyContent: 'center',
				// zIndex: 10,
			}}>
			<View />

			{/* Formation 복사 */}
			<TouchableOpacity
			onPress={copyFormation}
			style={{height: 40, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'}}>
				<Text style={{color: COLORS.container_30, fontSize: 14,
			fontFamily: 'GmarketSansTTFMedium'}}>복사하기</Text>
			</TouchableOpacity>

			{/* Formation 붙여넣기 */}
			<TouchableOpacity
			disabled={copiedFormationData == undefined}
			onPress={pasteFormation}
			style={{height: 40, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'}}>
				<Text style={{color: copiedFormationData != undefined ? COLORS.container_30 : COLORS.container_20, fontSize: 14,
			fontFamily: 'GmarketSansTTFMedium'}}>붙여넣기</Text>
			</TouchableOpacity>

			{/* Formation 삭제 */}
			<TouchableOpacity
			onPress={deleteFormation}
			style={{height: 40, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'}}>
				<Text style={{color: COLORS.container_30, fontSize: 14,
			fontFamily: 'GmarketSansTTFMedium'}}>삭제</Text>
			</TouchableOpacity>

			<View />
		</Animated.View>
	)
}