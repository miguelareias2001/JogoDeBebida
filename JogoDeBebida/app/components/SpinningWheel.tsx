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
    // Reseta o valor de rotação e a opção selecionada
    spinValue.setValue(0);
    setSelectedOption(null);

    // Gera um número aleatório de rotações completas (entre 3 e 6) e um ângulo final
    const fullSpins = Math.floor(Math.random() * 4) + 3; // 3 a 6 voltas
    const segmentAngle = 360 / options.length; // Ângulo por opção
    const randomSegment = Math.floor(Math.random() * options.length); // Segmento aleatório
    const finalAngle = fullSpins * 360 + randomSegment * segmentAngle;

    // Animação de rotação
    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 3000, // 3 segundos de animação
      easing: Easing.out(Easing.cubic), // Desaceleração suave
      useNativeDriver: true,
    }).start(() => {
      // Calcula o ângulo final normalizado (0 a 360°)
      const normalizedAngle = finalAngle % 360;
      const selectedIndex = Math.floor(normalizedAngle / segmentAngle);
      setSelectedOption(options[selectedIndex]);
    });
  };

  // Interpolação para aplicar a rotação na imagem
  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Garrafa giratória (simulada como um retângulo por falta de imagem real) */}
      <Animated.View style={[styles.bottle, { transform: [{ rotate: spin }] }]}>
        <View style={styles.bottleShape} />
      </Animated.View>

      {/* Botão para girar */}
      <TouchableOpacity style={styles.button} onPress={spinBottle}>
        <Text style={styles.buttonText}>Girar</Text>
      </TouchableOpacity>

      {/* Exibe o resultado */}
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
  bottle: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottleShape: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B4513', // Cor marrom para simular uma garrafa
    borderRadius: 25,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});

export default SpinningBottle;