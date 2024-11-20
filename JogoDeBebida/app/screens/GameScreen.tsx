import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Animated } from 'react-native';
import ReactionChallenge from '../components/ReactionChallenge';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Config: undefined;
  Game: { players: string[] };
};

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

type Props = {
  route: GameScreenRouteProp;
};

const GameScreen: React.FC<Props> = ({ route }) => {
  const { players } = route.params;
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [animation] = useState(new Animated.Value(0));

  const selectPlayer = () => {
    setDisabled(true);
    const randomIndex = Math.floor(Math.random() * players.length);
    const player = players[randomIndex];
    setSelectedPlayer(player);

    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();

    const challenge = Math.random() < 0.5;
    setIsChallenge(challenge);

    setTimeout(() => {
      setDisabled(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Button title="Sortear" onPress={selectPlayer} disabled={disabled} />
      {selectedPlayer && !isChallenge && (
        <Animated.View style={{ opacity: animation }}>
          <Text style={styles.selectedPlayer}>{`Bebe, ${selectedPlayer}!`}</Text>
        </Animated.View>
      )}
      {selectedPlayer && isChallenge && (
        <ReactionChallenge player={selectedPlayer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  selectedPlayer: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
});

export default GameScreen;
