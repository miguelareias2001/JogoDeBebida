import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import ReactionChallenge from '../components/ReactionChallenge';
import { useGameContext } from '../context/GameContext';

const GameScreen: React.FC = () => {
  const {
    players,
    currentPlayer,
    setCurrentPlayer,
    getPlayerWithFewestPenalties,
    updatePenalties,
  } = useGameContext();
  const [isChallenge, setIsChallenge] = useState(false);

  const handleChallengeComplete = (winner: string, loser: string) => {
    // Determine result based on winner
    if (winner && loser) {
      updatePenalties(winner, loser, 'player1');
    } else {
      updatePenalties(currentPlayer!, loser, 'tie');
    }

    // Notify players and reset the state
    Alert.alert('Desafio Concluído!', `${winner} venceu! ${loser} deve beber novamente.`);
    setIsChallenge(false);
  };

  const startReactionChallenge = () => {
    const opponent = getPlayerWithFewestPenalties();
    setIsChallenge(true);
    Alert.alert('Batalha de Reflexos', `O oponente é ${opponent}!`);
  };

  return (
    <View style={styles.container}>
      {!isChallenge ? (
        <Button title="Iniciar Batalha" onPress={startReactionChallenge} />
      ) : (
        <ReactionChallenge
          player1={currentPlayer!}
          player2={getPlayerWithFewestPenalties()}
          onComplete={handleChallengeComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
});

export default GameScreen;
