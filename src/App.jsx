import { useState, useEffect, useRef } from 'react';
import { generateMaze } from './utils/mazeGenerator.js';
import { socketService } from './services/socketService.js';
import DifficultySelector from './components/DifficultySelector.jsx';
import MazeMap from './components/MazeMap.jsx';
import Game from './components/Game.jsx';
import RoomLobby from './components/RoomLobby.jsx';
import UniversalClock from './components/UniversalClock.jsx';
import PlayerStatusHUD from './components/PlayerStatusHUD.jsx';
import GitHubLogo from './components/GitHubLogo.jsx';
import useAudioManager from './utils/AudioManager.jsx';
import './App.css';

export default function App() {
  // Navigation State: 'home' | 'solo_difficulty' | 'solo_preview' | 'solo_game' | 'lobby' | 'multiplayer_preview' | 'countdown' | 'multiplayer_game'
  const [appState, setAppState] = useState('home');

  // Solo State
  const [_soloDifficulty, setSoloDifficulty] = useState(null);
  const [soloMazeConfig, setSoloMazeConfig] = useState(null);
  const [soloStartTime, setSoloStartTime] = useState(null);
  const [soloFinishTime, setSoloFinishTime] = useState(null);

  // Multiplayer State
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('escape_player_name') || '';
  });
  const [playerId] = useState(() => {
    let id = sessionStorage.getItem('escape_player_id');
    if (!id) {
      id = `p_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('escape_player_id', id);
    }
    return id;
  });
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const playersRef = useRef(players);
  playersRef.current = players;

  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [multiMazeConfig, setMultiMazeConfig] = useState(null);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [countdownNum, setCountdownNum] = useState(3);
  const [winnerName, setWinnerName] = useState(null);
  const [multiFinishTime, setMultiFinishTime] = useState(null);

  // Modals & UI
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Audio Hook
  const { audioRefs, playStartSound, playWinSound, stopAllSounds } = useAudioManager();

  // Helper to generate a 4-letter room code (e.g. ESC-8A2F)
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ESC-${code}`;
  };

  // Solo Mode Handlers
  const handleSoloDifficultySelect = (difficulty) => {
    setSoloDifficulty(difficulty);
    const cellSize = 2;
    const generated = generateMaze(difficulty.width, difficulty.height, cellSize);
    setSoloMazeConfig({
      width: difficulty.width,
      height: difficulty.height,
      cellSize,
      ...generated
    });
    setAppState('solo_preview');
  };

  const handleStartSoloGame = () => {
    setSoloStartTime(Date.now());
    setSoloFinishTime(null);
    setAppState('solo_game');
    playStartSound();
  };

  const handleSoloWin = () => {
    const elapsed = Date.now() - (soloStartTime || Date.now());
    setSoloFinishTime(elapsed);
    playWinSound();
  };

  // Multiplayer Handlers
  const handleCreateRoom = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setIsHost(true);
    setAppState('lobby');
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCodeInput.trim()) {
      let formatted = joinCodeInput.trim().toUpperCase().replace(/\s+/g, '');
      if (!formatted.startsWith('ESC-') && formatted.length === 4) {
        formatted = `ESC-${formatted}`;
      }
      setRoomCode(formatted);
      setIsHost(false);
      setShowJoinModal(false);
      setAppState('lobby');
    }
  };

  const handleNameSubmit = (name) => {
    const clean = name.trim();
    if (clean) {
      setPlayerName(clean);
      localStorage.setItem('escape_player_name', clean);
    }
  };

  // Helper to trigger synchronized 3-2-1 countdown
  const triggerCountdown = () => {
    setAppState('countdown');
    let count = 3;
    setCountdownNum(3);

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(countdownInterval);
        setRaceStartTime(Date.now());
        setAppState('multiplayer_game');
        playStartSound();
      }
    }, 1000);
  };

  // Helper to generate multiplayer maze from seed & difficulty
  const buildMultiplayerMaze = (seed, difficulty) => {
    const presets = {
      easy: { width: 10, height: 10 },
      intermediate: { width: 15, height: 10 },
      hard: { width: 20, height: 15 },
      extreme: { width: 35, height: 20 }
    };
    const preset = presets[difficulty] || presets.intermediate;
    const maze = generateMaze(preset.width, preset.height, 2, seed);

    setMultiMazeConfig({
      width: preset.width,
      height: preset.height,
      cellSize: 2,
      ...maze
    });
    setSelectedDifficulty(difficulty);
    setWinnerName(null);
    setMultiFinishTime(null);
  };

  // Keep socket callbacks fresh
  useEffect(() => {
    socketService.setCallbacks({
      onRoomPlayers: (updatedPlayers) => {
        setPlayers(updatedPlayers);
        const self = updatedPlayers.find(p => p.id === playerId);
        if (self && self.isHost) setIsHost(true);
      },
      onMazePreview: ({ seed, difficulty }) => {
        buildMultiplayerMaze(seed, difficulty);
        setAppState('multiplayer_preview');
      },
      onCountdownStart: () => {
        triggerCountdown();
      },
      onGameStart: ({ seed, difficulty }) => {
        // Fallback for direct game start if triggered
        buildMultiplayerMaze(seed, difficulty);
        triggerCountdown();
      },
      onBackToLobby: () => {
        setAppState('lobby');
        setMultiMazeConfig(null);
        setWinnerName(null);
        setMultiFinishTime(null);
      },
      onPlayerWon: ({ playerId: winnerId }) => {
        const winner = playersRef.current.find(p => p.id === winnerId);
        if (winner) {
          setWinnerName(winner.name);
        }
      }
    });
  });

  // Connect to Socket.io when entering multiplayer
  useEffect(() => {
    if (!roomCode || !playerName || appState === 'home') {
      return;
    }

    socketService.joinRoom(roomCode, playerName, playerId, isHost);
  }, [roomCode, playerName, playerId, isHost, appState]);

  // Host prepares race (broadcasts 2D preview to all players)
  const handleHostStartRace = () => {
    const seed = `seed_${Math.random().toString(36).substring(2, 8)}`;
    socketService.prepareRace(seed, selectedDifficulty);
  };

  // Host clicks "Ready" on 2D preview (triggers countdown for everyone)
  const handleHostReady = () => {
    socketService.startRace();
  };

  // Host returns everyone from preview to lobby
  const handleHostBackToLobby = () => {
    socketService.backToLobby();
  };

  // Player escapes maze in multiplayer
  const handleMultiplayerWin = () => {
    const elapsed = Date.now() - (raceStartTime || Date.now());
    setMultiFinishTime(elapsed);
    playWinSound();
    socketService.broadcastWin(elapsed);
  };

  // Return to lobby from game win
  const handleReturnToLobby = () => {
    if (isHost) {
      socketService.backToLobby();
    } else {
      setAppState('lobby');
      setMultiMazeConfig(null);
      setWinnerName(null);
      setMultiFinishTime(null);
    }
  };

  // Navigation: Back to main menu
  const handleBackToMain = () => {
    if (appState === 'lobby' || appState === 'multiplayer_preview' || appState === 'countdown' || appState === 'multiplayer_game') {
      socketService.leaveRoom();
    }
    stopAllSounds();
    setAppState('home');
    setRoomCode('');
    setSoloMazeConfig(null);
    setMultiMazeConfig(null);
    setSoloStartTime(null);
    setSoloFinishTime(null);
    setMultiFinishTime(null);
    setWinnerName(null);
  };

  return (
    <div className="app-root-container">
      {/* 1. HOME SCREEN */}
      {appState === 'home' && (
        <div className="home-hero-container">
          <GitHubLogo />
          <div className="hero-title-card">
            <h1 className="game-title">ESCAPE 3D</h1>
            <p className="game-tagline">
              First-Person 3D Maze Escape & Multiplayer Race
            </p>
          </div>

          <div className="main-actions-grid">
            <button className="hero-action-btn primary-action" onClick={() => setAppState('solo_difficulty')}>
              <span className="btn-icon">🏃</span>
              <span className="btn-text">Play Solo Mode</span>
              <span className="btn-desc">Explore & escape randomized DFS mazes</span>
            </button>

            <button className="hero-action-btn secondary-action" onClick={handleCreateRoom}>
              <span className="btn-icon">🎮</span>
              <span className="btn-text">Create Multiplayer Room</span>
              <span className="btn-desc">Generate room code & race with friends</span>
            </button>

            <button className="hero-action-btn join-action" onClick={() => setShowJoinModal(true)}>
              <span className="btn-icon">🔑</span>
              <span className="btn-text">Join Room Code</span>
              <span className="btn-desc">Enter an existing room code</span>
            </button>
          </div>

          {/* Join Room Modal */}
          {showJoinModal && (
            <div className="modal-backdrop" onClick={() => setShowJoinModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Join Multiplayer Race</h3>
                <form onSubmit={handleJoinSubmit}>
                  <input
                    type="text"
                    className="room-input"
                    placeholder="Enter Room Code (e.g. ESC-8A2F)"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    autoFocus
                    required
                  />
                  <div className="modal-btn-row">
                    <button type="button" className="secondary-btn" onClick={() => setShowJoinModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn">
                      Join Room
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <footer className="home-footer">
            <a href="https://github.com/zxsharp" target="_blank" rel="noopener noreferrer" className="credit-tag">
              Made By - zxsharp
            </a>
          </footer>
        </div>
      )}

      {/* 2. SOLO DIFFICULTY SELECTOR */}
      {appState === 'solo_difficulty' && (
        <DifficultySelector
          onDifficultySelect={handleSoloDifficultySelect}
          onBack={() => setAppState('home')}
        />
      )}

      {/* 3. SOLO PREVIEW */}
      {appState === 'solo_preview' && (
        <MazeMap
          mazeConfig={soloMazeConfig}
          onStartGame={handleStartSoloGame}
          onBackClick={() => setAppState('solo_difficulty')}
        />
      )}

      {/* 4. SOLO GAMEPLAY */}
      {appState === 'solo_game' && soloMazeConfig && (
        <>
          <div className="game-hud-top">
            <UniversalClock 
              startTime={soloStartTime} 
              isRunning={!soloFinishTime} 
              finalTimeMs={soloFinishTime} 
            />
          </div>

          <Game
            mazeConfig={soloMazeConfig}
            onBackToMain={handleBackToMain}
            onGameWin={handleSoloWin}
            audioRefs={audioRefs}
            finishTimeMs={soloFinishTime}
            isMultiplayer={false}
          />
        </>
      )}

      {/* 5. MULTIPLAYER ROOM LOBBY */}
      {appState === 'lobby' && (
        <RoomLobby
          roomCode={roomCode}
          playerName={playerName}
          onNameSubmit={handleNameSubmit}
          players={players}
          isHost={isHost}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={(diff) => setSelectedDifficulty(diff)}
          onStartRace={handleHostStartRace}
          onLeaveRoom={handleBackToMain}
        />
      )}

      {/* 6. MULTIPLAYER 2D MAP PREVIEW */}
      {appState === 'multiplayer_preview' && multiMazeConfig && (
        <MazeMap
          mazeConfig={multiMazeConfig}
          isMultiplayer={true}
          isHost={isHost}
          onStartGame={handleHostReady}
          onBackClick={isHost ? handleHostBackToLobby : handleBackToMain}
          backButtonText={isHost ? '← Back to Lobby' : '← Leave Room'}
        />
      )}

      {/* 7. SYNCHRONIZED COUNTDOWN OVERLAY */}
      {appState === 'countdown' && (
        <div className="countdown-overlay">
          <div className="countdown-box">
            <h2>GET READY!</h2>
            <div className="countdown-number">{countdownNum}</div>
            <p>Race starting in seconds...</p>
          </div>
        </div>
      )}

      {/* 8. MULTIPLAYER GAMEPLAY */}
      {appState === 'multiplayer_game' && multiMazeConfig && (
        <>
          <div className="game-hud-top">
            <UniversalClock 
              startTime={raceStartTime} 
              isRunning={!multiFinishTime} 
              finalTimeMs={multiFinishTime} 
            />
          </div>

          <PlayerStatusHUD players={players} currentPlayerId={playerId} />

          <Game
            mazeConfig={multiMazeConfig}
            onBackToMain={handleBackToMain}
            onReturnToLobby={handleReturnToLobby}
            onGameWin={handleMultiplayerWin}
            audioRefs={audioRefs}
            finishTimeMs={multiFinishTime}
            isMultiplayer={true}
            winnerName={winnerName}
          />
        </>
      )}
    </div>
  );
}
