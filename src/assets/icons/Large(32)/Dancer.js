import * as React from "react"
import Svg, { Circle, Path, Rect } from "react-native-svg"

export default function Dancer({ color }) {
  return (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <Circle cx="16" cy="16" r="10" fill={color}/>
  <Path d="M19 18C18.5 19 17.6569 20 16 20C14.3431 20 13.5 19 13 18" stroke="black" stroke-width="2" stroke-linecap="round"/>
  <Circle cx="12.5" cy="13.5" r="1" fill="black" stroke="black"/>
  <Circle cx="19.5" cy="13.5" r="1" fill="black" stroke="black"/>
  <Path d="M25.8536 0.853552C25.5386 0.53857 25.7617 0 26.2071 0H31C31.5523 0 32 0.447715 32 1V5.79289C32 6.23835 31.4614 6.46143 31.1464 6.14645L25.8536 0.853552Z" fill={color}/>
  </Svg>
  )
}
