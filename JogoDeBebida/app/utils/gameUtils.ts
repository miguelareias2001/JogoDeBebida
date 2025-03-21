export const getRandomPlayer = (players: string[]): string => {
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
};

export const validatePlayerName = (name: string, existingPlayers: string[]): boolean => {
  const trimmedName = name.trim();
  return trimmedName !== '' && !existingPlayers.includes(trimmedName);
};

export function getOpponentWithFewestPenalties(
  players: { name: string; penalties: number }[],
  chosenPlayerName: string
): { name: string; penalties: number } | null {
  const otherPlayers = players.filter((p) => p.name !== chosenPlayerName);
  if (otherPlayers.length === 0) return null;

  let minPenalties = Number.MAX_SAFE_INTEGER;
  let selected: { name: string; penalties: number } | null = null;
  for (const p of otherPlayers) {
    if (p.penalties < minPenalties) {
      minPenalties = p.penalties;
      selected = p;
    }
  }
  return selected;
}

const GameUtilsComponent = (players: { name: string; penalties: number; }[]) => null;
export default GameUtilsComponent;