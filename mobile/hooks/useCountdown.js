import { useState, useEffect, useRef } from 'react';

export function useCountdown(startTime, timeLimitSeconds) {
  const [remaining, setRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!startTime || !timeLimitSeconds) return;

    const endTime = new Date(startTime).getTime()
      + timeLimitSeconds * 1000;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);
      const seconds = Math.floor(diff / 1000);

      setRemaining(seconds);

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(intervalRef.current);
      }
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [startTime, timeLimitSeconds]);

  // Format to "4 min 20 sec"
  const formatted = formatTime(remaining);

  return { remaining, formatted, isExpired };
}

function formatTime(seconds) {
  if (seconds <= 0) return '0 min 0 sec';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min ${s} sec`;
}

// Convert time_limit string/object from DB to seconds
export function timeLimitToSeconds(timeLimit) {
  if (!timeLimit) return 0;

  // If object (from PostgreSQL interval)
  if (typeof timeLimit === 'object') {
    const h = timeLimit.hours || 0;
    const m = timeLimit.minutes || 0;
    const s = timeLimit.seconds || 0;
    return h * 3600 + m * 60 + s;
  }

  // If string "HH:MM:SS"
  if (typeof timeLimit === 'string') {
    const parts = timeLimit.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  return 0;
}