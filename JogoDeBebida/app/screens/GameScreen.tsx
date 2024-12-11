import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
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
  const [opponent, setOpponent] = useState<string | null>(null);

  // Handles the end of the ReactionChallenge
  const handleChallengeComplete = (winner: string, loser: string) => {
    // Update penalties in the context based on the result
    if (winner && loser) {
      updatePenalties(winner, loser, winner === currentPlayer ? 'player2' : 'player1');
    } else {
      updatePenalties(currentPlayer!, loser, 'tie');
    }

    // Notify players about the result and reset the game state
    Alert.alert('Challenge Complete!', `${winner} won! ${loser} must drink.`);
    setIsChallenge(false);
    setOpponent(null);
  };

  // Starts a new round
  const startRound = () => {
    // Randomly select the next player
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex]?.name || 'Unknown Player';
    setCurrentPlayer(selectedPlayer);

    // Notify the selected player to drink
    Alert.alert('Selection', `${selectedPlayer}, it's your turn to drink!`);

    // Determine if a ReactionChallenge will occur (20% probability)
    if (Math.random() < 0.2) {
      // Select the opponent (player with the fewest penalties)
      const selectedOpponent = getPlayerWithFewestPenalties();
      setOpponent(selectedOpponent);
      setIsChallenge(true);

      // Announce the ReactionChallenge
      Alert.alert('Reaction Challenge', `The opponent is ${selectedOpponent}!`);
    }
  };

  return (
    <View style={styles.container}>
      {!isChallenge ? (
        <Button title="Start Round" onPress={startRound} />
      ) : (
        opponent && currentPlayer && (
          <ReactionChallenge
            player1={currentPlayer}
            player2={opponent}
            onComplete={handleChallengeComplete}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
});

export default GameScreen;
