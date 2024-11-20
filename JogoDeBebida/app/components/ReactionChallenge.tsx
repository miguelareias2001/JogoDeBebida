import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

type Props = {
  player: string;
};

const ReactionChallenge: React.FC<Props> = ({ player }) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      const delay = Math.floor(Math.random() * 2000) + 1000;
      timer = setTimeout(() => {
        setStartTime(Date.now());
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePress = () => {
    if (startTime) {
      const timeTaken = Date.now() - startTime;
      setReactionTime(timeTaken);
      if (timeTaken <= 1000) {
        setResult('success');
      } else {
        setResult('fail');
      }
    }
  };

  useEffect(() => {
    if (result) {
      Alert.alert(
        result === 'success' ? 'Sucesso!' : 'Falhou!',
        result === 'success'
          ? `${player} reagiu a tempo!`
          : `${player} não reagiu a tempo e deve beber!`
      );
    }
  }, [result]);

  return (
    <View style={styles.container}>
      {countdown > 0 ? (
        <Text style={styles.countdown}>{countdown}</Text>
      ) : !result ? (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          {/* implement wheel of fortune */}
          <Text style={styles.buttonText}>Toque aqui assim que vir este texto!</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 20 },
  countdown: { fontSize: 48 },
  button: { padding: 20, backgroundColor: '#2196F3', borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18 },
});

export default ReactionChallenge;
