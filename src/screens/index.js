import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './MainScreen';
import EditNoteScreen from './EditNoteScreen';
import FormationScreen from './FormationScreen';
import DatabaseScreen from './DatabaseScreen';

const Stack = createNativeStackNavigator();
  
export default function ScreenStack() {
  return (
		<Stack.Navigator
		initialRouteName="Main"
		screenOptions={{
			gestureEnabled: false,		// swipe 로 goBack 하는 것 막기
			animationEnabled: false,	// 이동시 좌우 슬라이드 애니메이션 없애기
			headerShown: false				// 상단바 숨기기
		}}
		>
			<Stack.Screen name="Main" component={MainScreen} />
			<Stack.Screen name="EditNote" component={EditNoteScreen} />
			<Stack.Screen name="Formation" component={FormationScreen} />
			<Stack.Screen name="Database" component={DatabaseScreen} />
		</Stack.Navigator>
	);
}