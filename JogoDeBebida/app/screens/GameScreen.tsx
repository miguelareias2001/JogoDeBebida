import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import ReactionChallenge from '../components/ReactionChallenge';
import SpinningWheel from '../components/SpinningWheel';
import colors from '../theme/colors';

const GameScreen: React.FC = () => {
  const {
    players,
    selectRandomPlayer,
    incrementPenalty,
    getOpponentWithFewestPenalties,
  } = useGame();

  // Track whether we’re actively in a reaction challenge
  const [showChallenge, setShowChallenge] = useState(false);

  // Track the text we show under the bottle (e.g. “Jogador atual: Pedro”)
  const [currentResult, setCurrentResult] = useState<string>('');

  // For a simple bounce animation on the chosen player's name, if desired
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animateSelection = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Called when spinning finishes.
   * We never hide the bottle. We just update `currentResult`.
   */
  const handleSpinComplete = (result: string) => {
    // Clear previous message by default, 
    // but we’ll set a new message below
    setCurrentResult('');

    if (!result) {
      Alert.alert('Erro', 'Nenhum jogador foi selecionado.');
      return;
    }

    if (result === 'Reaction Challenge') {
      // Reaction challenge flow
      const chosenPlayer = selectRandomPlayer();
      if (!chosenPlayer) {
        Alert.alert('Erro', 'Nenhum jogador foi selecionado.');
        return;
      }
      const opponent = getOpponentWithFewestPenalties(chosenPlayer.name);
      if (opponent) {
        // Switch to the challenge
        setShowChallenge(true);
      } else {
        // If no valid opponent, penalize the chosen
        incrementPenalty(chosenPlayer.name);
        setCurrentResult(`${chosenPlayer.name} bebeu!`);
      }
    } else if (result === 'All players drink') {
      // Everyone gets a penalty
      players.forEach((p) => incrementPenalty(p.name));
      setCurrentResult('Todos os jogadores bebem!');
    } else {
      // It's a player name
      setCurrentResult(`Jogador atual: ${result}`);
      animateSelection();
      incrementPenalty(result);
    }
  };

  /**
   * Handle completion of ReactionChallenge.
   */
  const handleChallengeComplete = (winner: string, loser: string) => {
    setShowChallenge(false);

    // If it was a tie, you might increment both, but in your code you do:
    incrementPenalty(loser);

    // Example message:
    if (!winner && !loser) {
      setCurrentResult('Empate! Ambos beberam!');
    } else {
      setCurrentResult(`${loser} perdeu o desafio e bebeu!`);
    }
  };

  /**
   * Called by the SpinningWheel when the user clicks "Spin the Bottle".
   * We’ll clear the current message, so the user sees only the result
   * after the spin completes.
   */
  const handleSpinStart = () => {
    setCurrentResult('');
  };

  // If we’re in ReactionChallenge mode, show that full screen
  if (showChallenge) {
    // You can also overlay the challenge while still showing the bottle in the background,
    // but for simplicity, we’ll just swap screens:
    return (
      <ReactionChallenge
        player1="?" // If you want to define which players do the challenge, track them in state
        player2="?" 
        onComplete={handleChallengeComplete}
      />
    );
  }

  // Otherwise, we show the bottle + optional message
  return (
    <View style={styles.container}>
      <SpinningWheel
        items={[
          ...players.map((p) => p.name),
          'Reaction Challenge',
          'All players drink',
        ]}
        onSpinComplete={handleSpinComplete}
        onSpinStart={handleSpinStart} // We'll add this prop to clear the message
      />
      {/* 
        If you want a fancy animation on the message, you can wrap this in <Animated.View>.
      */}
      {!!currentResult && (
        <Animated.Text
          style={[
            styles.currentResultText,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {currentResult}
        </Animated.Text>
      )}
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // alignItems: 'center', // optional
    // justifyContent: 'center', // optional
  },
  currentResultText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
    // Adjust as needed to place below the bottle
  },
});