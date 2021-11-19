import React from "react";
import { 
	Dimensions,
	View,
	Text,
	TouchableOpacity,
	Animated,
} from "react-native";
import { ScrollView, PinchGestureHandler, State } from "react-native-gesture-handler";
import getStyleSheet, { COLORS } from "../values/styles";
import FormationBox from './FormationBox';
import FormationMarker from "./FormationMarker";

const { width } = Dimensions.get('window');
const TAG = "Timeline/";

export default class Timeline extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			scrollEnable: true,
		}

		this.createTimeTextViews(props);
	}

	createTimeTextViews = (props) => {
		const { musicLength, unitBoxWidth, unitTime } = props;

		this.timebox_mark = [];
		const boxPerSec = 1000/unitTime;

		this.timebox_mark.push(<View key={-1} style={{height: '100%', width: width/2}} />);

		for(let i=0; i < musicLength * boxPerSec-1; i++) {
			this.timebox_mark.push(
				<View key={i} style={{height: '100%', width: unitBoxWidth, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end'}}>
					<View style={{width: 1, height: i % boxPerSec == 0 ? 6 : 2, backgroundColor: COLORS.container_white}} />
				</View>
			)
		}
		this.timebox_mark.push(<View key={-2} style={{height: '100%', width: width/2}} />);
	}

	setScrollEnable = (isEnable) => this.setState({ scrollEnable: isEnable })

	musicLengthFormat(millisecond) {
		const second = millisecond / 1000;
		return `${Math.floor(second / 60)}:` +
					`${(second % 60 < 10 ? '0' : '') + Math.floor(second % 60)}.` +
					`${(millisecond % 1000 == 0 ? '00' : '') + millisecond % 1000}`;
	}

	shouldComponentUpdate(nextProps) {
		const { musicLength, unitBoxWidth, unitTime } = this.props;

		if(musicLength != nextProps.musicLength ||
			unitBoxWidth != nextProps.unitBoxWidth ||
			unitTime != nextProps.unitTime)
			this.createTimeTextViews(nextProps);
		return true;
	}

	_changeUnitBoxWidth = (scale) => {
		const { changeUnitBoxWidth } = this.props;
		const newWidth = this.baseUnitBoxWidth * scale;
		changeUnitBoxWidth(newWidth);
	}

	_onPinchHandlerStateChange = (event) => {
		const { unitBoxWidth } = this.props;

		if (event.nativeEvent.oldState === State.BEGAN) {
			this.baseUnitBoxWidth = unitBoxWidth;
			this.setState({ scrollEnable: false });
		}
		else if (event.nativeEvent.oldState === State.ACTIVE)
		this.setState({ scrollEnable: true });
  };

  render() {
		const { scrollEnable } = this.state;
		const { musicLength, dancers, times, positions, curTime,
						setCurTime, selectedPosTime, selectFormationBox,
						changeFormationBoxLength, isPlay, unitBoxWidth, unitTime,
						setTimelineScroll, onTimelineScroll,
						addFormation, formationAddable,
						toastOpacity, toastMessage } = this.props;
		const {
			musicLengthFormat,
			setScrollEnable,
		} = this;
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
		const toastOpacityStyle = { opacity: toastOpacity };

		return (
			<View style={[styles.bg, {alignItems: 'center'}]}>
				<PinchGestureHandler
					onGestureEvent={event => this._changeUnitBoxWidth(event.nativeEvent.scale)}
					onHandlerStateChange={this._onPinchHandlerStateChange}>

					<ScrollView
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
								setScrollEnable={setScrollEnable} />
								: null}
							</View>
						</TouchableOpacity>
					</ScrollView>
				</PinchGestureHandler>

				{/* Time Marker */}
				<View
				pointerEvents='none'	// 터치되지 않도록
				style={styles.timeMarkerContainer}>
					<View style={styles.timeMarker}>
						<Text style={styles.playerBar__time}>{musicLengthFormat(curTime)}</Text>
					</View>
					<View style={styles.timeMarkerLine} />
				</View>

				{!formationAddable || isPlay ? null :
				<TouchableOpacity
				onPress={addFormation}
				style={styles.addFormationBtn}>
					<Text style={styles.addFormationBtn__text}>+</Text>
				</TouchableOpacity>
				}

				<Animated.View style={[toastOpacityStyle, {
					position: 'absolute', top: 65,
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
}