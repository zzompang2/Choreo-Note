import * as React from "react"
import Svg, { Path, Rect } from "react-native-svg"

export default function Rotate({ color }) {
  return (
  <Svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <Path d="M25.5956 15.5333C25.5956 10.2682 21.3274 6 16.0622 6C13.0709 6 10.4013 7.37776 8.65344 9.53333" stroke={color} strokeWidth="2" stroke-linecap="round"/>
  <Path d="M22.613 14.3199C22.381 13.9885 22.6181 13.5332 23.0226 13.5332H28.1019C28.5064 13.5332 28.7435 13.9885 28.5115 14.3199L25.9719 17.948C25.7728 18.2324 25.3517 18.2324 25.1526 17.948L22.613 14.3199Z" fill={color}/>
  <Path d="M6.52894 15.5336C6.52893 20.7987 10.7972 25.0669 16.0623 25.0669C19.0536 25.0669 21.7232 23.6891 23.4711 21.5336" stroke={color} strokeWidth="2" stroke-linecap="round"/>
  <Path d="M9.51154 16.747C9.74352 17.0783 9.50644 17.5337 9.10193 17.5337L4.02258 17.5337C3.61807 17.5337 3.38099 17.0783 3.61297 16.747L6.15264 13.1189C6.35169 12.8345 6.77282 12.8345 6.97187 13.1189L9.51154 16.747Z" fill={color}/>
  </Svg>
  )
}
