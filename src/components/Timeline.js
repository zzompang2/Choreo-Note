import React from "react";
import { 
	Dimensions, View, Text
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import getStyleSheet, { COLORS } from "../values/styles";
import FormationBox from './FormationBox';
import FormationMarker from "./FormationMarker";

const { width } = Dimensions.get('window');
const TAG = "Timeline/";

export default class Timeline extends React.Component {
	constructor(props) {
		super(props);

		this.createTimeTextViews(props);
	}

	createTimeTextViews = (props) => {
		const { musicLength, unitBoxWidth, unitTime } = props;

		this.timebox_text = [];
		this.timebox_mark = [];
		const boxPerSec = 1000/unitTime;

		this.timebox_text.push(<View key={-1} style={{height: '100%', width: width/2}} />);
		this.timebox_mark.push(<View key={-1} style={{height: '100%', width: width/2}} />);

		for(let i=0; i < musicLength * boxPerSec-1; i++) {
			if(i % boxPerSec == 0)
			this.timebox_text.push(
				<View key={i} style={{height: '100%', width: unitBoxWidth * boxPerSec, left: -(unitBoxWidth * boxPerSec)/2, alignItems: 'center', flexDirection: 'column',  justifyContent: 'center'}}>
					<Text style={{fontSize: 10}}>{this.musicLengthFormat(i/boxPerSec)}</Text>
				</View>
			);
			
			this.timebox_mark.push(
				<View key={i} style={{height: '100%', width: unitBoxWidth, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end'}}>
					<View style={{width: 1, height: i % boxPerSec == 0 ? 7 : 3, backgroundColor: COLORS.grayDark}} />
				</View>
			)
		}
		this.timebox_text.push(<View key={-2} style={{height: '100%', width: width/2}} />);
		this.timebox_mark.push(<View key={-2} style={{height: '100%', width: width/2}} />);
	}

	musicLengthFormat(time) {
		return `${Math.floor(time / 60)}:${(time % 60 < 10 ? '0' : '') + Math.floor(time % 60)}`;
	}

	scrollTimeline = (event) => {
		const { setCurTime, unitBoxWidth, unitTime } = this.props;

		const scrollX = event.nativeEvent.contentOffset.x;
		this.timelineScroll.scrollTo({x: scrollX, animated: false});
		
		const centerTime = scrollX / unitBoxWidth * unitTime;
		
		console.log(centerTime);
		setCurTime(centerTime);
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
		const { scrollTimeline } = this;
		const styles = getStyleSheet();
		const boxPerSec = 1000 / unitTime;

		this.formationBoxs = [];

		times.forEach((time, idx) => {
			// formationMarker 의 길이를 위해...
			if(selectedPosTime == time.time)
					this.selectedPosDuration = time.duration;

			this.formationBoxs.push(
				<FormationBox
				key={idx}
				time={time.time}
				duration={time.duration}
				isSelected={selectedPosTime == time.time}
				selectFormationBox={selectFormationBox}
				unitBoxWidth={unitBoxWidth}
				unitTime={unitTime} />
			);
		})

		const scrollWidth = width+(musicLength*boxPerSec-1)*unitBoxWidth;

		return (
			<View style={{flex: 1}}>
			<ScrollView
			horizontal={true}
			bounces={false} 					// 오버스크롤 막기 (iOS)
			decelerationRate={0}		// 스크롤 속도 (iOS)
			scrollEnabled={false}
			scrollEventThrottle={16}
			ref={ref => this.timelineScroll = ref}>
				<View style={styles.timeline}>

					<View style={[styles.timeboxContainer, {width: scrollWidth, backgroundColor: COLORS.grayMiddle}]}>
						{this.timebox_text}
					</View>
					<View style={[styles.timeboxContainer, {position: 'absolute', width: scrollWidth}]}>
						{this.timebox_mark}
					</View>

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
				</View>
				<View style={styles.timeline__scrollPadding} />
			</ScrollView>

			<ScrollView
			horizontal={true}
			bounces={false} 					// 오버스크롤 막기 (iOS)
			decelerationRate={0.7}		// 스크롤 속도 (iOS)
			scrollEventThrottle={16}
			ref={ref => this.bottomScroll = ref}
			onScroll={event => scrollTimeline(event)}>
				<View style={{width: scrollWidth}} />
			</ScrollView>

			{/* Time Marker */}
			<View
			pointerEvents='none'	// 터치되지 않도록
			style={styles.timeMarkerContainer}>
				<View style={styles.timeMarker} />
				<View style={styles.timeMarkerLine} />
			</View>

			</View>
    )
  }
}