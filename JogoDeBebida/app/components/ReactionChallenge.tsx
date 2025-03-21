import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';

// Uncomment these if using expo-av for sounds
// import { Audio } from 'expo-av';

// Uncomment if using expo-haptics
// import * as Haptics from 'expo-haptics';

type Props = {
  player1: string;
  player2: string;
  onComplete: (winner: string, loser: string) => void;
};

const BUTTON_SIZE = 50;
const MARGIN = 40;

const ReactionChallenge: React.FC<Props> = ({ player1, player2, onComplete }) => {
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [startTime, setStartTime] = useState<number | null>(null);

  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);

  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Optional: for sounds
  // const [appearSound, setAppearSound] = useState<Audio.Sound | null>(null);

  // useEffect(() => {
  //   // Load the sound
  //   Audio.Sound.createAsync(require('../assets/button_appear.mp3'))
  //     .then(({ sound }) => setAppearSound(sound))
  //     .catch(err => console.log('Error loading sound', err));
  //   return () => {
  //     if (appearSound) {
  //       appearSound.unloadAsync();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (currentPlayer !== null) {
      // Introduce a random delay before the button appears
      const delay = Math.floor(Math.random() * 2000) + 1000;
      const timeout = setTimeout(() => {
        setStartTime(Date.now());
        
        // Randomly position the button such that it remains on screen
        const newTop = Math.random() * (screenHeight - BUTTON_SIZE - MARGIN);
        const newLeft = Math.random() * (screenWidth - BUTTON_SIZE - MARGIN);
        setButtonPosition({ top: newTop, left: newLeft });

        // Optional haptic feedback
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Optional play sound
        // if (appearSound) {
        //   appearSound.replayAsync();
        // }
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentPlayer]);

  // Compare times once both players have reacted
  useEffect(() => {
    if (player1Time !== null && player2Time !== null) {
      if (player1Time === player2Time) {
        Alert.alert('Empate!', 'Ambos devem beber!');
        onComplete('', ''); // Indicate tie scenario
      } else {
        const winner = player1Time < player2Time ? player1 : player2;
        const loser = player1Time < player2Time ? player2 : player1;
        Alert.alert('Resultado', `${winner} venceu! ${loser} deve beber.`);
        onComplete(winner, loser);
      }
    }
  }, [player1Time, player2Time]);

  const handlePress = () => {
    if (startTime) {
      const reactionTime = Date.now() - startTime;
      if (currentPlayer === 'player1') {
        setPlayer1Time(reactionTime);
        setCurrentPlayer('player2');
        setStartTime(null); // Reset to wait for next player's button
      } else {
        setPlayer2Time(reactionTime);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        {currentPlayer === 'player1'
          ? `${player1}, prepara-te!`
          : `${player2}, prepara-te!`}
      </Text>
      {startTime && (
        <TouchableOpacity
          style={[styles.button, {
            top: buttonPosition.top,
            left: buttonPosition.left
          }]}
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
    padding: 20
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
    color: '#FFFFFF'
  },
  button: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: 'red',
    borderRadius: BUTTON_SIZE / 2
  },
});