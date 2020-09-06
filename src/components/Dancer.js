import React from "react";
import { 
	Text, StyleSheet, PanResponder, Animated, Dimensions, View,
} from "react-native";

import {COLORS} from '../values/Colors';
// 화면의 가로, 세로 길이 받아오기
const {width, height} = Dimensions.get('window');

const TAG = "Dancer/";
const dancerColor = [COLORS.yellow, COLORS.red, COLORS.blue, COLORS.purple];

export default class Dancer extends React.Component {
  constructor(props) {
    console.log(TAG, 'constructor');
    super(props);
    this.state = {
			// 초기값 정의. Animated.ValueXY({x: 0, y: 0})와 같음
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
        // 플레이 중이거나 시작 위치 이전이면 터치를 막는다.
        return (!this.props.isPlay) && (this.fadeAnim._value != 0);
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
          {
            dx: this.state.pan.x, 
            dy: this.state.pan.y 
          }
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
        // this.forceUpdate();
      }
    });
  }

  // 전달받은 curBeat에 어느 위치에 놓여져 있는지 계산한다.
  getCurPosition = () => {
    const posList = [...this.props.posList];
    const curBeat = this.props.curBeat;

    // 맨 앞의 checked point보다 작거나 같은 경우
    if(curBeat < posList[0].beat){
      this.fadeAnim = new Animated.Value(0);
      return({x: posList[0].posx, y: posList[0].posy});
    }
    this.fadeAnim = new Animated.Value(1);

    // 어떤 checked point들 사이에 있는지 계산 ( [i-1] < ... <= [i] )
    for(var i=0; i<posList.length; i++)
      if(curBeat <= posList[i].beat) break;

    // 최종 checked point의 시간보다 큰 경우
    if(i == posList.length){
      return({x: posList[i-1].posx, y: posList[i-1].posy});
    }

    // 어떤 checked point와 시간이 같은 경우
    if(curBeat == posList[i].beat)
      return({x: posList[i].posx, y: posList[i].posy});

    // 이전 checked point(i-1 번째)의 duration 중인 경우
    const leftedDuration = posList[i-1].beat + posList[i-1].duration - this.props.curBeat;
    if(leftedDuration >= 0)
      return({x: posList[i-1].posx, y: posList[i-1].posy});

    const dx = Math.round( (posList[i].posx - posList[i-1].posx) * (curBeat - posList[i-1].beat - posList[i-1].duration) / (posList[i].beat - posList[i-1].beat - posList[i-1].duration) );
    const dy = Math.round( (posList[i].posy - posList[i-1].posy) * (curBeat - posList[i-1].beat - posList[i-1].duration) / (posList[i].beat - posList[i-1].beat - posList[i-1].duration) );
    
    return({x: posList[i-1].posx + dx, y: posList[i-1].posy + dy});
  }

  playAnim = () => {
    //console.log(TAG, "playAnim: " + this.props.isPlay);
    const posList = [...this.props.posList];

    // 위치 정보가 없는 경우: 애니메이션 필요 없음
    if(posList.length == 0) return;

    let transformList = [];
    let leftedDuration = 0; // 남아있는 duration 길이

    // 시작 시간에 맞춰 애니메이션을 실행하기 위해
    // 현재 시간에 어느 위치에 있는지 찾는다.
    let i=0;
    for(; i<posList.length; i++){
      if(this.props.curBeat < posList[i].beat)
        break;
    }
    // 최초 좌표 이전의 시간인 경우: 무대 등장하기 전이므로 대기
    if(i == 0){
      leftedDuration = posList[0].beat - this.props.curBeat;
    }
    // 최종 좌표 이후의 시간인 경우: 애니메이션 필요 없음
    else if(i == posList.length) return;
    else{
      // 이전 좌표의 duration이 아직 진행중인 경우를 체크
      leftedDuration = posList[i-1].beat + posList[i-1].duration - this.props.curBeat;
      leftedDuration = ( leftedDuration > 0 ? leftedDuration : 0 );
    }
    // 첫번째 애니메이션: 현재 시간 ~ 처음으로 나오는 좌표의 위치
    transformList.push(
      Animated.timing(
        this.state.pan,
        {
          toValue: {x: posList[i].posx, y: posList[i].posy, opacity: .7},
          duration: (posList[i].beat - this.props.curBeat - leftedDuration) * 1000*60/this.props.bpm,
          useNativeDriver: true,
          delay: leftedDuration * 1000*60/this.props.bpm,
        }
      ),
      Animated.timing(
        this.fadeAnim, 
        { toValue: 1, duration: 0, useNativeDriver: true, }
      )
    );

    // 나머지 애니메이션: 저장된 정보대로 다음 좌표의 위치로 이동
    for(var j=i+1; j<posList.length; j++){
      transformList.push(
        Animated.timing(
          this.state.pan,
          {
            toValue: {x: posList[j].posx, y: posList[j].posy},
            duration: (posList[j].beat - posList[j-1].beat - posList[j-1].duration) * 1000*60/this.props.bpm,
            useNativeDriver: true,
            delay: posList[j-1].duration * 1000*60/this.props.bpm,
          }
        )
      );
    }
    Animated.sequence(transformList).start(); 
  }

  render() {
    console.log(TAG, "render");

    // 위치 정보가 없는 경우: view 숨기기
    if(this.props.posList.length == 0){
      this.fadeAnim = new Animated.Value(0);
    }
    // 위치 정보가 있는 경우: 현재 위치 찾아 적용
    else{
      // setValue하면 _val 값도 적용됨: this._val == {x: curPosition.x, y: curPosition.y}
      this.state.pan.setValue( this.getCurPosition() );
    }
    // 위치를 지정할 스타일
    const panStyle = { transform: this.state.pan.getTranslateTransform() }
    
    return (
      // 플레이 중이거나 불투명도가 1(on stage)이라면 댄스 아이콘을 띄운다.
      this.props.isPlay || this.fadeAnim._value != 0 ?
      <Animated.View
      {...this.panResponder.panHandlers}
      style={[panStyle, {
        backgroundColor: COLORS.yellow,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: this.fadeAnim,
        width: this.props.radiusLength*2, 
        height: this.props.radiusLength*2, 
        borderRadius: this.props.radiusLength,
        backgroundColor: dancerColor[this.props.color],
        borderColor: COLORS.green,
        borderWidth: this.props.isSelected ? 3 : 0,
        }]}>
      <Text style={[styles.number, {fontSize: this.props.radiusLength}]}>{this.props.did+1}</Text>
      {/* <Text style={{fontSize: 6}}>({this._val.x},{this._val.y})</Text> */}
      </Animated.View>
      :
      // 플레이 중이 아니라면 불투명도가 0이라도 아이콘을 없애야 다른 댄서 아이콘의 터치를 막지 않는다.
      <View/>
    )
  }

  componentDidUpdate() {
    console.log(TAG, "componentDidUpdate");
    if(this.props.isPlay) this.playAnim();
  }
}

let styles = StyleSheet.create({
  number: {
    textAlign: 'center',
  }
});