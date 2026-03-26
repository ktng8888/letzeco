export function getRankBorderColor(rank) {
  if (rank === 1) return '#f59e0b'; // gold
  if (rank === 2) return '#9ca3af'; // silver
  if (rank === 3) return '#b45309'; // bronze
  
  return null;
}