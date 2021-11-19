import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity, Animated, PanResponder
} from "react-native";
import getStyleSheet, { COLORS } from "../values/styles";
import IconIonicons from 'react-native-vector-icons/Ionicons';

const TAG = "NoteItem/";

export default class NoteItem extends React.Component {
	constructor(props) {
		super(props);

		this.btnScale = new Animated.Value(0);
	}

  render() {
		const { item, onPressHandler, deleteNote } = this.props;
		const { popDeleteButton, clearDeleteButton } = this;
		const styles = getStyleSheet();
		
		const btnStyle = { transform: [{ scale: this.btnScale }]};

		return (
			<TouchableOpacity
			onPress={() => onPressHandler(item.music, item.nid)}
			style={styles.noteEntry}>
				<View style={{flexDirection: 'row', flex: 1}}>
					<View style={styles.noteThumbnail}></View>
					<View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', flex: 1}}>
						<Text numberOfLines={2} style={styles.noteTitle}>{item.title}</Text>
						<Text numberOfLines={2} style={styles.noteSubInfo}>{item.music == '' ? '(choose music)' : item.music == '/' ? 'no music(60s silence)' : item.music}</Text>
						<Text numberOfLines={1} style={styles.noteSubInfo}>{item.createDate}</Text>
					</View>
				</View>
				{/* <Animated.View style={[btnStyle]}>
					<IconIonicons name="trash-sharp" size={40} color={'red'} />
				</Animated.View> */}
			</TouchableOpacity>
    )
  }
}