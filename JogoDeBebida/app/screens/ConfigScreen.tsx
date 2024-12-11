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
import { useGameContext } from '../context/GameContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Config: undefined;
  Game: undefined;
};

type ConfigScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Config'>;

type Props = {
  navigation: ConfigScreenNavigationProp;
};

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [localPlayers, setLocalPlayers] = useState<string[]>([]); // Local state for players
  const { setPlayers } = useGameContext(); // Get setPlayers from GameContext

  const addPlayer = () => {
    const trimmedName = playerName.trim();
    if (trimmedName === '' || localPlayers.includes(trimmedName)) {
      Alert.alert('Erro', 'Nome inválido ou duplicado!');
      return;
    }
    setLocalPlayers([...localPlayers, trimmedName]);
    setPlayerName('');
  };

  const removePlayer = (name: string) => {
    setLocalPlayers(localPlayers.filter((player) => player !== name));
  };

  const startGame = () => {
    if (localPlayers.length < 2) {
      Alert.alert('Erro', 'Adicione pelo menos dois jogadores para iniciar o jogo.');
      return;
    }

    // Pass players to GameContext and log the transformation for debugging
    const transformedPlayers = localPlayers.map((name) => ({
      name,
      penalties: 0,
    }));
    console.log('Initialized Players:', transformedPlayers);

    setPlayers(transformedPlayers);
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
      <Button title="Adicionar" onPress={addPlayer} />
      <FlatList
        data={localPlayers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => removePlayer(item)}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Iniciar Jogo" onPress={startGame} disabled={localPlayers.length < 2} />
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