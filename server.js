import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory room store: roomCode -> Array of player objects
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentPlayerId = null;

  // Join or create a room
  socket.on('join_room', ({ roomCode, playerName, playerId, isHost }) => {
    currentRoom = roomCode ? roomCode.toUpperCase() : 'DEFAULT';
    currentPlayerId = playerId || socket.id;
    socket.join(currentRoom);

    if (!rooms.has(currentRoom)) {
      rooms.set(currentRoom, []);
    }

    const roomPlayers = rooms.get(currentRoom);
    const existingIndex = roomPlayers.findIndex(p => p.id === currentPlayerId);

    const playerObj = {
      id: currentPlayerId,
      socketId: socket.id,
      name: playerName || 'Player',
      isHost: isHost || roomPlayers.length === 0,
      status: 'joined', // 'joined' | 'in_play' | 'won'
      finishTimeMs: null
    };

    if (existingIndex >= 0) {
      roomPlayers[existingIndex] = playerObj;
    } else {
      roomPlayers.push(playerObj);
    }

    // Broadcast updated player roster to all players in the room
    io.to(currentRoom).emit('room_players', roomPlayers);
  });

  // Host starts the race
  socket.on('start_race', ({ seed, difficulty }) => {
    if (!currentRoom || !rooms.has(currentRoom)) return;

    const roomPlayers = rooms.get(currentRoom);
    roomPlayers.forEach(p => {
      p.status = 'in_play';
      p.finishTimeMs = null;
    });

    const generatedSeed = seed || `seed_${Math.random().toString(36).substring(2, 8)}`;

    io.to(currentRoom).emit('game_start', {
      seed: generatedSeed,
      difficulty: difficulty || 'intermediate',
      startTime: Date.now() + 3000 // 3-second countdown offset
    });

    io.to(currentRoom).emit('room_players', roomPlayers);
  });

  // Player reached the exit
  socket.on('player_won', ({ finishTimeMs }) => {
    if (!currentRoom || !rooms.has(currentRoom)) return;

    const roomPlayers = rooms.get(currentRoom);
    const player = roomPlayers.find(p => p.id === currentPlayerId);
    if (player) {
      player.status = 'won';
      player.finishTimeMs = finishTimeMs;
    }

    io.to(currentRoom).emit('player_won', {
      playerId: currentPlayerId,
      finishTimeMs
    });

    io.to(currentRoom).emit('room_players', roomPlayers);
  });

  // Handle disconnect or leaving room
  const handleLeave = () => {
    if (currentRoom && rooms.has(currentRoom)) {
      let roomPlayers = rooms.get(currentRoom);
      roomPlayers = roomPlayers.filter(p => p.socketId !== socket.id && p.id !== currentPlayerId);

      if (roomPlayers.length === 0) {
        rooms.delete(currentRoom);
      } else {
        if (!roomPlayers.some(p => p.isHost)) {
          roomPlayers[0].isHost = true;
        }
        rooms.set(currentRoom, roomPlayers);
        io.to(currentRoom).emit('room_players', roomPlayers);
      }
    }
  };

  socket.on('leave_room', handleLeave);
  socket.on('disconnect', handleLeave);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

server.listen(PORT, () => {
  console.log(`Escape WebSocket Server running on port ${PORT}`);
});
