import React, { createContext, useContext, useState } from 'react';

type PlayerStats = {
  name: string;
  penalties: number;
};

type GameContextType = {
  players: PlayerStats[];
  setPlayers: (players: PlayerStats[]) => void;
  currentPlayer: string | null;
  setCurrentPlayer: (player: string | null) => void;
  getPlayerWithFewestPenalties: () => string;
  updatePenalties: (player1: string, player2: string, result: 'player1' | 'player2' | 'tie') => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayerStats] = useState<PlayerStats[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

  // Initialize players with zero penalties
  const setPlayers = (players: PlayerStats[]) => {
    setPlayerStats(players);
  };  

  // Get the player with the fewest penalties
  const getPlayerWithFewestPenalties = (): string => {
    const minPenalties = Math.min(...players.map((player) => player.penalties));
    const candidates = players.filter((player) => player.penalties === minPenalties);

    // Randomly choose one player if there is a tie
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex].name;
  };

  // Update penalties after a ReactionChallenge
  const updatePenalties = (
    player1: string,
    player2: string,
    result: 'player1' | 'player2' | 'tie'
  ) => {
    setPlayerStats((prevPlayers) =>
      prevPlayers.map((player) => {
        if (result === 'player1' && player.name === player2) {
          return { ...player, penalties: player.penalties + 1 }; // Player 2 lost
        }
        if (result === 'player2' && player.name === player1) {
          return { ...player, penalties: player.penalties + 1 }; // Player 1 lost
        }
        if (result === 'tie' && (player.name === player1 || player.name === player2)) {
          return { ...player, penalties: player.penalties + 1 }; // Both players lost
        }
        return player; // No changes for others
      })
    );
  };

  return (
    <GameContext.Provider
      value={{
        players,
        setPlayers,
        currentPlayer,
        setCurrentPlayer,
        getPlayerWithFewestPenalties,
        updatePenalties,
      }}
    >
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

const GameContextComponent = () => null;
export default GameContextComponent;