import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/GameContext';

type RootStackParamList = {
  Config: undefined;
  Game: undefined;
  End: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'End'>;

interface Props {
  navigation: NavProp;
}

const FUNNY_TITLES = [
  "Tonight's Hydration Champions 💧",
  "Legends of the Sip 🏆",
  "The Thirstiest Souls of the Evening 🫗",
  "Hall of Sips 🎖️",
  "Most Devoted to the Cause 🥂",
  "The Ones Who Gave Everything 🫡",
];

const MEDALS = ['🥇', '🥈', '🥉'];

const EndScreen: React.FC<Props> = ({ navigation }) => {
  const { players, resetGame } = useGame();

  // Sort players by penalties descending
  const ranked = [...players].sort((a, b) => b.penalties - a.penalties);
  const maxPenalties = ranked[0]?.penalties ?? 1;

  // Pick a random funny title
  const title = FUNNY_TITLES[Math.floor(Math.random() * FUNNY_TITLES.length)];

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    navigation.navigate('Config');
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>GAME OVER</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Leaderboard */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {ranked.map((player, index) => {
            const barWidth = maxPenalties > 0 ? (player.penalties / maxPenalties) * 100 : 0;
            const isWinner = index === 0;
            return (
              <View key={player.name} style={[styles.row, isWinner && styles.rowWinner]}>
                {/* Rank */}
                <Text style={styles.medal}>
                  {index < 3 ? MEDALS[index] : `${index + 1}.`}
                </Text>

                {/* Name + bar */}
                <View style={styles.rowCenter}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.playerName, isWinner && styles.playerNameWinner]}>
                      {player.name}
                    </Text>
                    <Text style={[styles.sipsCount, isWinner && styles.sipsCountWinner]}>
                      {player.penalties} {player.penalties === 1 ? 'sip' : 'sips'}
                    </Text>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${barWidth}%` as any },
                        isWinner && styles.barFillWinner,
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Play again */}
        <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain} activeOpacity={0.85}>
          <Text style={styles.playAgainText}>PLAY AGAIN 🍻</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default EndScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    overflow: 'hidden',
  },

  bgCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FF4B6E',
    opacity: 0.05,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#7A28FF',
    opacity: 0.07,
    bottom: 60,
    left: -60,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    color: '#FF4B6E',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 34,
  },

  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 14,
  },
  rowWinner: {
    borderColor: '#FF4B6E',
    backgroundColor: '#1E0A0F',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  medal: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },

  rowCenter: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#CCC',
  },
  playerNameWinner: {
    color: '#FFF',
    fontSize: 19,
  },
  sipsCount: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  sipsCountWinner: {
    color: '#FF4B6E',
    fontWeight: '800',
    fontSize: 14,
  },

  barTrack: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#7A28FF',
    borderRadius: 2,
  },
  barFillWinner: {
    backgroundColor: '#FF4B6E',
  },

  playAgainBtn: {
    height: 60,
    backgroundColor: '#00C9A7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
});