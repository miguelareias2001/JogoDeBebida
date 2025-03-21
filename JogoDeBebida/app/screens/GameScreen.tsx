import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import ReactionChallenge from '../components/ReactionChallenge';
import colors from '../theme/colors';

const GameScreen: React.FC = () => {
  const {
    players,
    selectRandomPlayer,
    getFewestPenaltiesPlayer,
    incrementPenalty,
    maybeTriggerChallenge,
    getOpponentWithFewestPenalties,
  } = useGame();
  
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengePlayers, setChallengePlayers] = useState<{ player1: string; player2: string }>({
    player1: '',
    player2: '',
  });

  // For simple bounce animation on chosen player
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

  const handleNextRound = () => {
    const chosenPlayer = selectRandomPlayer();
    setCurrentPlayerName(chosenPlayer.name);
    animateSelection();

    if (maybeTriggerChallenge()) {
      const opponent = getOpponentWithFewestPenalties(chosenPlayer.name);
      if (opponent) {
        setChallengePlayers({
          player1: chosenPlayer.name,
          player2: opponent.name,
        });
        setShowChallenge(true);
      } else {
        incrementPenalty(chosenPlayer.name);
      }
    } else {
      incrementPenalty(chosenPlayer.name);
    }
  };

  const handleChallengeComplete = (winner: string, loser: string) => {
    setShowChallenge(false);
    // If it's a tie, both players lose
    if (!winner && !loser) {
      // tie scenario
      incrementPenalty(challengePlayers.player1);
      incrementPenalty(challengePlayers.player2);
    } else {
      incrementPenalty(loser);
    }
    // Reset for next round
    setChallengePlayers({ player1: '', player2: '' });
  };

  useEffect(() => {
  }, []);

  return (
    <View style={styles.container}>
      {showChallenge ? (
        <ReactionChallenge
          player1={challengePlayers.player1}
          player2={challengePlayers.player2}
          onComplete={handleChallengeComplete}
        />
      ) : (
        <View style={styles.roundContainer}>
          <Animated.Text
            style={[
              styles.currentPlayer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            Jogador atual: {currentPlayerName}
          </Animated.Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
            <Text style={styles.buttonText}>Próxima Rodada</Text>
          </TouchableOpacity>
        </View>
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
  roundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  currentPlayer: {
    color: colors.text,
    fontSize: 24,
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});