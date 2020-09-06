import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ListScreen from './ListScreen';
import FormationScreen from './FormationScreen';
import DancerScreen from './DancerScreen';
import DatebaseScreen from './DatabaseScreen';
import MakeNoteScreen1 from './MakeNoteScreen1';
import MakeNoteScreen2 from './MakeNoteScreen2';
const Stack = createStackNavigator();

export default function ScreenStack() {
  return (
		<Stack.Navigator
		initialRouteName="ListScreen"
    headerMode={'none'}
    screenOptions={{gestureEnabled: false}} // swipe 로 goBack 하는 것 막기
    >
      <Stack.Screen name="List" component={ListScreen}/>
      <Stack.Screen name="Formation" component={FormationScreen}/>
			<Stack.Screen name="Dancer" component={DancerScreen}/>
      <Stack.Screen name="DB" component={DatebaseScreen}/>
      <Stack.Screen name="MakeNote1" component={MakeNoteScreen1}/>
      <Stack.Screen name="MakeNote2" component={MakeNoteScreen2}/>
    </Stack.Navigator>
  );
}