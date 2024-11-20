import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ConfigScreen from './screens/ConfigScreen';
import GameScreen from './screens/GameScreen';

type RootStackParamList = {
  Config: undefined;
  Game: { players: string[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  return (
    <Stack.Navigator initialRouteName="Config">
      <Stack.Screen
        name="Config"
        component={ConfigScreen}
        options={{ title: 'Configuração' }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: 'Jogo' }}
      />
    </Stack.Navigator>
  );
}