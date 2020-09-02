import React from "react";
import { 
	Text, StyleSheet, PanResponder, Animated, Dimensions,
} from "react-native";

import {COLORS} from '../values/Colors';
// 화면의 가로, 세로 길이 받아오기
const {width,height} = Dimensions.get('window');

const TAG = "Dancer/";
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];

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
        this._prevVal = {x: this._val.x, y: this._val.y}

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

        // 영역 밖으로 나간 경우
        if(Math.abs(this._val.x) > (width-6)/2-10 || Math.abs(this._val.y) > height/5-10){
          this._val.x = this._prevVal.x;
          this._val.y = this._prevVal.y;
        }
        else{
          // alignWithCoordinate = true 라면 좌표축에 맞춘다.
          const coordinateSpace = 15 + this.props.coordinateLevel * 5;
          if(this.props.alignWithCoordinate){
            this._val.x = Math.round(this._val.x / coordinateSpace) * coordinateSpace;
            this._val.y = Math.round(this._val.y / coordinateSpace) * coordinateSpace;
          }else{
            this._val.x = Math.round(this._val.x);
            this._val.y = Math.round(this._val.y);
          }

          // 부모 컴포넌트로 값 보내기
          this.props.dropPosition(this.props.did, this._val.x, this._val.y);
        }
        this.state.pan.setOffset({x: 0, y: 0});
        this.forceUpdate();
      }
    });
  }

  // 전달받은 curTime에 어느 위치에 놓여져 있는지 계산한다.
  getCurPosition = () => {
    const position = [...this.props.position];
    const curTime = this.props.curTime;

    // 초기 상태는 지우지 못하도록 했으니,
    // 사실상 error인 경우이다.
    if(position.length == 0) return({x:0, y:0});

    // 어떤 checked point들 사이에 있는지 계산 ( [i-1] < ... <= [i] )
    for(var i=0; i<position.length; i++)
      if(curTime <= position[i].time) break;

    // 최종 checked point의 시간보다 큰 경우
    if(i == position.length)
      return({x: position[i-1].posx, y: position[i-1].posy});

    // 어떤 checked point와 시간이 같은 경우
    if(curTime == position[i].time)
      return({x: position[i].posx, y: position[i].posy});

    // 이전 checked point(i-1 번째)의 duration 중인 경우
    const leftedDuration = position[i-1].time + position[i-1].duration - this.props.curTime;
    if(leftedDuration >= 0)
      return({x: position[i-1].posx, y: position[i-1].posy});

    const dx = Math.round( (position[i].posx - position[i-1].posx) * (curTime - position[i-1].time - position[i-1].duration) / (position[i].time - position[i-1].time - position[i-1].duration) );
    const dy = Math.round( (position[i].posy - position[i-1].posy) * (curTime - position[i-1].time - position[i-1].duration) / (position[i].time - position[i-1].time - position[i-1].duration) );
    
    return({x: position[i-1].posx + dx, y: position[i-1].posy + dy})
  }

  playAnim = () => {
    //console.log(TAG, "playAnim: " + this.props.isPlay);
    const position = [...this.props.position];

    if(this.props.isPlay) {
      let transformList = [];

      // 시작 시간에 맞춰 애니메이션을 실행하기 위해
      // 현재 시간에 어느 위치에 있는지 찾는다.
      let i=0;
      for(; i<position.length; i++){
        if(this.props.curTime < position[i].time)
          break;
      }

      // 최종 좌표 이후의 시간인 경우: 애니메이션 필요 없음.
      if(i == position.length) return;

      // 이전 좌표의 duration이 아직 진행중인 경우를 체크
      let leftedDuration = position[i-1].time + position[i-1].duration - this.props.curTime;
      leftedDuration = ( leftedDuration > 0 ? leftedDuration : 0 );
      
      // 첫번째 애니메이션: 현재 시간 ~ 처음으로 나오는 좌표의 위치
      transformList.push( 
        Animated.timing(
          this.state.pan,
          {
            toValue: {x: position[i].posx, y: position[i].posy},
            duration: (position[i].time - this.props.curTime - leftedDuration) * 1000,
            useNativeDriver: true,
            delay: leftedDuration * 1000,
          }
        )
      );

      // 나머지 애니메이션: 저장된 정보대로 다음 좌표의 위치로 이동
      for(var j=i+1; j<position.length; j++){
        transformList.push(
          Animated.timing(
            this.state.pan,
            {
              toValue: {x:position[j].posx, y:position[j].posy},
              duration: (position[j].time - position[j-1].time - position[j-1].duration) * 1000,
              useNativeDriver: true,
              delay: position[j-1].duration * 1000,
            }
          ),
        );
      }
      Animated.sequence(transformList).start();
    }
  }

  render() {
    //console.log(TAG, "render");
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
      style={[panStyle, styles.circle, {
        width: this.props.radiusLength*2, 
        height: this.props.radiusLength*2, 
        borderRadius: this.props.radiusLength,
        backgroundColor: dancerColor[this.props.color],
        }]}>
      <Text style={[styles.number, {fontSize: this.props.radiusLength}]}>{this.props.did+1}</Text>
      {/* <Text style={{fontSize: 6}}>({this._val.x},{this._val.y})</Text> */}
      </Animated.View>
    );
  }

  componentDidUpdate() {
    //console.log(TAG, "componentDidUpdate");
    this.playAnim();    
  }
}

let styles = StyleSheet.create({
  // 모양 정의를 위한 스타일
  circle: {
    backgroundColor: COLORS.yellow,
    position: 'absolute',
    alignItems: 'center'
  },
  number: {
    marginTop: 5,
    textAlign: 'center',
  }
});