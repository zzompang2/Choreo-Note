import React from "react";
import { 
	View, TouchableOpacity, Text, Animated
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";

const TAG = "ToolBarForFormation/";

export default class ToolBarForFormation extends React.Component {
	constructor(props) {
		super(props);
		this.toolBarBottom = new Animated.Value(-60);
	}

	shouldComponentUpdate(nextProps) {
		if(nextProps.selectedPosTime == undefined)
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

		if((this.props.copiedFormationData == undefined) !== (nextProps.copiedFormationData == undefined))
		return true;
		return false;
	}

  render() {
		const {
			deleteFormation,
			copyFormation,
			pasteFormation,
			copiedFormationData,
		} = this.props;
		const styles = getStyleSheet();

		const toolBarBottomStyle = { bottom: this.toolBarBottom };

		return (
			<Animated.View style={[
				styles.toolBar,
				toolBarBottomStyle,
				{
					position: 'absolute',
					justifyContent: 'space-around',
					borderTopWidth: 5, borderLeftWidth: 5, borderEndWidth: 5,
					borderTopEndRadius: 20, borderTopLeftRadius: 20,
					borderColor: COLORS.yellow,
				}
			]}>
				<View />
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
				<View />
			</Animated.View>
    )
  }
}