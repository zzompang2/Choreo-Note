import * as React from "react"
import Svg, { Path, Rect } from "react-native-svg"

export default function Add() {
  return (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Rect x="15" y="8" width="2" height="16" rx="1" fill="white"/>
    <Rect x="24" y="15" width="2" height="16" rx="1" transform="rotate(90 24 15)" fill="white"/>
  </Svg>
  )
}