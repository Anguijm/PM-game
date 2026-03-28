/** Fisher-Yates shuffle (fallback when boardgame.io RNG not available) */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate a unique ID */
let _idCounter = 0;
export function uid(prefix = "id"): string {
  return `${prefix}-${++_idCounter}-${Date.now().toString(36)}`;
}
