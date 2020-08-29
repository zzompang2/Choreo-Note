import React from "react";
import { 
	Text,StyleSheet,PanResponder,Animated,
} from "react-native";

import {COLORS} from '../values/Colors';

const TAG = "Dancer/";

export default class Dancer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			// 초기값 정의
			// Animated.ValueXY({x: 0, y: 0})와 같음
      pan: new Animated.ValueXY(),
    };
    this._val = { x:0, y:0 };
    
    // 최종 좌표의 값(value)을 _val 값에 대입되도록 한다.
		this.state.pan.addListener((value) => this._val = value);
		
    /** Initialize PanResponder with move handling **/
    this.panResponder = PanResponder.create({
      // 주어진 터치 이벤트에 반응할지를 결정(return T/F)
      // 재생중일땐 움직이지 못하도록 하자.
      onStartShouldSetPanResponder: (e, gesture) => { 
        return !this.props.isPlay;
      },

      // 터치이벤트 발생할 때
      onPanResponderGrant: (e, gesture) => {
        // drag되기 전 초기 위치 저장
        // this._prevVal = {x: this._val.x, y: this._val.y}

        this.state.pan.setOffset({
        x: this._val.x,
        y: this._val.y,
        })
        this.state.pan.setValue({x:0, y:0});
        //this.onChange();
      },

       // moving 제스쳐가 진행중일 때 실행.
       // 마우스 따라 움직이도록 하는 코드.
       onPanResponderMove:
       Animated.event(
         [null, 
         { dx: this.state.pan.x, 
           dy: this.state.pan.y }
         ], 
         {useNativeDriver: false}
       ),

      // 터치이벤트 끝날 때.
      onPanResponderRelease: (e, gesture) => {
        //console.log(TAG + "onPanResponderRelease/터치 끝");

        // this._val = {x: this._prevVal.x+gesture.dx, y: this._prevVal.y+gesture.dy};

        this._val.x = Math.round(this._val.x);
        this._val.y = Math.round(this._val.y);

        // 부모 컴포넌트로 값 보내기
        this.props.dropedPositionSubmit(this.props.did, this._val.x, this._val.y);
        this.state.pan.setOffset({x: 0, y: 0});
        this.forceUpdate();
      }
    });
  }

  // 전달받은 curTime에 어느 위치에 놓여져 있는지 계산한다.
  getCurPosition = () => {
    const position = this.props.position;
    const curTime = this.props.curTime;

    // 사실 error를 return해야 맞는 것 같다.
    if(position.length == 0) return({x:0, y:0});

    // 몇 번째 index 사이에 있는지 계산.
    for(var i=0; i<position.length; i++){
      if(curTime <= position[i].time) break;
    }
    // 가장 큰 시간보다 큰 경우.
    if(i == position.length)
      return({x: position[i-1].posx, y: position[i-1].posy});
    // check point와 시간이 같은 경우
    if(curTime == position[i].time)
      return({x: position[i].posx, y: position[i].posy});

    const dx = Math.round( (position[i].posx - position[i-1].posx) * (curTime - position[i-1].time) / (position[i].time - position[i-1].time) );
    const dy = Math.round( (position[i].posy - position[i-1].posy) * (curTime - position[i-1].time) / (position[i].time - position[i-1].time) );
    
    return({x: position[i-1].posx + dx, y: position[i-1].posy + dy})
  }

  playAnim = () => {
    console.log(TAG, "playAnim: " + this.props.isPlay);

    if(this.props.isPlay) {
      let transformList = [];

      // 시작 시간에 맞춰 애니메이션을 실행하기 위해
      // 현재 시간에 어느 위치에 있는지 찾는다.
      let i=0;
      for(; i<this.props.position.length; i++){
        if(this.props.curTime < this.props.position[i].time)
          break;
      }

      if(i == this.props.position.length) return;

      transformList.push( 
        Animated.timing(
          this.state.pan,
          {
            toValue: {x:this._val.x, y:this._val.y},
            duration: 1,
            useNativeDriver: true,
            delay: 0,
          }
      ));

      transformList.push( 
        Animated.timing(
          this.state.pan,
          {
            toValue: {x:this.props.position[i].posx, y:this.props.position[i].posy},
            duration: (this.props.position[i].time - this.props.curTime) * 1000,
            useNativeDriver: true,
            delay: 0,
          }
      ));

      for(var j=i+1; j<this.props.position.length; j++){
        transformList.push(
          Animated.timing(
            this.state.pan,
            {
              toValue: {x:this.props.position[j].posx, y:this.props.position[j].posy},
              duration: (this.props.position[j].time - this.props.position[j-1].time) * 1000,
              useNativeDriver: true,
              delay: 0,
            }
        ));
      }
      Animated.sequence(transformList).start();
    }
  }

  render() {
    //console.log(TAG + "render");
    //console.log(TAG + "_val: " + Math.round(this._val.x) +", "+Math.round(this._val.y));

    const curPosition = this.getCurPosition();
    
    // cur position 적용
    this.state.pan.setValue(curPosition)
    // setValue하면 _val 값도 적용됨.
    // this._val = {x: curPosition.x, y: curPosition.y}
    
    // 위치를 지정할 스타일
    const panStyle = { transform: this.state.pan.getTranslateTransform() }
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[panStyle, styles.circle]}>
        <Text style={styles.number}>{this.props.did+1}</Text>
        <Text style={{fontSize: 6}}>({this._val.x},{this._val.y})</Text>
      </Animated.View>
    );
  }

  componentDidUpdate() {
    console.log(TAG, "componentDidUpdate");
    this.playAnim();    
  }
}

let CIRCLE_RADIUS = 20;
let styles = StyleSheet.create({
  // 모양 정의를 위한 스타일
  circle: {
    backgroundColor: COLORS.yellow,
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    position: 'absolute',
    alignItems: 'center'
  },
  number: {
    fontSize: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 5,
    textAlign: 'center',
    // backgroundColor: 'red'
  }
});