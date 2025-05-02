import React, { createContext, useState, useContext } from 'react';
import GAME_CONFIG from '../constants/gameConfig';
import getPlayerWithFewestPenalties, {
  getOpponentWithFewestPenalties as findOpponentWithFewestPenalties,
} from '../utils/gameUtils';

export type Player = {
  name: string;
  penalties: number;
};

type GameContextType = {
  players: Player[];
  addPlayer: (name: string) => boolean;
  removePlayer: (name: string) => void;
  resetGame: () => void;
  selectRandomPlayer: () => Player; // <-- never null
  incrementPenalty: (playerName: string) => void;
  getFewestPenaltiesPlayer: () => Player | null;
  maybeTriggerChallenge: () => boolean;
  getOpponentWithFewestPenalties: (chosenPlayerName: string) => Player | null;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);

  /* ----------------- basic CRUD ------------------ */
  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
      return false;
    setPlayers((prev) => [...prev, { name: trimmed, penalties: 0 }]);
    return true;
  };

  const removePlayer = (name: string) => {
    setPlayers((prev) => prev.filter((p) => p.name !== name));
  };

  const resetGame = () => setPlayers([]);

  /* --------------- helpers ----------------------- */
  const selectRandomPlayer = (): Player => {
    const idx = Math.floor(Math.random() * players.length);
    return players[idx];
  };

  const incrementPenalty = (playerName: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.name === playerName ? { ...p, penalties: p.penalties + 1 } : p,
      ),
    );
  };

  const getFewestPenaltiesPlayer = () => getPlayerWithFewestPenalties(players);

  const maybeTriggerChallenge = () =>
    Math.random() < GAME_CONFIG.CHALLENGE_PROBABILITY;

  const getOpponentWithFewestPenalties = (name: string) =>
    findOpponentWithFewestPenalties(players, name);

  /* --------------- context value ----------------- */
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
        getOpponentWithFewestPenalties,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);