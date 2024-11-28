
export const getRandomPlayer = (players: string[]): string => {
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
};

export const validatePlayerName = (name: string, existingPlayers: string[]): boolean => {
  const trimmedName = name.trim();
  return trimmedName !== '' && !existingPlayers.includes(trimmedName);
};

const GameUtilsComponent = () => null;
export default GameUtilsComponent;