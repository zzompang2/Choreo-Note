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
		const { dancers, times, positions, curTime, setDancerPosition } = this.props;
		const styles = getStyleSheet();
		const height = width / this.props.stageRatio;
		const positionAtSameTime = [];

		for(let i=0; i < times.length; i++) {
			const time = times[i];
			if(curTime <= time.time + time.duration) {
				// times[i] 내에 포함된 경우
				if(time.time <= curTime) {
					positionAtSameTime.push(...positions[i]);
				}
				// times[i-1] ~ [i] 사이에 있는 경우
				else {
					for(let j=0; j<positions[i].length; j++) {
						const prev = positions[i-1][j];
						const post = positions[i][j];
						const x = prev.x + (post.x - prev.x) / (post.time - prev.time) * (curTime - prev.time);
						const y = prev.y + (post.y - prev.y) / (post.time - prev.time) * (curTime - prev.time);
						positionAtSameTime.push({did: j, x, y});
					}
				}
				break;
			}
			if(i == times.length-1)
				positionAtSameTime.push(...positions[i]);
		}

		return (
			<View style={{...styles.stage, height: height}}>
				<Coordinate height={height} />
				{dancers.map(dancer => 
					<Dancer
					key={dancer.did}
					setDancerPosition={setDancerPosition}
					did={dancer.did}
					curPos={{
						x: positionAtSameTime[dancer.did].x, 
						y: positionAtSameTime[dancer.did].y
					}} />
				)}
			</View>
    )
  }
}