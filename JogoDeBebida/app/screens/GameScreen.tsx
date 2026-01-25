import React, { useState, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
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

  /* ---------- local state ---------- */
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengePlayers, setChallengePlayers] = useState<{ p1: string; p2: string }>({ p1: '', p2: '' });
  const [currentResult, setCurrentResult] = useState<string>('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animate = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
    ]).start();
  };

  /* Decide the label the bottle will land on ------------- */
  const handleSpinStart = (): string => {
    const rand = Math.random();
    const probAll = 1 / (players.length + 1);
    if (rand < probAll) return 'All players drink';

    const idx = Math.floor(((rand - probAll) / (1 - probAll)) * players.length);
    return players[idx].name;
  };

  /* After the spin finishes ------------------------------ */
  const handleSpinComplete = (label: string) => {
    if (label === 'All players drink') {
      players.forEach(p => incrementPenalty(p.name));
      setCurrentResult('Todos os jogadores bebem!');
      return;
    }

    /* label is a player ---------------------------------- */
    const maybeChallenge = Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY;
    if (maybeChallenge) {
      const opponent = getOpponentWithFewestPenalties(label);
      if (opponent) {
        setChallengePlayers({ p1: label, p2: opponent.name });
        setShowChallenge(true);
        return;                // ⬅ nothing else until challenge ends
      }
    }

    /* normal penalty ------------------------------------- */
    incrementPenalty(label);
    setCurrentResult(`Jogador atual: ${label}`);
    animate();
  };

  /* When the ReactionChallenge finishes ------------------ */
  const handleChallengeComplete = (_winner: string, loser: string) => {
    setShowChallenge(false);
    if (loser) incrementPenalty(loser);
    setCurrentResult(`${loser} perdeu o desafio e bebeu!`);
    animate();
  };

  /* ------------------------------------------------------ */
  /* Render                                                 */
  /* ------------------------------------------------------ */
  if (showChallenge) {
    return (
      <ReactionChallenge
        player1={challengePlayers.p1}
        player2={challengePlayers.p2}
        onComplete={handleChallengeComplete}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SpinningBottle
        options={[...players.map(p => p.name), 'All players drink']}
        onSpinStart={handleSpinStart}
        onSpinComplete={handleSpinComplete}
      />

      {!!currentResult && (
        <Animated.Text
          style={[styles.resultText, { transform: [{ scale: scaleAnim }] }]}
        >
          {currentResult}
        </Animated.Text>
      )}
    </View>
  );
};

export default GameScreen;

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  resultText: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 22,
    color: '#fff',
  },
});