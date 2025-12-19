import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';
import type { Template } from '../data/templates.local';

export type RootStackParamList = {
  Intro: undefined;
  Home: undefined;
  Editor: { template: Template };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Router() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        statusBarAnimation: 'fade',
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Editor" component={EditorScreen} />
    </Stack.Navigator>
  );
}
