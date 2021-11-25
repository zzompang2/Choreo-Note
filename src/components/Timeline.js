import React, { useRef, useState } from "react";
import { 
	Dimensions,
	View,
	Text,
	TouchableOpacity,
	Animated,
} from "react-native";
import { ScrollView, PinchGestureHandler, State } from "react-native-gesture-handler";
import Add from "../assets/icons/Medium(24)/Add";
import getStyleSheet, { COLORS } from "../values/styles";
import FormationBox from './FormationBox';
import FormationMarker from "./FormationMarker";

const { width } = Dimensions.get('window');
const TAG = "Timeline/";
const styles = getStyleSheet();

export default function Timeline({
	musicLength, times, curTime,
	setCurTime, selectedPosTime, selectFormationBox,
	changeFormationBoxLength, isPlay, unitBoxWidth, unitTime,
	setTimelineScroll, onTimelineScroll,
	addFormation, formationAddable,
	toastOpacity, toastMessage, changeUnitBoxWidth
}) {
	const [scrollEnable, setScrollEnable] = useState(true);

	createTimeTextViews = () => {
		this.timebox_mark = [];
		const boxPerSec = 1000/unitTime;

		this.timebox_mark.push(<View key={-1} style={{width: width/2}} />);

		for(let i=0; i < musicLength * boxPerSec-1; i++) {
			this.timebox_mark.push(
				<View key={i} style={{height: 6, width: unitBoxWidth, alignItems: 'flex-start', justifyContent: 'flex-end'}}>
					<View style={{width: 1, height: i % boxPerSec == 0 ? 6 : 2, borderRadius: 1, backgroundColor: COLORS.container_30}} />
				</View>
			)
		}
		this.timebox_mark.push(<View key={-2} style={{width: width/2}} />);
	}

	mySetScrollEnable = (isEnable) => setScrollEnable(isEnable)

	// function musicLengthFormat(millisecond) {
	// 	const second = millisecond / 1000;
	// 	return `${Math.floor(second / 60)}:` +
	// 				`${(second % 60 < 10 ? '0' : '') + Math.floor(second % 60)}.` +
	// 				`${(millisecond % 1000 == 0 ? '00' : '') + millisecond % 1000}`;
	// }

	// useEffect(() => {
	// 	createTimeTextViews();
	// }, [musicLength, unitBoxWidth, unitTime]);

	_changeUnitBoxWidth = (scale) => {
		const newWidth = this.baseUnitBoxWidth * scale;
		changeUnitBoxWidth(newWidth);
	}

	_onPinchHandlerStateChange = (event) => {
		if (event.nativeEvent.oldState === State.BEGAN) {
			this.baseUnitBoxWidth = unitBoxWidth;
			this.setState({ scrollEnable: false });
		}
		else if (event.nativeEvent.oldState === State.ACTIVE)
		this.setState({ scrollEnable: true });
  };

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
	const toastOpacityStyle = { opacity: toastOpacity };

	createTimeTextViews();

	return (
		<View style={[styles.bg, {alignItems: 'center'}]}>
			<PinchGestureHandler
				onGestureEvent={event => this._changeUnitBoxWidth(event.nativeEvent.scale)}
				onHandlerStateChange={this._onPinchHandlerStateChange}>

				<ScrollView
				style={{flex: 1}}
				horizontal={true}
				bounces={false} 					// 오버스크롤 막기 (iOS)
				decelerationRate={0}			// 스크롤 속도 (iOS)
				scrollEnabled={scrollEnable}
				scrollEventThrottle={16}
				showsHorizontalScrollIndicator={false}	// 스크롤 바 숨기기
				ref={ref => setTimelineScroll(ref)}
				onScroll={event => onTimelineScroll(event)}>
					<TouchableOpacity
					activeOpacity={1}
					style={styles.timeline}
					onPress={() => selectFormationBox(undefined)}>
						<View style={[styles.timeboxContainer, {width: scrollWidth}]}>
							{this.timebox_mark}
						</View>

						<View style={{flexDirection: 'row'}}>

							{this.formationBoxs}

							{selectedPosTime >= 0 ?
							<FormationMarker
							time={selectedPosTime}
							duration={this.selectedPosDuration}
							changeFormationBoxLength={changeFormationBoxLength}
							selectFormationBox={selectFormationBox}
							unitBoxWidth={unitBoxWidth}
							unitTime={unitTime}
							setScrollEnable={mySetScrollEnable} />
							: null}
						</View>
					</TouchableOpacity>
				</ScrollView>
			</PinchGestureHandler>

			{/* Time Marker */}
			<View
			pointerEvents='none'	// 터치되지 않도록
			style={styles.timeMarkerContainer}>
				<View style={styles.timeMarkerLine} />
			</View>

			{!formationAddable || isPlay ? null :
			<TouchableOpacity
			onPress={addFormation}
			style={styles.addFormationBtn}
			>
				<Add />
			</TouchableOpacity>
			}

			<Animated.View style={[toastOpacityStyle, {
				position: 'absolute', bottom: 8,
				height: 30, backgroundColor: COLORS.container_black,
				alignItems: 'center', justifyContent: 'center',
				paddingHorizontal: 15,
				borderRadius: 15
			}]}>
				<Text style={{color: COLORS.container_white}}>{toastMessage}</Text>
			</Animated.View>
		</View>
	)
}