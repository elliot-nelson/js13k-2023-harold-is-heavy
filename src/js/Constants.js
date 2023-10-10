// Constants

export const TITLE = 'Harold is Heavy';

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const TARGET_GAME_WIDTH = 240;
export const TARGET_GAME_HEIGHT = 135;

// Size in pixels of each map tile
export const TILE_SIZE = 8;

// Some pre-calculated radian values
export const R0          =   0;
export const R6          =   6 * Math.PI / 180;
export const R20         =  20 * Math.PI / 180;
export const R45         =  45 * Math.PI / 180;
export const R70         =  70 * Math.PI / 180;
export const R72         =  72 * Math.PI / 180;
export const R80         =  80 * Math.PI / 180;
export const R90         =  90 * Math.PI / 180;
export const R180        = 180 * Math.PI / 180;
export const R270        = 270 * Math.PI / 180;
export const R360        = 360 * Math.PI / 180;

// Frames per second (locked)
//
// Other constants below, like gravity, foot speed, etc., are represented as movement PER FRAME.
export const FPS = 42;

// Player movement constants
export const PLAYER_FOOT_SPEED = 1.3;
export const JUMP_HEIGHT = 3.5 * TILE_SIZE;
export const JUMP_HEIGHT_DISTANCE = 2 * TILE_SIZE;
export const JUMP_VELOCITY = -2 * JUMP_HEIGHT * PLAYER_FOOT_SPEED / JUMP_HEIGHT_DISTANCE;

// Gravity
export const GRAVITY = 2 * JUMP_HEIGHT * PLAYER_FOOT_SPEED * PLAYER_FOOT_SPEED / (JUMP_HEIGHT_DISTANCE * JUMP_HEIGHT_DISTANCE);
export const TERMINAL_VELOCITY = 5;

// If the bounding box of a jumping character hits a platform and the feet of
// the character are within this many pixels of the top of the floor, pretend
// that they "made the jump".
export const JUMP_CHEAT_Y_PIXELS = 2;

// Tapping jump before you've landed will trigger another jump if you're
// "about" to land on the ground (within this many frames).
export const JUMP_CHEAT_LANDING_FRAMES = 8;

// How many pixels you must fall to super slam
export const SUPER_SLAM_FALL_DISTANCE = 72;

// How many pixels away can you slam/bounce enemies?
export const SLAM_ENEMY_DISTANCE = 24;
