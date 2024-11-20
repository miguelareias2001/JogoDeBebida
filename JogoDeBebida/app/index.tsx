
// Necessary tools
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import { GameProvider } from './context/GameContext';
import ConfigScreen from './screens/ConfigScreen';
import GameScreen from './screens/GameScreen';
import { RootStackParamList } from './types/navigation';

// Constants
import { GameName, Configuracao} from './constants/gameConfig';

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  return (
    <NavigationContainer>
      <GameProvider>
        <Stack.Navigator initialRouteName="Config">
          <Stack.Screen
            name="Config"
            component={ConfigScreen}
            options={{ title: Configuracao }}
          />
          <Stack.Screen
            name="Game"
            component={GameScreen}
            options={{ title: GameName }}
          />
        </Stack.Navigator>
      </GameProvider>
    </NavigationContainer>
  );
}