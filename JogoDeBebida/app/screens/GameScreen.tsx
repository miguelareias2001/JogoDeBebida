import React, { useEffect, useState, useRef } from 'react';
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

  // 1. DEFAULT showWheel to true so the spinning bottle appears right away
  const [showWheel, setShowWheel] = useState(true);

  const [currentPlayerName, setCurrentPlayerName] = useState<string>('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengePlayers, setChallengePlayers] = useState<{ player1: string; player2: string }>({
    player1: '',
    player2: '',
  });

  // 2. We no longer need “Next Round” logic or button. Remove `handleNextRound()`.

  // For a simple bounce animation on the chosen player's name, if you still want it
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

  // 3. We'll handle the spin result as before, but it triggers immediately on screen mount
  const handleSpinComplete = (result: string) => {
    setShowWheel(false);

    if (!result) {
      Alert.alert('Erro', 'Nenhum jogador foi selecionado.');
      return;
    }

    // If the user clicked "Reaction Challenge" segment:
    if (result === 'Reaction Challenge') {
      const chosenPlayer = selectRandomPlayer();
      if (!chosenPlayer) {
        Alert.alert('Erro', 'Nenhum jogador foi selecionado.');
        return;
      }
      const opponent = getOpponentWithFewestPenalties(chosenPlayer.name);
      if (opponent) {
        setChallengePlayers({ player1: chosenPlayer.name, player2: opponent.name });
        setShowChallenge(true);
      } else {
        incrementPenalty(chosenPlayer.name);
      }
    } else {
      // If a specific player's name was chosen
      setCurrentPlayerName(result);
      animateSelection();
      incrementPenalty(result);
    }
  };

  const handleChallengeComplete = (winner: string, loser: string) => {
    setShowChallenge(false);
    // If it's a tie, both players lose
    incrementPenalty(loser); 
    // Or, if a tie scenario is needed, handle that here

    setChallengePlayers({ player1: '', player2: '' });

    // If you want to spin again after finishing challenge:
    setShowWheel(true);
  };

  // 4. If you want to spin automatically (without a “Spin the Bottle” button),
  //    call spin() in the SpinningWheel with a useEffect, or put a small effect here.

  return (
    <View style={styles.container}>
      {showWheel ? (
        // Show the SpinningWheel right away on mount
        <SpinningWheel
          players={[...players.map(p => p.name), 'Reaction Challenge']}
          onSpinComplete={handleSpinComplete}
        />
      ) : showChallenge ? (
        // If we got “Reaction Challenge,” show the ReactionChallenge
        <ReactionChallenge
          player1={challengePlayers.player1}
          player2={challengePlayers.player2}
          onComplete={handleChallengeComplete}
        />
      ) : (
        // If neither wheel nor challenge is showing, display the chosen player
        <View style={styles.roundContainer}>
          <Animated.Text style={[styles.currentPlayer, { transform: [{ scale: scaleAnim }] }]}>
            Jogador atual: {currentPlayerName}
          </Animated.Text>
          {/* 
             Possibly you want to spin again automatically or 
             show a "Spin Again" button. This is up to your design.
          */}
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
});