import React from "react";
import { 
	Dimensions, View, Text, TouchableOpacity
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import getStyleSheet, { COLORS } from "../values/styles";
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
		const { musicLength, unitBoxWidth, unitTime } = props;

		this.timeboxs = [];
		const boxPerSec = 1000/unitTime;

		for(let i=0; i < musicLength * boxPerSec; i++) {
			this.timeboxs.push(
				<View key={i} style={{height: '100%', width: unitBoxWidth, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
					<View />
					<Text numberOfLines={1} style={{fontSize: 10}}>{i%boxPerSec == 0 ? i / boxPerSec : ''}</Text>
					<View style={{width: 1, height: 4, backgroundColor: COLORS.grayDark}} />
				</View>
			);
		}
	}

	shouldComponentUpdate(nextProps) {
		const { musicLength, unitBoxWidth, unitTime } = this.props;

		if(musicLength != nextProps.musicLength ||
			unitBoxWidth != nextProps.unitBoxWidth ||
			unitTime != nextProps.unitTime)
			this.createTimeTextViews(nextProps);
		return true;
	}

  render() {
		const { musicLength, dancers, times, positions, curTime, scrollEnable,
						setCurTime, setScrollEnable, selectedPosTime, selectFormationBox,
						changeFormationBoxLength, isPlay, unitBoxWidth, unitTime } = this.props;
		const styles = getStyleSheet();
		const boxPerSec = 1000 / unitTime;

		this.formationBoxs = [];

		// let timesIdx = 0;
		// for(let sec=0; sec < musicLength; sec++) {
		// 	if(timesIdx < times.length && times[timesIdx].time == sec) {
		// 		if(selectedPosTime == times[timesIdx].time)
		// 			this.selectedPosDuration = times[timesIdx].duration;

		// 		this.formationBoxs.push(
		// 			<FormationBox
		// 			key={timesIdx}
		// 			time={times[timesIdx].time}
		// 			duration={times[timesIdx].duration}
		// 			isSelected={selectedPosTime == times[timesIdx].time}
		// 			selectFormationBox={selectFormationBox}
		// 			unitBoxWidth={unitBoxWidth}
		// 			unitTime={unitTime} />
		// 		);
		// 		timesIdx++;
		// 	}
		// }

		times.forEach((time, idx) => {
			// formationMarker 의 길이를 위해...
			if(selectedPosTime == times[idx].time)
					this.selectedPosDuration = times[idx].duration;

			this.formationBoxs.push(
				<FormationBox
				key={idx}
				time={times[idx].time}
				duration={times[idx].duration}
				isSelected={selectedPosTime == times[idx].time}
				selectFormationBox={selectFormationBox}
				unitBoxWidth={unitBoxWidth}
				unitTime={unitTime} />
			);
		})

		return (
			<ScrollView
			horizontal={true}
			bounces={false} 					// 오버스크롤 막기 (iOS)
			decelerationRate={0.7}		// 스크롤 속도 (iOS)
			scrollEnabled={scrollEnable}>
				<View style={styles.timeline}>

					<View style={[styles.timeboxContainer, {width: musicLength*boxPerSec*unitBoxWidth}]}>
						{this.timeboxs}
					</View>
					<TouchableOpacity 
					style={[styles.timeboxContainer, {position: 'absolute', width: musicLength*boxPerSec*unitBoxWidth, backgroundColor: 'none'}]}
					onPress={(event) => {
						const time = Math.floor(event.nativeEvent.locationX / unitBoxWidth) * unitTime;
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
						unitBoxWidth={unitBoxWidth}
						unitTime={unitTime} />
						: null}

					</View>
				
					<TimeMarker
					curTime={curTime}
					setCurTime={setCurTime}
					setScrollEnable={setScrollEnable}
					isPlay={isPlay}
					unitBoxWidth={unitBoxWidth}
					unitTime={unitTime} />
				</View>
			</ScrollView>
    )
  }
}