import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroScreen from '../screens/IntroScreen';
import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';

export type RootStackParamList = {
  Intro: undefined;
  Home: undefined;
  Editor: { template?: any } | undefined;
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
