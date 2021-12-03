import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS, getDancerColors } from "../values/styles";
import Delete from '../assets/icons/X_large(48)/Delete';

const TAG = "NoteItem/";
const styles = getStyleSheet();
const dancerColors = getDancerColors();

export default function NoteItem({ noteInfo, position, dancer, onPressHandler, isEditMode }) {
	return (
		<TouchableOpacity
		activeOpacity={.8}
		onPress={() => onPressHandler(noteInfo.nid)}
		style={styles.noteEntry}>
			<View style={styles.noteThumbnail}>
				<View style={{width: '100%', aspectRatio: 1, left: -10, top: -10}}>
					{position.map((pos, index) =>
						<View key={index} style={{position: 'absolute', left: ((550+pos.x)/11)+'%', top: ((550+pos.y)/11)+'%', width: 20, height: 20, borderRadius: 10, backgroundColor: dancerColors[dancer[index].color]}} />
					)}
				</View>
				{ isEditMode ?
				<View style={{position: 'absolute', width: '100%', height: '100%', borderRadius: 8, backgroundColor: COLORS.container_20_80, alignItems: 'center', justifyContent: 'center'}}>
					<Delete />
				</View>
				: null }
			</View>
			<Text numberOfLines={2} style={styles.noteTitle}>{noteInfo.title}</Text>
			<Text numberOfLines={2} style={styles.noteSubInfo}>{noteInfo.music == '' ? '1분 정적' : noteInfo.music == '/' ? 'no music(60s silence)' : noteInfo.music}</Text>
			<Text numberOfLines={1} style={styles.noteSubInfo}>{noteInfo.createDate}</Text>

		</TouchableOpacity>
	)
}