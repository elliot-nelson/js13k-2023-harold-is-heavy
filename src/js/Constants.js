// Constants

export const TITLE = 'Moth';

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const TARGET_GAME_WIDTH = 240;
export const TARGET_GAME_HEIGHT = 135;

// Size in pixels of each map tile
export const TILE_SIZE = 8;

// Modes (touch vs mouse cursor)
export const INPUT_MODE_TOUCH = 1;
export const INPUT_MODE_MOUSE = 2;

// Tiles
export const TILE_FLOOR = 1;
export const TILE_WALL  = 8;
export const TILE_WALL_TOP = 9;
export const TILE_WALL_RIGHT = 10;
export const TILE_WALL_BOTTOM = 11;
export const TILE_WALL_LEFT = 12;
export const TILE_CORNER_OUTER = 13;
export const TILE_CORNER_INNER = 14;
export const TILE_DYNAMIC = 20;

export const TILE_DESCRIPTIONS = [
    'CAVE FLOOR',
    'CAVE FLOOR',
    'CAVE FLOOR',
    '',
    '',
    '',
    'DOOM PIT',
    'DOOM PIT'
];


// Handy IDs to represent the different dialog boxes / speech bubbles that can
// appear during the game.
export const DIALOG_START_A    = 0;
export const DIALOG_START_B    = 1;
export const DIALOG_HINT_1     = 2;
export const DIALOG_HINT_2     = 3;
export const DIALOG_HINT_3     = 4;
export const DIALOG_HINT_DEATH = 5;
export const DIALOG_HINT_E1    = 6;
export const DIALOG_HINT_E2    = 7;
export const DIALOG_HINT_DMG   = 8;

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

// Moths must be within this number of pixels of their target
// to "act" (construct, gather, etc.).
export const ACTION_DISTANCE = 6;

// Entity behaviors (states)
export const SPAWN     = 1;
export const IDLE      = 2;
export const MOVE      = 3;
export const PICKUP    = 4;
export const DROPOFF   = 5;
export const CONSTRUCT = 6;
export const DEAD      = 9;

// Additional behaviors (enemies)
export const CHASE     = 11;
export const ATTACK    = 12;

// Additional behaviors (buildings)
export const WIP       = 21;
export const ONLINE    = 22;

export const FPS = 60;

// Fiddle with these numbers to customize jump
export const JUMP_HEIGHT = 3.25 * TILE_SIZE;
export const JUMP_HEIGHT_DISTANCE = 2 * TILE_SIZE;
export const JUMP_DURATION = 240 / 60;

// Ask again
//export const GRAVITY = (JUMP_HEIGHT / 2 * JUMP_DURATION * JUMP_DURATION) / 2;
//export const JUMP_VELOCITY = Math.sqrt(2 * JUMP_HEIGHT * GRAVITY) / 2;
//export const GRAVITY = 0.11;
//export const JUMP_VELOCITY = 2.4;

//export const JUMP_VELOCITY = 2 * JUMP_HEIGHT / JUMP_DURATION;

export const PLAYER_FOOT_SPEED = 0.4;

export const JUMP_VELOCITY = -2 * JUMP_HEIGHT * PLAYER_FOOT_SPEED / JUMP_HEIGHT_DISTANCE;
export const GRAVITY = 2 * JUMP_HEIGHT * PLAYER_FOOT_SPEED * PLAYER_FOOT_SPEED / (JUMP_HEIGHT_DISTANCE * JUMP_HEIGHT_DISTANCE);

//export const GRAVITY = 2 * JUMP_HEIGHT / JUMP_DURATION * JUMP_DURATION;

export const TERMINAL_VELOCITY = 1.4;

// If the bounding box of a jumping character hits a platform and the feet of
// the character are within this many pixels of the top of the floor, pretend
// that they "made the jump".
export const JUMP_CHEAT_Y_PIXELS = 2;
