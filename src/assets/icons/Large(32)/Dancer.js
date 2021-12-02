import * as React from "react"
import Svg, { Circle, Path, Rect } from "react-native-svg"

export default function Dancer({ color }) {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Circle cx="16" cy="16" r="13" fill={color}/>
    <Path d="M19.5455 18.3638C18.9546 19.5456 17.9581 20.7274 16 20.7274C14.0419 20.7274 13.0455 19.5456 12.4546 18.3638" stroke="black" strokeWidth="2" stroke-linecap="round"/>
    <Circle cx="11" cy="13" r="2" fill="black"/>
    <Circle cx="21" cy="13" r="2" fill="black"/>
    <Path d="M25.8536 0.853552C25.5386 0.53857 25.7617 0 26.2071 0H31C31.5523 0 32 0.447715 32 1V5.79289C32 6.23835 31.4614 6.46143 31.1464 6.14645L25.8536 0.853552Z" fill={color}/>
    </Svg>
  )
}
