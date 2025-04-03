import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import ReactionChallenge from '../components/ReactionChallenge';
import colors from '../theme/colors';
import GAME_CONFIG from '../constants/gameConfig';
import SpinningBottle from '../components/SpinningWheel';

const GameScreen: React.FC = () => {
  const {
    players,
    selectRandomPlayer,
    incrementPenalty,
    getOpponentWithFewestPenalties,
  } = useGame();

  // Whether ReactionChallenge is active
  const [showChallenge, setShowChallenge] = useState(false);

  // Current message under the bottle
  const [currentResult, setCurrentResult] = useState<string>('');

  // For a bounce animation on the chosen player's name (optional)
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
   * This is called *after* we've decided who the bottle lands on,
   * but *before* the spin is animated.
   *
   * In this updated approach, we do *one* random pick:
   * either "All players drink" or a specific player.
   * We'll remove direct "Reaction Challenge" from the wheel items.
   */
  const handleSpinStart = (): string => {
    const randomValue = Math.random();
    let result: string;

    // Suppose we want 1 slot for "All players drink" and the rest are players:
    // The fraction for "All players drink" is 1 / (players.length + 1).
    const fractionAllDrink = 1 / (players.length + 1);

    if (randomValue < fractionAllDrink) {
      // "All players drink"
      result = 'All players drink';
    } else {
      // Pick a player
      const availablePlayers = players.map((p) => p.name);
      // We'll offset randomValue by fractionAllDrink, then scale
      const randomForPlayers = (randomValue - fractionAllDrink) / (1 - fractionAllDrink);
      const playerIndex = Math.floor(randomForPlayers * availablePlayers.length);
      result = availablePlayers[playerIndex];
    }

    // Clear the old message
    setCurrentResult('');
    return result;
  };

  /**
   * Called after the spin animation finishes, with the final `result`.
   * If it's "All players drink," we do that. If it's a player,
   * we do a second random check for Reaction Challenge.
   */
  const handleSpinComplete = (result: string) => {
    if (result === 'All players drink') {
      // Everyone drinks
      players.forEach((p) => incrementPenalty(p.name));
      setCurrentResult('Todos os jogadores bebem!');
    } else {
      // We got a player. Possibly do Reaction Challenge with probability 0.2
      if (Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY) {
        // Reaction challenge flow
        const chosenPlayer = players.find((p) => p.name === result);
        if (!chosenPlayer) {
          Alert.alert('Erro', 'Nenhum jogador foi selecionado.');
          return;
        }
        const opponent = getOpponentWithFewestPenalties(chosenPlayer.name);
        if (opponent) {
          setShowChallenge(true);
        } else {
          // If no valid opponent, penalize the chosen
          incrementPenalty(chosenPlayer.name);
          setCurrentResult(`${chosenPlayer.name} bebeu!`);
        }
      } else {
        // Normal penalize
        setCurrentResult(`Jogador atual: ${result}`);
        animateSelection();
        incrementPenalty(result);
      }
    }
  };

  /**
   * If ReactionChallenge finishes:
   */
  const handleChallengeComplete = (winner: string, loser: string) => {
    setShowChallenge(false);

    // If tie, you might do something else, but for now:
    incrementPenalty(loser);

    if (!winner && !loser) {
      setCurrentResult('Empate! Ambos beberam!');
    } else {
      setCurrentResult(`${loser} perdeu o desafio e bebeu!`);
    }
  };

  // If we’re in ReactionChallenge mode, show that full screen
  if (showChallenge) {
    return (
      <ReactionChallenge
        player1="?" // If you want to pass the actual chosen player, store them in state
        player2="?"
        onComplete={handleChallengeComplete}
      />
    );
  }

  // Otherwise, show the bottle + any message
  return (
    <View style={styles.container}>
      <SpinningBottle options={[...players.map((p) => p.name), 'All players drink']} />
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
  },
  currentResultText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
  },
});