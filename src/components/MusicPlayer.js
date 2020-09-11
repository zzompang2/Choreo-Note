import React from "react"
import { 
	View, TouchableOpacity, Image, Text, StyleSheet,
} from "react-native"
import Sound from 'react-native-sound';
// Enable playback in silence mode
Sound.setCategory('Playback');
import IconIonicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {COLORS} from '../values/Colors'
import { DebugInstructions } from "react-native/Libraries/NewAppScreen"
import { Alert } from "react-native";

const TAG = "MusicPlayer/";
const fps = 12;

export default class MusicPlayer extends React.Component{
	constructor(props){
    super(props);
    console.log(TAG, "constructor");
    this.state = {
			frame: 0,
		}
		this.isPlay = false;
		this.noteInfo = this.props.noteInfo;
		this.FRAME_LENGTH = this.noteInfo.musicLength*fps;
	}

	load = () => {
		console.log(TAG, 'load');

		if(this.sound)
			// Release the audio player resource
			this.sound.release();
		
		if(this.isPlay)
			this.pause();

		if(this.noteInfo.music == 'Sample.mp3'){
			this.fileName = 'Sample.mp3';
			this.filePath = Sound.MAIN_BUNDLE;
		}
		else{
			this.fileName = this.noteInfo.music;
			this.filePath = Sound.DOCUMENT;
		}

		this.sound = new Sound(this.fileName, this.filePath, (error) => {
			if (error) {
				console.log('failed to load the sound:', this.fileName);
				return;
			}
			// this.sound == TRUE
			// loaded successfully!
			this.sound.setCurrentTime(0);
			console.log('duration in seconds: ' + this.sound.getDuration(), 'number of channels: ' + this.sound.getNumberOfChannels());
			this.props.onPlaySubmit(0, false);
		});
	}

	// Play the sound with an onEnd callback
	play = () => {
		console.log(TAG, "play");

		// 음악이 load되지 않은 경우
		if(!this.sound.isLoaded()){
			Alert.alert('노래 로드 에러', '노래 파일을 로드할 수 없습니다. 노래를 다시 선택해 주세요.');
			return;
		}
		// 음악이 이미 플레이 중인 경우
		if(this.isPlay) 
			return;

		// state의 시간값과 맞추고 플레이
		this.sound.setCurrentTime(this.state.frame/fps);
		this.sound.play(this.playComplete);
		this.isPlay = true;
		this.forceUpdate();	// isPlay 가 바뀐 것을 인지하기 위해
		
		this.props.onPlaySubmit(this.state.frame, true);
		this.interval = setInterval(() => {
			this.sound.getCurrentTime((sec, isPlaying) => {
				this.props.onPlaySubmit(this.secToFrame(sec));
			});
		}, 
		1000/fps
		);
	}

