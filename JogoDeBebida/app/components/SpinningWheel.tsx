import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';

// Props do componente
interface SpinningBottleProps {
  options: string[];
}

const SpinningBottle: React.FC<SpinningBottleProps> = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Função para iniciar o giro
  const spinBottle = () => {
    spinValue.setValue(0);
    setSelectedOption(null);
  
    const fullSpins = Math.floor(Math.random() * 4) + 3; // 3-6 spins
    const segmentAngle = 360 / options.length;
    const randomSegment = Math.floor(Math.random() * options.length);
    const finalAngle = fullSpins * 360 + randomSegment * segmentAngle + 180;
  
    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const normalizedAngle = finalAngle % 360;
      // Calculate the closest segment center
      const calculatedIndex = Math.round(normalizedAngle / segmentAngle - 0.5);
      // Handle negative indices and wrap-around
      const selectedIndex = 
        (calculatedIndex % options.length + options.length) % options.length;
      
      setSelectedOption(options[selectedIndex]);
    });
  };

  // Interpolação para rotação
  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Renderiza os nomes ao redor da garrafa
  const renderOptions = () => {
    const radius = 120; // Raio do círculo de nomes
    return options.map((option, index) => {
      const angle = (index * (360 / options.length) * Math.PI) / 180; // Ângulo em radianos
      const x = radius * Math.cos(angle); // Posição X
      const y = radius * Math.sin(angle); // Posição Y

      return (
        <Text
          key={index}
          style={[
            styles.optionText,
            {
              transform: [{ translateX: x }, { translateY: y }],
              position: 'absolute',
            },
          ]}
        >
          {option}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Círculo de nomes */}
      <View style={styles.circle}>{renderOptions()}</View>

      {/* Garrafa giratória */}
      <Animated.View style={[styles.bottle, { transform: [{ rotate: spin }] }]}>
        <View style={styles.bottleShape} />
      </Animated.View>

      {/* Botão para girar */}
      <TouchableOpacity style={styles.button} onPress={spinBottle}>
        <Text style={styles.buttonText}>Girar</Text>
      </TouchableOpacity>

      {/* Resultado */}
      {selectedOption && (
        <Text style={styles.result}>Selecionado: {selectedOption}</Text>
      )}
    </View>
  );
};

// Estilos
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
    borderTopRightRadius: 25, // Lado redondo agora à direita
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderLeftWidth: 20, // Ponta mais larga à esquerda
    borderColor: '#8B4513',
  },
  button: {
    position: 'absolute',
    bottom: 100,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  result: {
    position: 'absolute',
    bottom: 50, 
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
});

export default SpinningBottle;