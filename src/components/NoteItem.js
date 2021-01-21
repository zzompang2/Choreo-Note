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

	popDeleteButton = () => {
		Animated.timing(
			this.btnScale, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true
			}
		).start();
	}

	clearDeleteButton = () => {
		Animated.timing(
			this.btnScale, {
				toValue: 0,
				duration: 1,
				useNativeDriver: true
			}
		).start();
	}

  render() {
		const { item, onPressHandler, deleteNote } = this.props;
		const { popDeleteButton, clearDeleteButton } = this;
		const styles = getStyleSheet();
		
		const btnStyle = { transform: [{ scale: this.btnScale }]};

		return (
			<TouchableOpacity
			onPress={() => onPressHandler(item.music, item.nid)}
			onLongPress={() => deleteNote(item.nid)}
			delayLongPress={1000}
			onPressIn={popDeleteButton}
			onPressOut={clearDeleteButton}
			style={styles.noteEntry}>
				<View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
					<Text numberOfLines={1} style={styles.noteTitle}>{item.title}</Text>
					<View flexDirection='row'>
						<IconIonicons name="calendar" style={styles.noteSubInfo} />
						<Text numberOfLines={1} style={styles.noteSubInfo}>Modified {item.editDate}</Text>
						<IconIonicons name="musical-notes" style={styles.noteSubInfo} />
						<Text numberOfLines={1} style={styles.noteSubInfo}>{item.music == '/' ? 'no music(60s silence)' : item.music}</Text>
					</View>
				</View>
				<Animated.View style={[btnStyle]}>
					<IconIonicons name="trash-sharp" size={40} color={'red'} />
				</Animated.View>
			</TouchableOpacity>
    )
  }
}