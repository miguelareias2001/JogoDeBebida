import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import GAME_CONFIG, { Remove } from '../constants/gameConfig';
import colors from '../theme/colors';

const ConfigScreen: React.FC = () => {
  const navigation = useNavigation();
  const { players, addPlayer, removePlayer } = useGame();

  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = () => {
    const success = addPlayer(playerName);
    if (!success) {
      setError('Nome inválido ou duplicado!');
    } else {
      setError(null);
      setPlayerName('');
    }
  };

  const handleStartGame = () => {
    // Navigate to Game Screen
    navigation.navigate('Game' as never);
  };

  const canStartGame = players.length >= GAME_CONFIG.MIN_PLAYERS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Jogadores</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do jogador"
          placeholderTextColor={colors.textSecondary}
          value={playerName}
          onChangeText={setPlayerName}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{item.name}</Text>
            <TouchableOpacity onPress={() => removePlayer(item.name)}>
              <Text style={styles.removeText}>{Remove}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.startButton, { opacity: canStartGame ? 1 : 0.5 }]}
        onPress={handleStartGame}
        disabled={!canStartGame}
      >
        <Text style={styles.startButtonText}>
          {canStartGame ? 'Iniciar Jogo' : 'Mínimo 2 jogadores'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfigScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  playerName: {
    color: colors.text,
    fontSize: 16,
  },
  removeText: {
    color: colors.error,
    fontSize: 16,
  },
  startButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});