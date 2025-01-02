import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import bottleImage from '../../assets/images/bottle.png';

interface SpinningWheelProps {
  // We'll pass an array of items. Example: [Filipe, Miguel, Gustavo, "Reaction Challenge", "All players drink"]
  items: string[];
  onSpinComplete: (result: string) => void;
  onSpinStart?: () => void; // new optional prop
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items, onSpinComplete, onSpinStart }) => {
  // We use an Animated.Value that we'll rotate from 0..360 degrees
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Our container size: 80% of screen width for a circle
  const windowWidth = Dimensions.get('window').width;
  const CONTAINER_SIZE = windowWidth * 0.8;

  // Called when user taps "Spin the Bottle"
  const spin = () => {
    // Inform parent that we’re about to spin
    if (onSpinStart) {
      onSpinStart();
    }

    const randomRotations = 5 + Math.random() * 5; // 5-10 rotations
    const toValue = randomRotations * 360;

    Animated.timing(spinValue, {
      toValue,
      duration: 3000, // 3 seconds
      useNativeDriver: true,
    }).start(() => {
      // After spin finishes, figure out which item was chosen
      const finalRotation = toValue % 360;
      const selectedIndex = Math.floor(finalRotation / (360 / items.length));
      const chosenItem = items[selectedIndex];
      onSpinComplete(chosenItem);
    });
  };

  // Map 0..360 in spinValue to '0deg'..'360deg'
  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
      {/** 1) Render each item label around the circle **/}
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

      {/** 2) The spinning bottle in the center **/}
      <Animated.Image
        source={bottleImage}
        style={[
          styles.bottle,
          {
            // Let the bottle rotate
            transform: [{ rotate }],
            top: (CONTAINER_SIZE / 2) - 50, // center bottle
            left: (CONTAINER_SIZE / 2) - 25,
          },
        ]}
      />

      {/** 3) The "Spin the Bottle" button */}
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
    // If your bottle image is bigger or smaller, tweak this
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