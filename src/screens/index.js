import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './MainScreen';
import FormationScreen from './FormationScreen';
import DatabaseScreen from './DatabaseScreen';

const Stack = createStackNavigator();

export default function ScreenStack() {
  return (
		<Stack.Navigator
		initialRouteName="Main"
		headerMode={'none'}											// 상단바 없애기
		screenOptions={{gestureEnabled: false}} // swipe 로 goBack 하는 것 막기
		>
      <Stack.Screen name="Main" component={MainScreen} />
			<Stack.Screen name="Formation" component={FormationScreen} />
			<Stack.Screen name="Database" component={DatabaseScreen} />
    </Stack.Navigator>
  );
}