import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GameProvider } from './context/GameContext';
import ConfigScreen from './screens/ConfigScreen';
import GameScreen from './screens/GameScreen';
import { RootStackParamList } from './types/navigation';
import { GameName, Config } from './constants/gameConfig';

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  return (
    <GameProvider>
      <Stack.Navigator initialRouteName="Config">
        <Stack.Screen
          name="Config"
          component={ConfigScreen}
          options={{ title: Config }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: GameName }}
        />
      </Stack.Navigator>
    </GameProvider>
  );
}