import React, { useState } from 'react';
import { DIFFICULTY_PRESETS } from '../configs/constants.js';

export default function RoomLobby({
  roomCode,
  playerName,
  onNameSubmit,
  players = [],
  isHost = false,
  selectedDifficulty,
  onDifficultyChange,
  onStartRace,
  onLeaveRoom
}) {
  const [nameInput, setNameInput] = useState(playerName || '');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (e) => {
    if (e) e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = roomCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = roomCode;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.warn('Failed to copy room code:', fallbackErr);
      }
    }
  };

  if (!playerName) {
    return (
      <div className="lobby-container modal-view">
        <div className="lobby-card">
          <h2>Enter Your Player Name</h2>
          <p>Join Room <strong>{roomCode}</strong></p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) onNameSubmit(nameInput.trim());
            }}
          >
            <input
              type="text"
              className="name-input"
              placeholder="e.g. MazeRunner99"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={15}
              required
              autoFocus
            />
            <button type="submit" className="primary-btn">
              Join Lobby 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <div className="room-code-badge" onClick={handleCopyCode} title="Click to copy room code">
          <span>ROOM CODE: <strong>{roomCode}</strong></span>
          <button className="copy-btn" onClick={handleCopyCode} type="button">
            {copied ? '✅ Copied Code!' : '📋 Copy Code'}
          </button>
        </div>
        <button className="secondary-btn leave-btn" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="lobby-grid">
        {/* Left Column: Player Roster */}
        <div className="lobby-section players-section">
          <h3>Players in Lobby ({players.length})</h3>
          <div className="player-roster">
            {players.map((p) => (
              <div key={p.id} className="roster-item">
                <span className="roster-avatar">👤</span>
                <span className="roster-name">{p.name}</span>
                {p.isHost && <span className="host-badge">👑 HOST</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Game Settings & Start */}
        <div className="lobby-section config-section">
          <h3>Select Maze Difficulty</h3>
          <div className="difficulty-grid">
            {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                disabled={!isHost}
                className={`difficulty-card ${selectedDifficulty === key ? 'active' : ''}`}
                onClick={() => isHost && onDifficultyChange(key)}
              >
                <div className="difficulty-label">{preset.label}</div>
                <div className="maze-size">{preset.width} × {preset.height} cells</div>
              </button>
            ))}
          </div>

          {!isHost && (
            <p className="waiting-text">⏳ Waiting for host to select difficulty and start the race...</p>
          )}

          {isHost && (
            <button className="start-race-btn" onClick={onStartRace}>
              🏁 START MULTIPLAYER RACE 🏁
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
