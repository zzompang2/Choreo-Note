import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ListScreen from './src/main/ListScreen';
import FormationScreen from './src/main/FormationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{
        //headerStyle: { backgroundColor: COLORS.blackDark, height: 40},
        //headerTintColor: COLORS.purpleLight,
        //headerTitleAlign: 'left',
        headerShown: true,
      }}>
        <Stack.Screen name="List" component={ListScreen}/>
        <Stack.Screen name="Formation" component={FormationScreen} />
    </Stack.Navigator>
    </NavigationContainer>
  );
};