	playComplete = (success) => {
    //console.log(this.TAG + "playComplete");
    if(this.sound){
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
			}
			this.sound.setCurrentTime(0);
			this.pause();
    }
  }
	
	pause = () => {
		console.log(TAG, "pause");
		clearInterval(this.interval);
	
		// music pause
		this.sound.pause();
		this.props.onPlaySubmit(this.state.frame, false);
		this.isPlay = false;
		this.forceUpdate();
	}

	jumpTo = (sec) => {
		console.log(TAG, 'jumpTo', sec);
		// onPlaySubmit 으로 부모에 frame 값을 보내면
		// props 로 변경된 frame을 받아 rerender 된다.

		let dest = this.state.frame + sec*fps;
		if(dest < 0) dest = 0;
		else if(dest > this.noteInfo.musicLength*fps) dest = this.noteInfo.musicLength*fps;

		this.props.onPlaySubmit(dest);
	}

	// Stop the sound and rewind to the beginning
	stop = () => {
		console.log(TAG, 'stop');
		this.sound.stop(() => {
			// Note: If you want to play a sound after stopping and rewinding it,
			// it is important to call play() in a callback.
			this.sound.play();
		});
	}
	
	/** 초(sec) => "분:초" 변환한다.
	 * - re-render: NO
	 * @param {number} sec 
	 * @returns {string} 'min:sec'
	 */
	secToTimeFormat = (sec) => 
	Math.floor(sec/60) + ':' +  
	(Math.floor(sec%60) < 10 ? '0' : '') +
	Math.floor(sec%60)
	
	frameToTimeFormat = (frame) =>
	Math.floor(frame/fps/60) + ':' +  
	(Math.floor(frame/fps%60) < 10 ? '0' : '') + Math.floor(frame/fps%60) + ':' +
	(Math.floor(frame%fps) < 10 ? '0' : '') + Math.floor(frame%fps)

	secToFrame = (sec) => {
		let frame = (sec-this.noteInfo.sync) * fps;
		if(frame < 0) frame = 0;
		else if(frame > this.FRAME_LENGTH) frame = this.FRAME_LENGTH;
		return Math.floor(frame);
	}

	frameToSec = (frame) => {
		let sec = Math.floor(frame/fps);
		if(sec < 0) sec = 0;
		else if(sec > this.noteInfo.musicLength) sec = this.noteInfo.musicLength;
		return sec;
	}
	
	
	componentDidMount(){
		console.log(TAG, "componentDidMount");
		this.load();
	}
	
	componentDidUpdate(){
		console.log(TAG, "componentDidUpdate");
		if(this.fileName != this.props.noteInfo.music){
			this.noteInfo = this.props.noteInfo;
			this.load();
			// this.props.onPlaySubmit(1, false);
		}
		if(this.state.frame != this.props.frame)
			this.setState({frame: this.props.frame});
	}

	componentWillUnmount(){
		this.pause();
	}

	shouldComponentUpdate(nextProps){
		console.log(TAG, 'shouldComponentUpdate');
		console.log(JSON.stringify(nextProps.noteInfo), JSON.stringify(this.props.noteInfo));
		console.log('frame 비교:', nextProps.frame, this.state.frame);
		return(
			JSON.stringify(nextProps.noteInfo)!==JSON.stringify(this.props.noteInfo) || 
			nextProps.frame != this.state.frame);
	}

  render(){
		console.log(TAG, "render");
		 
		const buttonColor = this.isPlay ? COLORS.grayMiddle : COLORS.blackDark;

    return (
			<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>

				<Text style={{flex: 1, width: 40, fontSize: 14, textAlign: 'center'}}>{this.frameToTimeFormat(this.state.frame)}</Text>

				<TouchableOpacity onPress={()=>this.jumpTo(-30)} 
				disabled={this.isPlay} style={{margin: 10}} activeOpacity={.7}>
					<MaterialCommunityIcons name='rewind-30' size={28} color={buttonColor}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={()=>this.jumpTo(-10)} 
				disabled={this.isPlay} style={{margin: 10}} activeOpacity={.7}>
					<MaterialCommunityIcons name='rewind-10' size={28} color={buttonColor}/>
				</TouchableOpacity>

				{ this.isPlay ? 
				<TouchableOpacity onPress={()=>{this.pause()}} style={{margin: 1}} activeOpacity={.9}>
					<IconIonicons name="pause-circle-outline" size={40}/>
				</TouchableOpacity>
				:
				<TouchableOpacity onPress={()=>{this.play()}} style={{margin: 1}} activeOpacity={.9}>
					<IconIonicons name="play-circle" size={40}/>
				</TouchableOpacity>
				}

				<TouchableOpacity onPress={()=>this.jumpTo(10)} 
				disabled={this.isPlay} style={{margin: 10}} activeOpacity={.7}>
					<MaterialCommunityIcons name='fast-forward-10' size={28} color={buttonColor}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={()=>this.jumpTo(30)} 
				disabled={this.isPlay} style={{margin: 10}} activeOpacity={.7}>
					<MaterialCommunityIcons name='fast-forward-30' size={28} color={buttonColor}/>
				</TouchableOpacity>

				<Text style={{flex: 1, width: 40, fontSize: 14, textAlign: 'center'}}>{this.secToTimeFormat(this.noteInfo.musicLength)}</Text>

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