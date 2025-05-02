import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/GameContext';
import { Remove } from '../constants/gameConfig';

type RootStackParamList = {
  Config: undefined;
  Game: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'Config'>;

interface Props {
  navigation: NavProp;
}

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');

  const { players, addPlayer, removePlayer } = useGame();

  const handleAdd = () => {
    const ok = addPlayer(playerName);
    if (!ok) Alert.alert('Erro', 'Nome inválido ou duplicado!');
    setPlayerName('');
  };

  const handleRemove = (name: string) => removePlayer(name);

  const handleStart = () => {
    if (players.length < 2) {
      Alert.alert('Erro', 'Adicione pelo menos dois jogadores.');
      return;
    }
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogadores</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do jogador"
        value={playerName}
        onChangeText={setPlayerName}
      />
      <Button title="Adicionar" onPress={handleAdd} />

      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemove(item.name)}>
              <Text style={styles.removeText}>{Remove}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Button
        title="Iniciar Jogo"
        onPress={handleStart}
        disabled={players.length < 2}
      />
    </View>
  );
};

export default ConfigScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  removeText: { color: 'red' },
});