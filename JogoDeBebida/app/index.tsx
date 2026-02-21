import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GameProvider } from './context/GameContext';
import ConfigScreen from './screens/ConfigScreen';
import GameScreen from './screens/GameScreen';
import EndScreen from './screens/EndScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  return (
    <GameProvider>
      <Stack.Navigator
        initialRouteName="Config"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0D0D0D' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Config" component={ConfigScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="End" component={EndScreen} />
      </Stack.Navigator>
    </GameProvider>
  );
}