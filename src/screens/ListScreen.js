import React from 'react';
import {
  SafeAreaView, Text, TouchableOpacity
} from 'react-native';

export default class ListScreen extends React.Component {

	render() {
		return(
			<SafeAreaView>
				<Text>ListScreen</Text>
				<TouchableOpacity
				onPress={() => {
					this.props.navigation.navigate('Formation');
				}}>
					<Text>go to FormationScreen</Text>
				</TouchableOpacity>
			</SafeAreaView>
		)
	}
}