import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';

interface SpinningWheelProps {
  players: string[];
  onSpinComplete: (player: string) => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ players, onSpinComplete }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  const wheelSize = windowWidth * 0.8;

  const spin = () => {
    const randomRotations = 5 + Math.random() * 5; // Between 5-10 rotations
    const toValue = randomRotations * 360;
    
    Animated.timing(spinValue, {
      toValue,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      const finalRotation = toValue % 360;
      const selectedIndex = Math.floor((finalRotation / (360 / players.length)));
      onSpinComplete(players[selectedIndex]);
    });
  };

  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: wheelSize, height: wheelSize }]}>
      <BlurView intensity={100} style={styles.blur}>
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate }] }
          ]}
        >
          {players.map((player, index) => (
            <View
              key={player}
              style={[
                styles.segment,
                {
                  transform: [
                    { rotate: `${(360 / players.length) * index}deg` }
                  ],
                  backgroundColor: `hsl(${(360 / players.length) * index}, 70%, 50%)`
                }
              ]}
            />
          ))}
        </Animated.View>
      </BlurView>
      <TouchableOpacity style={styles.button} onPress={spin}>
        <Text style={styles.buttonText}>Spin the Bottle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    borderRadius: 1000,
    overflow: 'hidden',
    flex: 1,
    width: '100%',
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: 2,
    transformOrigin: 'left center',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default SpinningWheel;