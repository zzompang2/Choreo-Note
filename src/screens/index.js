import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ListScreen from './ListScreen';
import FormationScreen from './FormationScreen';
import DancerScreen from './DancerScreen';
import DatebaseScreen from './DatabaseScreen';
const Stack = createStackNavigator();

export default function ScreenStack() {
  return (
		<Stack.Navigator 
		initialRouteName="ListScreen"
		headerMode={'none'}>
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="Formation" component={FormationScreen} />
			<Stack.Screen name="Dancer" component={DancerScreen} />
      <Stack.Screen name="DB" component={DatebaseScreen} />
    </Stack.Navigator>
  );
}
