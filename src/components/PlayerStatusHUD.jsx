import React from 'react';

/**
 * Player Status HUD Overlay
 * Shows real-time status of all room players (In Play, Escaped, Left)
 */
export default function PlayerStatusHUD({ players = [], currentPlayerId }) {
  const formatTime = (totalMs) => {
    if (!totalMs) return '';
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
  };

  return (
    <div className="player-status-hud">
      <div className="hud-header">
        <span>👥 PLAYERS ({players.length})</span>
      </div>
      <div className="hud-player-list">
        {players.map((p) => {
          const isCurrent = p.id === currentPlayerId;
          const isWon = p.status === 'won';
          const isInPlay = p.status === 'in_play';

          return (
            <div
              key={p.id}
              className={`hud-player-card ${isCurrent ? 'is-self' : ''} ${isWon ? 'status-won' : ''}`}
            >
              <div className="player-info">
                <span className="status-indicator">
                  {isWon ? '🟢' : isInPlay ? '🟡' : '🔴'}
                </span>
                <span className="player-name">
                  {p.name} {isCurrent ? '(You)' : ''} {p.isHost ? '👑' : ''}
                </span>
              </div>
              <div className="player-state-detail">
                {isWon ? (
                  <span className="finish-time-badge">🏆 {formatTime(p.finishTimeMs)}</span>
                ) : isInPlay ? (
                  <span className="in-play-badge">In Maze</span>
                ) : (
                  <span className="left-badge">Left</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
