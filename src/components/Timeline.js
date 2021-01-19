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

	constructor(props) {
		super(props);

		this.createTimeTextViews(props);
	}

	createTimeTextViews = (props) => {
		const { musicLength, unitBoxWidth } = props;

		this.timeboxs = [];

		for(let sec=0; sec < musicLength; sec++) {
			this.timeboxs.push(
				<View key={sec} style={{width: unitBoxWidth, alignItems: 'center'}}>
					<Text>{sec}</Text>
				</View>
			);
		}
	}

	shouldComponentUpdate(nextProps) {
		const { musicLength, unitBoxWidth } = this.props;

		if(musicLength != nextProps.musicLength ||
			unitBoxWidth != nextProps.unitBoxWidth)
			this.createTimeTextViews(nextProps);
		return true;
	}

  render() {
		const { musicLength, dancers, times, positions, curTime, scrollEnable,
						setCurTime, setScrollEnable, selectedPosTime, selectFormationBox,
						changeFormationBoxLength, isPlay, unitBoxWidth } = this.props;
		const styles = getStyleSheet();

		this.formationBoxs = [];

		let timesIdx = 0;
		for(let sec=0; sec < musicLength; sec++) {
			if(timesIdx < times.length && times[timesIdx].time == sec) {
				if(selectedPosTime == times[timesIdx].time)
					this.selectedPosDuration = times[timesIdx].duration;

				this.formationBoxs.push(
					<FormationBox
					key={timesIdx}
					time={times[timesIdx].time}
					duration={times[timesIdx].duration}
					isSelected={selectedPosTime == times[timesIdx].time}
					selectFormationBox={selectFormationBox}
					unitBoxWidth={unitBoxWidth} />
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

					<View style={[styles.timeboxContainer, {width: musicLength*unitBoxWidth}]}>
						{this.timeboxs}
					</View>
					<TouchableOpacity 
					style={[styles.timeboxContainer, {position: 'absolute', width: musicLength*unitBoxWidth, backgroundColor: 'none'}]}
					onPress={(event) => {
						const time = Math.floor(event.nativeEvent.locationX / unitBoxWidth);
						setCurTime(time);
						}} />

					<View style={{flexDirection: 'row'}}>
						{this.formationBoxs}
						{selectedPosTime >= 0 ?
						<FormationMarker
						time={selectedPosTime}
						duration={this.selectedPosDuration}
						setScrollEnable={setScrollEnable}
						changeFormationBoxLength={changeFormationBoxLength}
						selectFormationBox={selectFormationBox}
						unitBoxWidth={unitBoxWidth} />
						: null}
					</View>
				
					<TimeMarker
					curTime={curTime}
					setCurTime={setCurTime}
					setScrollEnable={setScrollEnable}
					isPlay={isPlay}
					unitBoxWidth={unitBoxWidth} />
				</View>
			</ScrollView>
    )
  }
}