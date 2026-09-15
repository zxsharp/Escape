import { useState, useEffect } from 'react';

/**
 * Universal Game Timer Component
 * Formats time in MM:SS.ms (e.g. 01:24.45)
 */
export default function UniversalClock({ startTime, isRunning = true, finalTimeMs = null, onTick }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    // If a static final finish time is passed, freeze display at that time
    if (finalTimeMs !== null && finalTimeMs !== undefined) {
      setElapsedMs(finalTimeMs);
      return;
    }

    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const current = Date.now() - startTime;
      const positiveElapsed = Math.max(0, current);
      setElapsedMs(positiveElapsed);
      if (onTick) onTick(positiveElapsed);
    }, 33); // ~30fps update

    return () => clearInterval(interval);
  }, [startTime, isRunning, finalTimeMs, onTick]);

  const formatTime = (totalMs) => {
    if (totalMs === null || totalMs === undefined) totalMs = 0;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);

    const pad = (num, size = 2) => String(num).padStart(size, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
  };

  const displayTime = (finalTimeMs !== null && finalTimeMs !== undefined) ? finalTimeMs : elapsedMs;

  return (
    <div className="game-timer-badge">
      <span className="timer-icon">⏱️</span>
      <span className="timer-digits">{formatTime(displayTime)}</span>
    </div>
  );
}
