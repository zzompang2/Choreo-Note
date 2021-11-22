import * as React from "react"
import Svg, { Rect } from "react-native-svg"
import { COLORS } from "../../../values/styles"

function Delete() {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* <Rect width="48" height="48" fill={COLORS.abnormal}/> */}
      <Rect x="4" y="4" width="40" height="40" rx="20" fill={COLORS.abnormal}/>
      <Rect x="13" y="22" width="22" height="4" rx="2" fill="white"/>
    </Svg>
  )
}

export default Delete