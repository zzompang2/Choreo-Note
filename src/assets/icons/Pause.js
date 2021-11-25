import * as React from "react"
import Svg, { Rect } from "react-native-svg"

export default function Pause() {
  return (
    <Svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Rect width="46" height="46" rx="14" fill="#2B2B2B"/>
      <Rect x="16" y="14" width="4" height="18" fill="white"/>
      <Rect x="26" y="14" width="4" height="18" fill="white"/>
    </Svg>
  )
};
