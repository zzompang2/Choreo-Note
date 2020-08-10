import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ListScreen from './src/main/ListScreen';
import FormationScreen from './src/main/FormationScreen';
import { COLORS } from './src/values/Colors';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
			initialRouteName="ListScreen"
      screenOptions={{
        //headerStyle: { backgroundColor: COLORS.blackDark, height: 40},
        //headerTintColor: COLORS.purpleLight,
        //headerTitleAlign: 'left',
				headerShown: true,
      }}>
				
				<Stack.Screen 
				name="ListScreen" 
				component={ListScreen}
				options={{
					title: 'List',
					headerStyle: { backgroundColor: COLORS.white, },
					headerTintColor: COLORS.blackDark,
					headerTitleStyle: { fontWeight: 'bold', },
				}}/>

				<Stack.Screen 
				name="FormationScreen" 
				component={FormationScreen} />
    </Stack.Navigator>
    </NavigationContainer>
  );
};