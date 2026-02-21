import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/GameContext';

type RootStackParamList = {
  Config: undefined;
  Game: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'Config'>;

interface Props {
  navigation: NavProp;
}

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const { players, addPlayer, removePlayer } = useGame();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const pressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const handleAdd = () => {
    const ok = addPlayer(playerName);
    if (!ok) {
      shake();
      Alert.alert('⚠️ Oops', 'Invalid or duplicate name!');
    } else {
      setPlayerName('');
    }
  };

  const handleStart = () => {
    if (players.length < 2) {
      shake();
      Alert.alert('Need More Players', 'Add at least 2 players to start.');
      return;
    }
    navigation.navigate('Game');
  };

  const renderPlayer = ({ item, index }: { item: { name: string; penalties: number }; index: number }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerIndex}>
        <Text style={styles.playerIndexText}>{index + 1}</Text>
      </View>
      <Text style={styles.playerName}>{item.name}</Text>
      <TouchableOpacity onPress={() => removePlayer(item.name)} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const canStart = players.length >= 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background decorative elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>🍺 DRINKING GAME</Text>
        <Text style={styles.title}>WHO'S{'\n'}PLAYING?</Text>
        <Text style={styles.subtitle}>
          {players.length === 0
            ? 'Add your crew below'
            : `${players.length} player${players.length > 1 ? 's' : ''} ready`}
        </Text>
      </View>

      {/* Input */}
      <Animated.View style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Enter name..."
          placeholderTextColor="#555"
          value={playerName}
          onChangeText={setPlayerName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Player list */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={renderPlayer}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No players yet</Text>
          </View>
        }
      />

      {/* Start button */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={handleStart}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={!canStart}
          activeOpacity={0.9}
        >
          <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
            {canStart ? 'LET\'S DRINK 🍻' : `NEED ${2 - players.length} MORE`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default ConfigScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    overflow: 'hidden',
  },

  /* decorative bg */
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FF4B6E',
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#7A28FF',
    opacity: 0.08,
    bottom: 60,
    left: -60,
  },

  /* header */
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 12,
    color: '#00C9A7',
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
  },

  /* input */
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  addBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#00C9A7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  addBtnText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '300',
    lineHeight: 32,
  },

  /* list */
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 14,
  },
  playerIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#7A28FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIndexText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  playerName: {
    flex: 1,
    fontSize: 17,
    color: '#FFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#00C9A7',
    fontSize: 14,
    fontWeight: '700',
  },

  /* empty */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#444',
    letterSpacing: 1,
  },

  /* start button */
  startBtn: {
    height: 60,
    backgroundColor: '#00C9A7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 8,
  },
  startBtnDisabled: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#333',
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  startBtnTextDisabled: {
    color: '#444',
  },
});