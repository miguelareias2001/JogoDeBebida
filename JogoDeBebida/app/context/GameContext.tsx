
import React, { createContext, useContext, useState } from 'react';

type GameContextType = {
  players: string[];
  setPlayers: (players: string[]) => void;
  currentPlayer: string | null;
  setCurrentPlayer: (player: string | null) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

  return (
    <GameContext.Provider value={{ players, setPlayers, currentPlayer, setCurrentPlayer }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (undefined === context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};