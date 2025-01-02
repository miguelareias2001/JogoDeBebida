import React, { useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import bottleImage from '../../assets/images/bottle.png';

interface SpinningWheelProps {
  /**
   * An array of items to display around the circle.
   * Example: ['Filipe', 'Miguel', 'Gustavo', 'All players drink'].
   */
  items: string[];
  /**
   * A callback that receives the final chosen item
   * after the spin completes.
   */
  onSpinComplete: (result: string) => void;
  /**
   * A callback invoked right before spinning, allowing
   * the parent to decide which item will be selected.
   * (If omitted, no spin will occur.)
   */
  onSpinStart?: () => string | null;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items, onSpinComplete, onSpinStart }) => {
  // We use an Animated.Value that we'll rotate from 0..360 degrees
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Container size: 80% of screen width for a circle
  const windowWidth = Dimensions.get('window').width;
  const CONTAINER_SIZE = windowWidth * 0.8;

  // Called when user taps "Spin the Bottle"
  const spin = () => {
    // 1) Ask the parent which item should we land on
    const result = onSpinStart ? onSpinStart() : null;
    if (!result) {
      // If null or undefined, we skip spinning
      return;
    }

    // 2) Find the index of that item so we know the target angle
    const selectedIndex = items.indexOf(result);
    if (selectedIndex < 0) {
      // If we can't find the item, skip
      return;
    }
    const targetAngle = (360 / items.length) * selectedIndex;

    // 3) Add random full rotations so it doesn't look too predictable
    const randomRotations = 5 + Math.random() * 5; // 5-10 rotations
    const toValue = randomRotations * 360 + targetAngle;

    // 4) Animate the spin
    Animated.timing(spinValue, {
      toValue,
      duration: 3000, // 3 seconds
      useNativeDriver: true,
    }).start(() => {
      // 5) Notify the parent that we landed on `result`
      onSpinComplete(result);
    });
  };

  // Map 0..360 in spinValue to '0deg'..'360deg'
  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
      {/* 1) Render each item label around the circle */}
      {items.map((label, i) => {
        const angle = (360 / items.length) * i;
        const radians = (angle * Math.PI) / 180;
        const radius = (CONTAINER_SIZE / 2) - 40; // distance from center
        const x = radius * Math.cos(radians);
        const y = radius * Math.sin(radians);

        return (
          <View
            key={label}
            style={[
              styles.labelContainer,
              {
                top: (CONTAINER_SIZE / 2) + y - 10,
                left: (CONTAINER_SIZE / 2) + x - 30,
              },
            ]}
          >
            <Text style={styles.labelText}>{label}</Text>
          </View>
        );
      })}

      {/* 2) The spinning bottle in the center */}
      <Animated.Image
        source={bottleImage}
        style={[
          styles.bottle,
          {
            transform: [{ rotate }],
            top: (CONTAINER_SIZE / 2) - 50, // center bottle
            left: (CONTAINER_SIZE / 2) - 25,
          },
        ]}
      />

      {/* 3) The "Spin the Bottle" button */}
      <TouchableOpacity style={styles.spinButton} onPress={spin}>
        <Text style={styles.spinButtonText}>Spin the Bottle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SpinningWheel;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
  },
  labelText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottle: {
    position: 'absolute',
    width: 50,
    height: 100, // Adjust to match your bottle image
  },
  spinButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});