import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"

export default function DancerName({ color }) {
  return (
  <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <Circle cx="16" cy="16" r="13" fill={color}/>
  <Path d="M22.6106 14.306H21.3106V10.25H19.1136V21.352H21.3106V16.438H22.6106V14.306ZM11.1966 12.512H15.2396V13.513C15.2396 16.763 13.8616 18.726 11.1966 18.752V20.832C15.0446 20.832 17.4756 18.024 17.4756 13.513V10.51H11.1966V12.512Z" fill="black"/>
  </Svg>
  )
}
