import React from 'react';
import {
  SafeAreaView, Text, TouchableOpacity
} from 'react-native';

export default class FormationScreen extends React.Component {

	render() {
		return(
			<SafeAreaView>
				<Text>Formation</Text>
				<TouchableOpacity
				onPress={() => {
					this.props.navigation.goBack();
				}}>
					<Text>go back</Text>
				</TouchableOpacity>
			</SafeAreaView>
		)
	}
}