// Game World & Grid Constants
export const CELL_SIZE = 2;
export const WALL_HEIGHT = 2;
export const WALL_THICKNESS = 0.3;
export const SCENE_Y_OFFSET = -1.5;

// Player Physics Constants
export const PLAYER_MOVE_SPEED = 3.5; // Units per second
export const PLAYER_ROTATE_SPEED = 2.2; // Radians per second
export const PLAYER_COLLISION_RADIUS = 0.15;

// Color Scheme Constants
export const COLOR_WALL = 0xa3a09e;
export const COLOR_FLOOR = 0x407521;
export const COLOR_START = 0x4040ff;
export const COLOR_WIN = 0xff4040;
export const COLOR_OPPONENT = 0xffa500; // Orange for opponent indicators

// Difficulty Settings
export const DIFFICULTY_PRESETS = {
  easy: { label: 'Easy', width: 10, height: 10 },
  intermediate: { label: 'Intermediate', width: 15, height: 10 },
  hard: { label: 'Hard', width: 20, height: 15 },
  extreme: { label: 'Extreme', width: 35, height: 20 }
};
