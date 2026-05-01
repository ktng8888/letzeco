export function minutesToTimeLimit(minutes) {
  if (minutes === null || minutes === undefined || minutes === '') {
    return '';
  }

  const totalSeconds = Math.round(Number(minutes) * 60);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(mins).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}
