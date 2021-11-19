import * as React from "react"
import Svg, { Rect } from "react-native-svg"

function Add({ color }) {
  return (
    <Svg
      width={48}
      height={48}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Rect x={23} y={4} width={2} height={40} rx={1} fill={color} />
      <Rect x={4} y={23} width={40} height={2} rx={1} fill={color} />
    </Svg>
  )
}

export default Add