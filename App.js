import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ScreenStack from './src/screens';
// import ListScreen from './src/screens/ListScreen';
// import FormationScreen from './src/screens/FormationScreen';
// import DancerScreen from './src/screens/DancerScreen';

import { COLORS } from './src/values/Colors';

export default function App() {
  return (
    <NavigationContainer>
			<ScreenStack/>
		</NavigationContainer>
  );
};