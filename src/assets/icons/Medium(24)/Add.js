import * as React from "react"
import Svg, { Rect } from "react-native-svg"

export default function Add() {
  return (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Rect x="11" y="4" width="2" height="16" rx="1" fill="black"/>
    <Rect x="20" y="11" width="2" height="16" rx="1" transform="rotate(90 20 11)" fill="black"/>
  </Svg>
  )
}
