import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import getStyleSheet from "../values/styles";
import TimeMarker from '../components/TimeMarker';
import FormationBox from './FormationBox';
import FormationMarker from "./FormationMarker";

const { width } = Dimensions.get('window');
const TAG = "Timeline/";

export default class Timeline extends React.Component {
	timeboxs = [];
	formationBoxs = [];

  render() {
		const { musicLength, dancers, times, positions, curTime, scrollEnable,
						setCurTime, setScrollEnable, selectedPosTime, selectFormationBox,
						changeFormationBoxLength } = this.props;
		const styles = getStyleSheet();

		this.timeboxs = [];
		this.formationBoxs = [];

		let timesIdx = 0;
		for(let sec=0; sec < musicLength; sec++) {
			this.timeboxs.push(
				<TouchableOpacity
				key={sec}
				style={styles.timebox}
				onPress={() => setCurTime(sec)}>
					<Text>{sec}</Text>
				</TouchableOpacity>
			);
			if(timesIdx < times.length && times[timesIdx].time == sec) {
				if(selectedPosTime == times[timesIdx].time)
					this.selectedPosDuration = times[timesIdx].duration;

				this.formationBoxs.push(
					<FormationBox
					key={timesIdx}
					time={times[timesIdx].time}
					duration={times[timesIdx].duration}
					isSelected={selectedPosTime == times[timesIdx].time}
					selectFormationBox={selectFormationBox} />
				);
				timesIdx++;
			}
		}

		return (
			<ScrollView
			horizontal={true}
			bounces={false} 					// 오버스크롤 막기 (iOS)
			decelerationRate={0.7}		// 스크롤 속도 (iOS)
			scrollEnabled={scrollEnable}>
				<View style={styles.timeline}>
					<View style={{flexDirection: 'row'}}>
						{this.timeboxs}
					</View>
					<View style={{flexDirection: 'row'}}>
						{this.formationBoxs}
						{selectedPosTime >= 0 ?
						<FormationMarker
						time={selectedPosTime}
						duration={this.selectedPosDuration}
						setScrollEnable={setScrollEnable}
						changeFormationBoxLength={changeFormationBoxLength}
						selectFormationBox={selectFormationBox} />
						: null}
					</View>
				
					<TimeMarker
					curTime={curTime}
					setCurTime={setCurTime}
					setScrollEnable={setScrollEnable} />
				</View>
			</ScrollView>
    )
  }
}