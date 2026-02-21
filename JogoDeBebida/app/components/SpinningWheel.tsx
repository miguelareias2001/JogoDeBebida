import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface SpinningBottleProps {
  options: string[];
  onSpinStart?: () => string;
  onSpinComplete?: (result: string) => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_W - 48, 320);
const RADIUS = WHEEL_SIZE / 2 - 28;

const SpinningBottle: React.FC<SpinningBottleProps> = ({
  options,
  onSpinStart,
  onSpinComplete,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const pulseGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopGlow = () => {
    glowAnim.stopAnimation();
    glowAnim.setValue(0);
  };

  const spinBottle = () => {
    if (isSpinning) return;

    const forcedLabel = onSpinStart ? onSpinStart() : null;
    const segmentAngle = 360 / options.length;
    const fullSpins = Math.floor(Math.random() * 4) + 5;

    const targetIdx = forcedLabel
      ? options.indexOf(forcedLabel)
      : Math.floor(Math.random() * options.length);

    const targetSegmentCenter = targetIdx * segmentAngle + segmentAngle / 2;
    const delta = fullSpins * 360 + targetSegmentCenter;
    const newTotal = totalRotation.current + delta;

    setIsSpinning(true);
    setSelectedOption(null);
    pulseGlow();

    Animated.timing(spinValue, {
      toValue: newTotal,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      totalRotation.current = newTotal;
      const result = options[targetIdx];
      setSelectedOption(result);
      setIsSpinning(false);
      stopGlow();
      if (onSpinComplete) onSpinComplete(result);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [totalRotation.current, totalRotation.current + 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const renderOptions = () => {
    return options.map((option, i) => {
      const angle = (i * 360) / options.length - 90;
      const rad = (angle * Math.PI) / 180;
      const x = RADIUS * Math.cos(rad);
      const y = RADIUS * Math.sin(rad);
      const isAll = option === 'All players drink';

      return (
        <View
          key={option}
          style={[
            styles.labelContainer,
            {
              transform: [{ translateX: x }, { translateY: y }],
            },
          ]}
        >
          <View style={[styles.labelPill, isAll && styles.labelPillAll]}>
            <Text style={[styles.optionText, isAll && styles.optionTextAll]} numberOfLines={1}>
              {isAll ? '🍺 ALL' : option}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Outer ring glow */}
      <Animated.View style={[styles.outerGlow, { opacity: glowOpacity }]} />

      {/* Wheel ring */}
      <View style={[styles.wheelRing, { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2 }]}>
        {/* Tick marks on ring */}
        {options.map((_, i) => {
          const angle = (i * 360) / options.length - 90;
          return (
            <View
              key={i}
              style={[
                styles.tickMark,
                {
                  transform: [
                    { rotate: `${angle + 90}deg` },
                    { translateY: -(WHEEL_SIZE / 2 - 4) },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Spinning group: bottle + labels */}
        <Animated.View style={[styles.spinnerGroup, { transform: [{ rotate: spin }] }]}>
          {/* Labels */}
          {renderOptions()}

          {/* Bottle shape */}
          <View style={styles.bottleWrapper}>
            {/* Bottle neck */}
            <View style={styles.bottleNeck} />
            {/* Bottle body */}
            <View style={styles.bottleBody}>
              <View style={styles.bottleShine} />
            </View>
            {/* Bottle cap */}
            <View style={styles.bottleCap} />
          </View>
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot}>
          <View style={styles.centerDotInner} />
        </View>
      </View>

      {/* Pointer / indicator at top */}
      <View style={styles.pointer} />

      {/* Spin button */}
      <TouchableOpacity
        style={[styles.spinBtn, isSpinning && styles.spinBtnSpinning]}
        onPress={spinBottle}
        disabled={isSpinning}
        activeOpacity={0.85}
      >
        <Text style={styles.spinBtnText}>
          {isSpinning ? '...' : 'SPIN'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SpinningBottle;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },

  outerGlow: {
    position: 'absolute',
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    borderRadius: (WHEEL_SIZE + 40) / 2,
    backgroundColor: '#FF4B6E',
    top: -20,
    zIndex: -1,
  },

  wheelRing: {
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#FF4B6E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },

  tickMark: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#FF4B6E',
    borderRadius: 1,
    top: '50%',
    left: '50%',
    marginLeft: -1,
    marginTop: -5,
  },

  spinnerGroup: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Labels */
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelPill: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#7A28FF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    maxWidth: 72,
  },
  labelPillAll: {
    borderColor: '#FF4B6E',
    backgroundColor: '#2A0A10',
  },
  optionText: {
    fontSize: 9,
    color: '#CCC',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  optionTextAll: {
    color: '#FF4B6E',
    fontSize: 8,
  },

  /* Bottle */
  bottleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    left: '50%',
    top: '50%',
    marginTop: -12,
  },
  bottleCap: {
    width: 10,
    height: 14,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    marginLeft: -1,
  },
  bottleNeck: {
    width: 28,
    height: 12,
    backgroundColor: '#2ECC71',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  bottleBody: {
    width: 58,
    height: 24,
    backgroundColor: '#27AE60',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bottleShine: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 36,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },

  /* Center */
  centerDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4B6E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  centerDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },

  /* Pointer */
  pointer: {
    position: 'absolute',
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF4B6E',
    zIndex: 20,
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  /* Spin button */
  spinBtn: {
    width: 120,
    height: 52,
    backgroundColor: '#FF4B6E',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4B6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  spinBtnSpinning: {
    backgroundColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
  },
  spinBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
});