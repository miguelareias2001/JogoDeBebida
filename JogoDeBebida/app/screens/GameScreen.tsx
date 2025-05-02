import React, { useState, useRef } from 'react';
import { View, Animated, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import ReactionChallenge from '../components/ReactionChallenge';
import colors from '../theme/colors';
import GAME_CONFIG from '../constants/gameConfig';
import SpinningBottle from '../components/SpinningWheel';

const GameScreen: React.FC = () => {
  const {
    players,
    incrementPenalty,
    getOpponentWithFewestPenalties,
  } = useGame();

  const [showChallenge, setShowChallenge] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateSelection = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  /* Decide what will be spun to */
  const handleSpinStart = (): string => {
    const rand = Math.random();
    const fractionAll = 1 / (players.length + 1);

    if (rand < fractionAll) return 'All players drink';

    const offsetRand = (rand - fractionAll) / (1 - fractionAll);
    const idx = Math.floor(offsetRand * players.length);
    return players[idx].name;
  };

  /* After spin ends */
  const handleSpinComplete = (result: string) => {
    if (result === 'All players drink') {
      players.forEach((p) => incrementPenalty(p.name));
      setCurrentResult('Todos os jogadores bebem!');
      return;
    }

    /*  --- got a player --- */
    if (Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY) {
      const opponent = getOpponentWithFewestPenalties(result);
      if (opponent) {
        // you could pass real names; for now just open challenge screen
        setShowChallenge(true);
        return;
      }
    }
    // normal penalty
    incrementPenalty(result);
    setCurrentResult(`Jogador atual: ${result}`);
    animateSelection();
  };

  /* After challenge screen */
  const handleChallengeComplete = (winner: string, loser: string) => {
    setShowChallenge(false);
    if (loser) incrementPenalty(loser);
    setCurrentResult(`${loser} perdeu o desafio e bebeu!`);
  };

  if (showChallenge) {
    return (
      <ReactionChallenge
        player1="?"
        player2="?"
        onComplete={handleChallengeComplete}
      />
    );
  }

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
    fontSize: 22,           // DÚVIDA: estas definições não são redundantes? encontrei o equivalente a isto no "SpinningWheel.tsx"
    textAlign: 'center',
    marginTop: 20,
  },
});
