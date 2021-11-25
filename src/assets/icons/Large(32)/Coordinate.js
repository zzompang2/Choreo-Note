import * as React from "react"
import Svg, { Path, Rect } from "react-native-svg"

export default function Coordinate({ color }) {
  return (
    <Svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Rect x="10.9286" y="5" width="2" height="22" rx="1" fill={color}/>
    <Rect x="20.8572" y="5" width="2" height="22" rx="1" fill={color}/>
    <Rect x="27.9286" y="10" width="2" height="22" rx="1" transform="rotate(90 27.9286 10)" fill={color}/>
    <Rect x="27.9286" y="20" width="2" height="22" rx="1" transform="rotate(90 27.9286 20)" fill={color}/>
    </Svg>
  )
}
