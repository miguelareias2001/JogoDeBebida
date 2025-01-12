import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import bottleImage from '../../assets/images/bottle.png';

interface SpinningWheelProps {
  items: string[];
  onSpinComplete: (result: string) => void;
  onSpinStart?: () => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({
  items,
  onSpinComplete,
  onSpinStart,
}) => {

  const BOTTLE_IMAGE_OFFSET = '0deg';
  const spinValue = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  const CONTAINER_SIZE = windowWidth * 0.8;
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngle = 360 / items.length;
  const halfSegment = segmentAngle / 2;

  const indexRanges = items.map((_, i) => {
    const midAngle = i * segmentAngle;
    const start = midAngle - halfSegment;
    const end = midAngle + halfSegment;
    return { i, start, end };
  });

  const spinBottle = () => {
    if (isSpinning) return;
    if (onSpinStart) onSpinStart();

    setIsSpinning(true);

    const initialVelocity = 2000 + Math.random() * 1000;

    Animated.decay(spinValue, {
      velocity: initialVelocity,
      deceleration: 0.995,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      spinValue.extractOffset();

      const rawAngle = spinValue.__getValue() % 360;
      const finalAngle = (rawAngle + 360) % 360;

      console.log(`Final Angle: ${finalAngle}`);

      let chosenIndex = 0;

      for (let r = 0; r < indexRanges.length; r++) {
        let { i, start, end } = indexRanges[r];

        const normStart = (start + 360) % 360;
        const normEnd = (end + 360) % 360;

        if (normStart < normEnd) {
          if (finalAngle >= normStart && finalAngle < normEnd) {
            chosenIndex = i;
            break;
          }
        } else {
          if (finalAngle >= normStart || finalAngle < normEnd) {
            chosenIndex = i;
            break;
          }
        }
      }

      const chosenItem = items[chosenIndex];
      console.log(`Chosen Item: ${chosenItem}`);
      onSpinComplete(chosenItem);
      setIsSpinning(false);
    });
  };

  const rotate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
      {items.map((label, i) => {
        const angle = (360 / items.length) * i;
        const radians = (angle * Math.PI) / 180;
        const radius = (CONTAINER_SIZE / 2) - 40;
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

      <Animated.Image
        source={bottleImage}
        style={[
          styles.bottle,
          {
            transform: [{ rotate }],
            top: (CONTAINER_SIZE / 2) - 50,
            left: (CONTAINER_SIZE / 2) - 25,
          },
        ]}
      />

      <TouchableOpacity style={styles.spinButton} onPress={spinBottle}>
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
    height: 100,
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