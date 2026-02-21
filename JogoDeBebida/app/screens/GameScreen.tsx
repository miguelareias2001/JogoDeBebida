import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/GameContext';
import ReactionChallenge from '../components/ReactionChallenge';
import GAME_CONFIG from '../constants/gameConfig';
import SpinningBottle from '../components/SpinningWheel';

type RootStackParamList = {
  Config: undefined;
  Game: undefined;
  End: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: NavProp;
}

const GameScreen: React.FC<Props> = ({ navigation }) => {
  const { players, incrementPenalty, getOpponentWithFewestPenalties } = useGame();

  const [showChallenge, setShowChallenge] = useState(false);
  const [challengePlayers, setChallengePlayers] = useState<{ p1: string; p2: string }>({ p1: '', p2: '' });
  const [currentResult, setCurrentResult] = useState<string>('');
  const [resultEmoji, setResultEmoji] = useState<string>('🍺');
  const [isAllDrink, setIsAllDrink] = useState(false);
  const [roundCount, setRoundCount] = useState(0);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;

  const showResult = (message: string, emoji: string, all = false) => {
    setCurrentResult(message);
    setResultEmoji(emoji);
    setIsAllDrink(all);
    setRoundCount(r => r + 1);

    cardAnim.setValue(0);
    cardScale.setValue(0.8);
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleSpinStart = (): string => {
    const rand = Math.random();
    const probAll = 1 / (players.length + 1);
    if (rand < probAll) return 'All players drink';
    const idx = Math.floor(((rand - probAll) / (1 - probAll)) * players.length);
    return players[idx].name;
  };

  const handleSpinComplete = (label: string) => {
    if (label === 'All players drink') {
      players.forEach(p => incrementPenalty(p.name));
      showResult('Everyone drinks!', '🍻', true);
      return;
    }

    const maybeChallenge = Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY;
    if (maybeChallenge) {
      const opponent = getOpponentWithFewestPenalties(label);
      if (opponent) {
        setChallengePlayers({ p1: label, p2: opponent.name });
        setShowChallenge(true);
        return;
      }
    }

    incrementPenalty(label);
    showResult(`${label} drinks!`, '🍺');
  };

  const handleChallengeComplete = (_winner: string, loser: string) => {
    setShowChallenge(false);
    if (loser) {
      incrementPenalty(loser);
      showResult(`${loser} lost the challenge!`, '😵');
    } else {
      showResult('Both players drink!', '🍻', true);
    }
  };

  const cardOpacity = cardAnim;
  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

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
      <StatusBar barStyle="light-content" />

      {/* bg decorations */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.roundLabel}>ROUND {roundCount > 0 ? roundCount : '—'}</Text>
            <Text style={styles.headerTitle}>SPIN IT</Text>
          </View>
          <TouchableOpacity style={styles.finishBtn} onPress={() => navigation.navigate('End')} activeOpacity={0.8}>
            <Text style={styles.finishBtnText}>END</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wheel */}
      <View style={styles.wheelArea}>
        <SpinningBottle
          options={[...players.map(p => p.name), 'All players drink']}
          onSpinStart={handleSpinStart}
          onSpinComplete={handleSpinComplete}
        />
      </View>

      {/* Result card */}
      {!!currentResult && (
        <Animated.View
          style={[
            styles.resultCard,
            isAllDrink && styles.resultCardAll,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          <Text style={styles.resultEmoji}>{resultEmoji}</Text>
          <Text style={[styles.resultText, isAllDrink && styles.resultTextAll]}>
            {currentResult}
          </Text>
        </Animated.View>
      )}

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <Text style={styles.scoreboardTitle}>PENALTIES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreboardInner}>
          {players.map((p) => (
            <View key={p.name} style={styles.scoreChip}>
              <Text style={styles.scoreChipName} numberOfLines={1}>{p.name}</Text>
              <View style={styles.scoreChipBadge}>
                <Text style={styles.scoreChipCount}>{p.penalties}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    overflow: 'hidden',
  },

  bgBlob1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF4B6E',
    opacity: 0.05,
    top: -60,
    left: -60,
  },
  bgBlob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#7A28FF',
    opacity: 0.07,
    bottom: 80,
    right: -50,
  },

  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 11,
    color: '#00C9A7',
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  finishBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  finishBtnText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },

  wheelArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },

  /* Result card */
  resultCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#00C9A7',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  resultCardAll: {
    borderColor: '#7A28FF',
    shadowColor: '#7A28FF',
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#00C9A7',
    letterSpacing: 0.3,
  },
  resultTextAll: {
    color: '#7A28FF',
  },

  /* Scoreboard */
  scoreboard: {
    paddingHorizontal: 24,
    gap: 10,
  },
  scoreboardTitle: {
    fontSize: 10,
    color: '#555',
    fontWeight: '700',
    letterSpacing: 3,
  },
  scoreboardInner: {
    gap: 8,
    paddingRight: 8,
  },
  scoreChip: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minWidth: 70,
    flexDirection: 'row',
    gap: 8,
  },
  scoreChipName: {
    color: '#CCC',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 70,
  },
  scoreChipBadge: {
    backgroundColor: '#00C9A7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  scoreChipCount: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
});