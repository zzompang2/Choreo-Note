import React from "react";
import { 
	View, TouchableOpacity, Text
} from "react-native";
import getStyleSheet from "../values/styles";

const TAG = "ToolBarForFormation/";

export default class ToolBarForFormation extends React.Component {
	copiedFormation = undefined;

  render() {
		const {
			deleteFormation,
			copyFormation,
			pasteFormation,
		} = this.props;
		const styles = getStyleSheet();

		const isCopy = false;

		return (
			<View style={styles.toolBar}>
				{/* Formation 삭제 */}
				<TouchableOpacity
				onPress={deleteFormation}>
					<Text style={styles.toolBar__tool}>delete</Text>
				</TouchableOpacity>

				{/* Formation 복사 */}
				<TouchableOpacity
				onPress={copyFormation}>
					<Text style={styles.toolBar__tool}>copy</Text>
				</TouchableOpacity>

				{/* Formation 붙여넣기 */}
				<TouchableOpacity
				onPress={pasteFormation}>
					<Text style={isCopy ? styles.toolBar__tool : styles.toolBar__toolDisabled}>paste</Text>
				</TouchableOpacity>
				
			</View>
    )
  }
}