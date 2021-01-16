import React from "react";
import { 
	Dimensions, View,
} from "react-native";
import getStyleSheet from "../values/styles";
import Coordinate from "../components/Coordinate";
import Dancer from "./Dancer";

const { width } = Dimensions.get('window');
const TAG = "Stage/";

export default class Stage extends React.Component {

  render() {
		const { dancers, times, positions, curTime, setDancerPosition, selectedPosTime } = this.props;
		const styles = getStyleSheet();
		const height = width / this.props.stageRatio;
		const positionAtSameTime = [];

		/* curTime 시간에 각 Dancer 의 위치 계산하기 */

		// case 0: 어떤 Position box 가 선택된 상태인 경우 
		if(selectedPosTime !== undefined) {
			for(let i=0; i<times.length; i++)
				if(times[i].time == selectedPosTime) {
					positionAtSameTime.push(...positions[i]);
					break;
				}
			// if(positionAtSameTime.length == 0) ERROR
		}

		// case 1: 첫 번째 블록보다 앞에 있는 경우
		else if(times.length > 0 && curTime < times[0].time)
			positionAtSameTime.push(...positions[0]);

		// case 2: 마지막 블록보다 뒤에 있는 경우
		else if(times.length > 0 && 
						times[times.length-1].time + times[times.length-1].duration < curTime)
				positionAtSameTime.push(...positions[times.length-1]);

		else {
			for(let i=0; i < times.length; i++) {
				const time = times[i];
				if(curTime <= time.time + time.duration) {
					// case 3: times[i] 내에 포함된 경우
					if(time.time <= curTime) {
						positionAtSameTime.push(...positions[i]);
					}
					// case 4: times[i-1] ~ [i] 사이에 있는 경우
					else {
						for(let j=0; j<positions[i].length; j++) {
							const prevDuration = times[i-1].duration;
							const prev = positions[i-1][j];
							const post = positions[i][j];
							const x = prev.x + (post.x - prev.x) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
							const y = prev.y + (post.y - prev.y) / (post.time - prev.time - prevDuration) * (curTime - prev.time - prevDuration);
							positionAtSameTime.push({did: j, x, y});
						}
					}
					break;
				}
			}
		}

		const selectedStageStyle = selectedPosTime === undefined ? {} : styles.stageSelected;

		return (
			<View style={{...styles.stage, height: height, ...selectedStageStyle}}>
				<Coordinate height={height} />
				{dancers.map(dancer => 
					<Dancer
					key={dancer.did}
					setDancerPosition={setDancerPosition}
					did={dancer.did}
					selectedPosTime={selectedPosTime}
					curPos={{
						x: positionAtSameTime[dancer.did].x, 
						y: positionAtSameTime[dancer.did].y
					}} />
				)}
			</View>
    )
  }
}