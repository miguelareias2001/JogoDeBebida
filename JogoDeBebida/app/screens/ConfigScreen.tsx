import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Constants
import { Remove } from '../constants/gameConfig';

type RootStackParamList = {
  Config: undefined;
  Game: { players: string[] };
};

type ConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Config'>;

type Props = {
  navigation: ConfigScreenNavigationProp;
};

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);

  const addPlayer = () => {
    const trimmedName = playerName.trim();
    if (trimmedName === '' || players.includes(trimmedName)) {
      Alert.alert('Erro', 'Nome inválido ou duplicado!');
      return;
    }
    setPlayers([...players, trimmedName]);
    setPlayerName('');
  };

  const removePlayer = (name: string) => {
    setPlayers(players.filter(player => player !== name));
  };

  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Erro', 'Adicione pelo menos dois jogadores para iniciar o jogo.');
      return;
    }
    navigation.navigate('Game', { players });
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
      <Button title="Adicionar" onPress={addPlayer} />
      <FlatList
        data={players}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => removePlayer(item)}>
              <Text style={styles.removeText}>{Remove}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Iniciar Jogo" onPress={startGame} disabled={players.length < 2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  playerItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
  removeText: { color: 'red' },
});

export default ConfigScreen;
