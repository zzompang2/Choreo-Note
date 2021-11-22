import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import Delete from '../assets/icons/X_large(48)/Delete';

const TAG = "NoteItem/";

export default class NoteItem extends React.Component {
	constructor(props) {
		super(props);

		this.btnScale = new Animated.Value(0);
	}

  render() {
		const { item, onPressHandler, isEditMode } = this.props;
		const { popDeleteButton, clearDeleteButton } = this;
		const styles = getStyleSheet();
		
		const btnStyle = { transform: [{ scale: this.btnScale }]};

		return (
			<TouchableOpacity
			onPress={() => onPressHandler(item.music, item.nid)}
			style={styles.noteEntry}>
				<View style={styles.noteThumbnail}>
					{ isEditMode ?
					<View style={{width: '100%', height: '100%', borderRadius: 8, backgroundColor: COLORS.container_20_80, alignItems: 'center', justifyContent: 'center'}}>
						<Delete />
					</View>
					: null }
				</View>
				<Text numberOfLines={2} style={styles.noteTitle}>{item.title}</Text>
				<Text numberOfLines={2} style={styles.noteSubInfo}>{item.music == '' ? '(choose music)' : item.music == '/' ? 'no music(60s silence)' : item.music}</Text>
				<Text numberOfLines={1} style={styles.noteSubInfo}>{item.createDate}</Text>
				{/* <Animated.View style={[btnStyle]}>
					<IconIonicons name="trash-sharp" size={40} color={'red'} />
				</Animated.View> */}
			</TouchableOpacity>
    )
  }
}