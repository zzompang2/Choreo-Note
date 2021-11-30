import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import Delete from '../assets/icons/X_large(48)/Delete';

const TAG = "NoteItem/";
const styles = getStyleSheet();

export default function NoteItem({ item, onPressHandler, isEditMode }) {
	return (
		<TouchableOpacity
		activeOpacity={.8}
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
			<Text numberOfLines={2} style={styles.noteSubInfo}>{item.music == '' ? '1분 정적' : item.music == '/' ? 'no music(60s silence)' : item.music}</Text>
			<Text numberOfLines={1} style={styles.noteSubInfo}>{item.createDate}</Text>

		</TouchableOpacity>
	)
}