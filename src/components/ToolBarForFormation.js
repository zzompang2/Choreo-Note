import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";

const TAG = "ToolBarForFormation/";

export default class ToolBarForFormation extends React.Component {
	copiedFormation = undefined;

  render() {
		const {
			deleteFormation,
			copyFormation,
			pasteFormation,
			copiedFormationData,
		} = this.props;
		const styles = getStyleSheet();

		const isCopy = false;

		return (
			<View style={[styles.toolBar, styles.stageSelected]}>
				{/* Formation 삭제 */}
				<TouchableOpacity
				onPress={deleteFormation}
				style={[styles.toolBar__toolDisabled, {width: 70}]}>
					<Text style={{color: COLORS.white}}>delete</Text>
				</TouchableOpacity>

				{/* Formation 복사 */}
				<TouchableOpacity
				onPress={copyFormation}
				style={[styles.toolBar__toolDisabled, {width: 70}]}>
					<Text style={{color: COLORS.white}}>copy</Text>
				</TouchableOpacity>

				{/* Formation 붙여넣기 */}
				<TouchableOpacity
				disabled={copiedFormationData == undefined}
				onPress={pasteFormation}
				style={[styles.toolBar__toolDisabled, {width: 70}]}>
					<Text style={{color: copiedFormationData != undefined ? COLORS.white : COLORS.blackMiddle}}>paste</Text>
				</TouchableOpacity>
				
			</View>
    )
  }
}