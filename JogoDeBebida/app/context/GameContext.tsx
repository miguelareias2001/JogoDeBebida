import React, { createContext, useState, useContext } from 'react';
import GAME_CONFIG from '../constants/gameConfig';
import getPlayerWithFewestPenalties from '../utils/gameUtils';

type Player = {
  name: string;
  penalties: number;
};

type GameContextType = {
  players: Player[];
  addPlayer: (name: string) => boolean;
  removePlayer: (name: string) => void;
  resetGame: () => void;
  selectRandomPlayer: () => Player;
  incrementPenalty: (playerName: string) => void;
  getFewestPenaltiesPlayer: () => Player | null;
  maybeTriggerChallenge: () => boolean;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return false;
    setPlayers(prev => [...prev, { name: trimmed, penalties: 0 }]);
    return true;
  };

  const removePlayer = (name: string) => {
    setPlayers(prev => prev.filter(p => p.name !== name));
  };

  const resetGame = () => {
    setPlayers([]);
  };

  const selectRandomPlayer = () => {
    const index = Math.floor(Math.random() * players.length);
    return players[index];
  };

  const incrementPenalty = (playerName: string) => {
    setPlayers(prev =>
      prev.map(p =>
        p.name === playerName ? { ...p, penalties: p.penalties + 1 } : p
      )
    );
  };

  const getFewestPenaltiesPlayer = (): Player | null => {
    return getPlayerWithFewestPenalties(players);
  };

  const maybeTriggerChallenge = () => {
    return Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY;
  };

  return (
    <GameContext.Provider
      value={{
        players,
        addPlayer,
        removePlayer,
        resetGame,
        selectRandomPlayer,
        incrementPenalty,
        getFewestPenaltiesPlayer,
        maybeTriggerChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);

export default GameProvider;