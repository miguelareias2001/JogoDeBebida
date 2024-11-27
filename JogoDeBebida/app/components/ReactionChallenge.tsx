import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';

type Props = {
  player1: string;
  player2: string;
  onComplete: (winner: string, loser: string) => void;
};

const ReactionChallenge: React.FC<Props> = ({ player1, player2, onComplete }) => {
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<{ [key: string]: number | null }>({
    player1: null,
    player2: null,
  });
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Show button in a random position after a random delay
    const delay = Math.floor(Math.random() * 2000) + 1000; // Random delay between 1-2 seconds
    const timeout = setTimeout(() => {
      setStartTime(Date.now());
      setButtonPosition({
        top: Math.random() * (screenHeight - 100), // Random position on the screen
        left: Math.random() * (screenWidth - 100),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentPlayer]);

  const handlePress = () => {
    if (startTime) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes((prev) => ({
        ...prev,
        [currentPlayer]: reactionTime,
      }));

      if (currentPlayer === 'player1') {
        setCurrentPlayer('player2'); // Switch to player 2
        setStartTime(null); // Reset start time for next player
      } else {
        // Both players have finished, compare times
        const player1Time = reactionTimes.player1;
        const player2Time = reactionTime; // Current player's time
        if (player1Time !== null && player2Time !== null) {
          const winner = player1Time < player2Time ? player1 : player2;
          const loser = player1Time < player2Time ? player2 : player1;
          Alert.alert('Resultado', `${winner} venceu! ${loser} deve beber.`);
          onComplete(winner, loser); // Notify parent component
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        {currentPlayer === 'player1' ? `${player1}, prepara-te!` : `${player2}, prepara-te!`}
      </Text>
      {startTime && (
        <TouchableOpacity
          style={[styles.button, { top: buttonPosition.top, left: buttonPosition.left }]}
          onPress={handlePress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'red',
    borderRadius: 25,
  },
});

export default ReactionChallenge;
