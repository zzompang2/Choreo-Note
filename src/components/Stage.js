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
		const positionAtTime = [];

		let time;
		for(let i = 0; i < times.length; i++) {
			time = times[i];
			if(time.time <= curTime && curTime < time.time + time.duration)
				break;
		}
		for(let j = 0; j < positions.length; j++) {
			if(positions[j].time == time.time) {
				for(let k = j; k < positions.length && positions[k].time == time.time; k++)
					positionAtTime.push(positions[k]);
				break;
			}
		}

		console.log(positionAtTime);
		return (
			<View style={{...styles.stage, height: height}}>
				<Coordinate height={height} />
				{dancers.map(dancer => 
					<Dancer
					key={dancer.did}
					setDancerPosition={setDancerPosition}
					did={dancer.did}
					curPos={{
						x: positionAtTime[dancer.did].x, 
						y: positionAtTime[dancer.did].y
					}} />
				)}
			</View>
    )
  }
}