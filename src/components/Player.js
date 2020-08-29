import React from "react"
import { 
	View, TouchableOpacity, Image, Text, StyleSheet,
} from "react-native"
import Sound from 'react-native-sound'
import Slider from '@react-native-community/slider'

import {COLORS} from '../values/Colors'
import { DebugInstructions } from "react-native/Libraries/NewAppScreen"

const TAG = "Player/";

export default class Player extends React.Component{
	constructor(props){
    super(props);
    console.log(TAG, "constructor");
    this.state = {
			time: 0,
			musicLength: this.props.musicLength,
    }
    //this.music = this.props.musicTitle;
    this.sliderEditing = false;
	}

	load = () => {
		console.log(TAG, "load:");
		// If the audio is a 'require' then the second parameter must be the callback.
		this.sound = new Sound(require('../../Be Be Your Love.mp3'), (error) => {
			if (error) {
				// console.log('failed to load the sound', error);
				console.log('failed to load the sound');
				return;
			}
			// loaded successfully
			console.log('duration in seconds: ' + this.sound.getDuration() + 'number of channels: ' + this.sound.getNumberOfChannels());
		
			// Play the sound with an onEnd callback
			this.sound.play((success) => {
				if (success) {
					console.log('successfully finished playing');
				} else {
					console.log('playback failed due to audio decoding errors');
				}
			});
		});
	}
	
	componentDidMount(){
		console.log(TAG, "componentDidMount");
		this.load();
	}
	
	componentDidUpdate(){
		console.log(TAG, "componentDidUpdate");
		//this.setState({time: this.props.time})
	}

  render(){
    console.log(TAG, "render");

    return (
			<View style={{flexDirection: 'row', height: 30, alignItems: 'center',}}>
				<TouchableOpacity
				onPress={()=>{this.setState({isPlay: !this.state.isPlay})}}>
					{ this.state.isPlay ? 
					<Image source={require('../../assets/drawable/btn_pause.png')} style={styles.button}/> :
					<Image source={require('../../assets/drawable/btn_play.png')} style={styles.button}/>
					}
				</TouchableOpacity>
				<Text style={{width: 40, fontSize: 14, textAlign: 'left'}}>{Math.round(this.state.time/60)}:{Math.round(this.state.time%60) < 10 ? '0'+Math.round(this.state.time%60) : Math.round(this.state.time%60)}</Text>
				<Slider
				value={this.state.time}
				// onValueChange={value => {
				// 	console.log(TAG, "onValueChange:", value);
				// 	if(this.state.time != Math.round(value)){
				// 		this.setState({ time: Math.round(value) });
				// 	}
				// }}
				
				onSlidingComplete={(value)=>{
					console.log(TAG, "onSlidingComplete:", value);
					this.setState({ time: Math.round(value) });
					//this.props.setTimeState(Math.round(value));
				}}
				maximumValue={this.state.musicLength}
				style={{flex: 1}}
				/>
				<Text style={{width: 40, fontSize: 14, textAlign: 'right'}}>{Math.round(this.state.musicLength/60)}:{Math.round(this.state.musicLength%60)<10 ? '0'+Math.round(this.state.musicLength%60) : Math.round(this.state.musicLength%60)}</Text>
			</View>
    )
  }
}

const styles = StyleSheet.create({
	button: {
    width: 30,
    height: 30,
    marginTop: 10,
    marginRight: 10,
	},
});