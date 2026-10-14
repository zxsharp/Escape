import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : 'http://localhost:3001'
);

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onRoomPlayers: () => {},
      onMazePreview: () => {},
      onCountdownStart: () => {},
      onGameStart: () => {},
      onBackToLobby: () => {},
      onPlayerWon: () => {},
      onConnect: () => {},
      onDisconnect: () => {}
    };
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        if (this.callbacks.onConnect) this.callbacks.onConnect();
      });

      this.socket.on('disconnect', () => {
        if (this.callbacks.onDisconnect) this.callbacks.onDisconnect();
      });

      this.socket.on('room_players', (players) => {
        if (this.callbacks.onRoomPlayers) this.callbacks.onRoomPlayers(players);
      });

      this.socket.on('maze_preview', (data) => {
        if (this.callbacks.onMazePreview) this.callbacks.onMazePreview(data);
      });

      this.socket.on('countdown_start', (data) => {
        if (this.callbacks.onCountdownStart) this.callbacks.onCountdownStart(data);
      });

      this.socket.on('game_start', (data) => {
        if (this.callbacks.onGameStart) this.callbacks.onGameStart(data);
      });

      this.socket.on('back_to_lobby', () => {
        if (this.callbacks.onBackToLobby) this.callbacks.onBackToLobby();
      });

      this.socket.on('player_won', (data) => {
        if (this.callbacks.onPlayerWon) this.callbacks.onPlayerWon(data);
      });
    }
    return this.socket;
  }

  setCallbacks(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  joinRoom(roomCode, playerName, playerId, isHost, callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };
    this.connect();

    this.socket.emit('join_room', {
      roomCode: roomCode.toUpperCase(),
      playerName,
      playerId,
      isHost
    });
  }

  prepareRace(seed, difficulty) {
    if (this.socket) {
      this.socket.emit('prepare_race', { seed, difficulty });
    }
  }

  startRace(seed, difficulty) {
    if (this.socket) {
      this.socket.emit('start_race', { seed, difficulty });
    }
  }

  backToLobby() {
    if (this.socket) {
      this.socket.emit('back_to_lobby');
    }
  }

  broadcastWin(finishTimeMs) {
    if (this.socket) {
      this.socket.emit('player_won', { finishTimeMs });
    }
  }

  leaveRoom() {
    if (this.socket) {
      this.socket.emit('leave_room');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
