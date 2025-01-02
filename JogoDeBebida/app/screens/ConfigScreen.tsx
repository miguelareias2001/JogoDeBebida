import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/GameContext'; // <-- Use the game context here
import { Remove } from '../constants/gameConfig';

type RootStackParamList = {
  Config: undefined;
  Game: undefined; // We no longer pass { players: string[] } since we use context
};

type ConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Config'>;

type Props = {
  navigation: ConfigScreenNavigationProp;
};

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  // We'll track only the input text locally
  const [playerName, setPlayerName] = useState('');

  // Pull data & methods from context
  const {
    players,       // Array of { name, penalties }
    addPlayer,
    removePlayer,
  } = useGame();

  // Add a player to context
  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    // Try to add via context; it returns false if invalid or duplicate
    const success = addPlayer(trimmed);
    if (!success) {
      Alert.alert('Erro', 'Nome inválido ou duplicado!');
    } else {
      setPlayerName('');
    }
  };

  // Remove a player by name (context function)
  const handleRemovePlayer = (name: string) => {
    removePlayer(name);
  };

  // Start the game by navigating to "GameScreen"
  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Erro', 'Adicione pelo menos dois jogadores para iniciar o jogo.');
      return;
    }
    // Since players are in context, we don't need to pass them as params
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insira os nomes dos jogadores:</Text>
      <TextInput
        style={styles.input}
        value={playerName}
        onChangeText={setPlayerName}
        placeholder="Nome do jogador"
      />
      <Button title="Adicionar" onPress={handleAddPlayer} />
      
      {/* List from context.players (objects) */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.name}   // Use item.name as the key
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            {/* Display the player's name */}
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemovePlayer(item.name)}>
              <Text style={styles.removeText}>{Remove}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <Button
        title="Iniciar Jogo"
        onPress={startGame}
        disabled={players.length < 2}
      />
    </View>
  );
};

export default ConfigScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1
  },
  title: {
    fontSize: 18,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5
  },
  removeText: {
    color: 'red'
  },
});