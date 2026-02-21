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

// Distinct neon colour per player slot
const LABEL_COLORS = [
  '#FF4B6E', // pink
  '#7A28FF', // purple
  '#00C9A7', // teal
  '#FFB800', // amber
  '#00AEEF', // sky blue
  '#FF6B35', // orange
  '#CC00FF', // magenta
  '#39FF14', // neon green
];

const SpinningBottle: React.FC<SpinningBottleProps> = ({
  options,
  onSpinStart,
  onSpinComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  /* ---------------- spin logic — ORIGINAL, untouched ---------------- */
  const spinBottle = () => {
    const forcedLabel = onSpinStart ? onSpinStart() : null;
    const segmentAngle = 360 / options.length;
    const fullSpins = Math.floor(Math.random() * 4) + 3;

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

  /* -------------- interpolate rotation — ORIGINAL, untouched -------------- */
  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  /* -------------- render labels — original positioning, upgraded visuals -------------- */
  const renderOptions = () => {
    const radius = 120;
    return options.map((option, i) => {
      const angle = (i * 360) / options.length;
      const rad = (angle * Math.PI) / 180;
      const x = radius * Math.cos(rad);
      const y = radius * Math.sin(rad);
      const isAll = option === 'All players drink';
      const isSelected = selectedOption === option;
      const color = isAll ? '#FF4B6E' : LABEL_COLORS[i % LABEL_COLORS.length];

      return (
        <View
          key={option}
          style={[
            styles.labelWrapper,
            {
              transform: [{ translateX: x }, { translateY: y }],
              borderColor: color,
              shadowColor: color,
              backgroundColor: isSelected
                ? color + '30' // 30 = ~19% opacity hex
                : 'rgba(15,15,15,0.85)',
            },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              { color: isSelected ? '#FFF' : color },
              isSelected && styles.optionTextSelected,
            ]}
            numberOfLines={1}
          >
            {isAll ? '🍺' : option}
          </Text>
          {isAll && (
            <Text style={[styles.optionSubText, { color }]}>ALL</Text>
          )}
        </View>
      );
    });
  };

  /* ---------------- render ---------------- */
  return (
    <View style={styles.outer}>
      <View style={styles.wheelArea}>
        <View style={styles.circle}>{renderOptions()}</View>

        <Animated.View style={[styles.bottle, { transform: [{ rotate: spin }] }]}>
          <View style={styles.bottleBody} />
          <View style={styles.bottleNeck} />
          <View style={styles.bottleCap} />
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.button} onPress={spinBottle}>
        <Text style={styles.buttonText}>SPIN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SpinningBottle;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },

  wheelArea: {
    width: 300,
    height: 300,
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

  /* Label pill — bigger, bolder, with coloured border & glow */
  labelWrapper: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  optionTextSelected: {
    fontSize: 16,
  },
  optionSubText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 1,
  },

  /* Bottle */
  bottle: {
    width: 150,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottleBody: {
    width: 90,
    height: 36,
    backgroundColor: '#27AE60',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  bottleNeck: {
    width: 30,
    height: 20,
    backgroundColor: '#2ECC71',
  },
  bottleCap: {
    width: 14,
    height: 28,
    backgroundColor: '#FFD700',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },

  /* Spin button */
  button: {
    paddingVertical: 16,
    paddingHorizontal: 52,
    backgroundColor: '#00C9A7',
    borderRadius: 30,
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },
});