import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';

type Props = {
  player1: string;
  player2: string;
  onComplete: (winner: string, loser: string) => void;
};

const BUTTON_SIZE = 70;
const MARGIN = 60;

const ReactionChallenge: React.FC<Props> = ({ player1, player2, onComplete }) => {
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'ready' | 'done'>('intro');
  const [countdown, setCountdown] = useState(3);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonAppear = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;
  const bgFlash = useRef(new Animated.Value(0)).current;

  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  /* Countdown intro before each player */
  useEffect(() => {
    if (phase !== 'intro') return;
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      Animated.sequence([
        Animated.timing(countdownAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        Animated.timing(countdownAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      if (count === 0) {
        clearInterval(interval);
        setPhase('waiting');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentPlayer]);

  /* Random delay then show button */
  useEffect(() => {
    if (phase !== 'waiting') return;

    const delay = Math.floor(Math.random() * 3000) + 2000;
    const timeout = setTimeout(() => {
      const newTop = MARGIN + Math.random() * (screenHeight * 0.5 - BUTTON_SIZE - MARGIN);
      const newLeft = MARGIN / 2 + Math.random() * (screenWidth - BUTTON_SIZE - MARGIN);
      setButtonPosition({ top: newTop, left: newLeft });
      setStartTime(Date.now());
      setPhase('ready');

      /* Button appear animation */
      buttonAppear.setValue(0);
      Animated.spring(buttonAppear, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }).start();

      /* Flash background */
      Animated.sequence([
        Animated.timing(bgFlash, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(bgFlash, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      /* Pulse the button */
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [phase]);

  /* Both players done — compute result */
  useEffect(() => {
    if (player1Time === null || player2Time === null) return;

    if (player1Time === player2Time) {
      Alert.alert('🤝 Tie!', 'Both players drink!', [
        { text: 'Fair enough', onPress: () => onComplete('', '') },
      ]);
    } else {
      const winner = player1Time < player2Time ? player1 : player2;
      const loser = player1Time < player2Time ? player2 : player1;
      const diff = Math.abs(player1Time - player2Time);
      Alert.alert(
        '🏆 Result!',
        `${winner} wins by ${diff}ms!\n${loser} DRINKS! 🍺`,
        [{ text: "Let's go!", onPress: () => onComplete(winner, loser) }]
      );
    }
  }, [player1Time, player2Time]);

  const handlePress = () => {
    if (!startTime || phase !== 'ready') return;

    pulseLoop.current?.stop();
    const reactionTime = Date.now() - startTime;

    if (currentPlayer === 'player1') {
      setPlayer1Time(reactionTime);
      setCurrentPlayer('player2');
      setPhase('intro');
      setStartTime(null);
    } else {
      setPlayer2Time(reactionTime);
      setPhase('done');
    }
  };

  const activeName = currentPlayer === 'player1' ? player1 : player2;
  const bgFlashColor = bgFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,75,110,0)', 'rgba(255,75,110,0.25)'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.flashOverlay, { backgroundColor: bgFlashColor }]} pointerEvents="none" />

      {/* vs header */}
      <View style={styles.vsHeader}>
        <View style={[styles.vsChip, currentPlayer === 'player1' && styles.vsChipActive]}>
          <Text style={styles.vsChipText}>{player1}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={[styles.vsChip, currentPlayer === 'player2' && styles.vsChipActive]}>
          <Text style={styles.vsChipText}>{player2}</Text>
        </View>
      </View>

      {/* Main area */}
      <View style={styles.main}>
        {phase === 'intro' && (
          <View style={styles.introArea}>
            <Text style={styles.playerTurnText}>{activeName}</Text>
            <Text style={styles.getReadyText}>GET READY</Text>
            <Animated.Text style={[styles.countdownText, { transform: [{ scale: countdownAnim }] }]}>
              {countdown > 0 ? countdown : '⚡'}
            </Animated.Text>
          </View>
        )}

        {phase === 'waiting' && (
          <View style={styles.waitingArea}>
            <Text style={styles.playerTurnText}>{activeName}</Text>
            <Text style={styles.waitingText}>WAIT FOR IT...</Text>
            <View style={styles.waitingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>
          </View>
        )}

        {phase === 'ready' && (
          <TouchableOpacity
            style={[
              styles.tapButton,
              {
                top: buttonPosition.top,
                left: buttonPosition.left,
              },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.tapButtonInner,
                {
                  transform: [
                    { scale: Animated.multiply(pulseAnim, buttonAppear) },
                  ],
                },
              ]}
            >
              <Text style={styles.tapText}>TAP!</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom instruction */}
      <View style={styles.bottomHint}>
        {phase === 'ready' && (
          <Text style={styles.hintText}>TAP AS FAST AS YOU CAN!</Text>
        )}
        {phase === 'waiting' && (
          <Text style={styles.hintText}>Don't tap early or you lose!</Text>
        )}
      </View>
    </View>
  );
};

export default ReactionChallenge;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  /* vs header */
  vsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 16,
    zIndex: 2,
  },
  vsChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#333',
    alignItems: 'center',
  },
  vsChipActive: {
    borderColor: '#FF4B6E',
    backgroundColor: '#2A0A10',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  vsChipText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  vsText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  /* main content area */
  main: {
    flex: 1,
    zIndex: 2,
  },

  /* intro countdown */
  introArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playerTurnText: {
    fontSize: 28,
    color: '#FF4B6E',
    fontWeight: '900',
    letterSpacing: 1,
  },
  getReadyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 4,
  },
  countdownText: {
    fontSize: 96,
    color: '#FFF',
    fontWeight: '900',
    marginTop: 8,
  },

  /* waiting */
  waitingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  waitingText: {
    fontSize: 16,
    color: '#7A28FF',
    fontWeight: '800',
    letterSpacing: 4,
  },
  waitingDots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7A28FF',
    opacity: 0.6,
  },

  /* tap button */
  tapButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  tapButtonInner: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FF4B6E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 14,
  },
  tapText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  /* bottom hint */
  bottomHint: {
    paddingBottom: 48,
    alignItems: 'center',
    zIndex: 2,
  },
  hintText: {
    fontSize: 12,
    color: '#444',
    letterSpacing: 2,
    fontWeight: '600',
  },
});