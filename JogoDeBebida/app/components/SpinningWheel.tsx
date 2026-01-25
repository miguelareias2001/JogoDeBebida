import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';

interface SpinningBottleProps {
  options: string[];
  onSpinStart?: () => string;
  onSpinComplete?: (result: string) => void;
}

const SpinningBottle: React.FC<SpinningBottleProps> = ({
  options,
  onSpinStart,
  onSpinComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  /* ---------------- spin logic ---------------- */
  const spinBottle = () => {
    const forcedLabel = onSpinStart ? onSpinStart() : null;

    const segmentAngle = 360 / options.length;
    const fullSpins = Math.floor(Math.random() * 4) + 3; // 3‑6 full turns

    // decide which segment: either forced or random
    const targetIdx = forcedLabel
      ? options.indexOf(forcedLabel)
      : Math.floor(Math.random() * options.length);

    const finalAngle = fullSpins * 360 + targetIdx * segmentAngle;

    spinValue.setValue(0);
    setSelectedOption(null);

    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const result = options[targetIdx];
      setSelectedOption(result);
      if (onSpinComplete) onSpinComplete(result);
    });
  };

  /* -------------- interpolate rotation -------------- */
  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  /* -------------- render labels around circle -------------- */
  const renderOptions = () => {
    const radius = 120;
    return options.map((option, i) => {
      const angle = (i * 360) / options.length;
      const rad = (angle * Math.PI) / 180;
      const x = radius * Math.cos(rad);
      const y = radius * Math.sin(rad);

      return (
        <Text
          key={option}
          style={[
            styles.optionText,
            { transform: [{ translateX: x }, { translateY: y }] },
          ]}
        >
          {option}
        </Text>
      );
    });
  };

  /* ---------------- render ---------------- */
  return (
    <View style={styles.container}>
      <View style={styles.circle}>{renderOptions()}</View>

      <Animated.View style={[styles.bottle, { transform: [{ rotate: spin }] }]}>
        <View style={styles.bottleShape} />
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={spinBottle}>
        <Text style={styles.buttonText}>Spin</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SpinningBottle;

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  optionText: {
    position: 'absolute',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  bottle: {
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottleShape: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B4513',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderLeftWidth: 20,
    borderColor: '#8B4513',
  },
  button: {
    position: 'absolute',
    bottom: 100,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  buttonText: { color: '#FFF', fontSize: 16 },
});