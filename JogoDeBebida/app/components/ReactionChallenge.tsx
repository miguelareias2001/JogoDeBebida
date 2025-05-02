import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';

type Props = {
  player1: string;
  player2: string;
  onComplete: (winner: string, loser: string) => void;
};

const BUTTON_SIZE = 50;
const MARGIN = 40;

const ReactionChallenge: React.FC<Props> = ({
  player1,
  player2,
  onComplete,
}) => {
  const [currentPlayer, setCurrentPlayer] =
    useState<'player1' | 'player2'>('player1');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);

  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  /* -------------------------------------------------------- */
  /* Random delay + random position before button appears      */
  /* -------------------------------------------------------- */
  useEffect(() => {
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1‑3 s
    const timeout = setTimeout(() => {
      setStartTime(Date.now());

      // random location but keep the whole button on‑screen
      const newTop = Math.random() * (screenHeight - BUTTON_SIZE - MARGIN);
      const newLeft = Math.random() * (screenWidth - BUTTON_SIZE - MARGIN);
      setButtonPosition({ top: newTop, left: newLeft });
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentPlayer]);

  /* -------------------------------------------------------- */
  /* Once both players reacted, decide the winner              */
  /* -------------------------------------------------------- */
  useEffect(() => {
    if (player1Time !== null && player2Time !== null) {
      if (player1Time === player2Time) {
        Alert.alert('Empate!', 'Ambos devem beber!');
        onComplete('', ''); // tie
      } else {
        const winner = player1Time < player2Time ? player1 : player2;
        const loser = player1Time < player2Time ? player2 : player1;
        Alert.alert('Resultado', `${winner} venceu! ${loser} deve beber.`);
        onComplete(winner, loser);
      }
    }
  }, [player1Time, player2Time]);

  const handlePress = () => {
    if (!startTime) return;

    const reactionTime = Date.now() - startTime;
    if (currentPlayer === 'player1') {
      setPlayer1Time(reactionTime);
      setCurrentPlayer('player2');
      setStartTime(null); // wait for next player
    } else {
      setPlayer2Time(reactionTime);
    }
  };

  /* ------------------------------- */
  /* Render                          */
  /* ------------------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        {currentPlayer === 'player1'
          ? `${player1}, prepara‑te!`
          : `${player2}, prepara‑te!`}
      </Text>

      {startTime && (
        <TouchableOpacity
          style={[
            styles.button,
            { top: buttonPosition.top, left: buttonPosition.left },
          ]}
          onPress={handlePress}
        />
      )}
    </View>
  );
};

export default ReactionChallenge;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  button: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: 'red',
    borderRadius: BUTTON_SIZE / 2,
  },
});