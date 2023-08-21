// Player

import { JUMP_VELOCITY, GRAVITY, TERMINAL_VELOCITY, PLAYER_FOOT_SPEED } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LandingParticle } from './Particle';
import { clamp, xy2qr } from './Util';

const PATROL = 0;
const MOVE_SPEED = 0.25;
const PAUSE_FRAMES = 5;

export class Knight {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.frame = 0;
        this.radius = 4;
        this.jumpLength = 0;
        this.jumpFrames = 0;
        this.facing = 1;
        this.isJumping = true;

        this.bb = [{ x: -3, y: -6 }, { x: 3, y: 6 }];

        // temp
        this.noClipEntity = true;
        this.noClipWall = true;
        this.newClip = true;

        this.t = 0;

        this.stack = [];
    }

    update() {
        this.t++;

        if (this.stack.length === 0) {
            this.stack.push({ walk: -1 });
            this.stack.push({ pause: 5 });
        }

        let action = this.stack[this.stack.length - 1];

        if (!game.screen.entityIsOnSolidGround(this)) {
            console.log('falling', this.vel.y, this.pos, this.pos.y + this.bb[1].y);
            this.frame = 0;
            this.vel.x *= 0.95;
        } else if (action.pause) {
            console.log('paused');
            this.frame = 0;
            action.pause--;
            if (action.pause < 1) this.stack.pop();
        } else if (action.walk) {
            console.log('walking');
            this.vel.x += this.facing * MOVE_SPEED / 5;
            this.vel.x = clamp(this.vel.x, -MOVE_SPEED, MOVE_SPEED);

            let nextTile = xy2qr({ x: this.pos.x + this.vel.x, y: this.pos.y });
            if (game.screen.tileIsPassable(nextTile.q, nextTile.r + 1)) {
                this.vel.x = 0;
                this.stack.push({ turn: -1 });
                this.stack.push({ pause: 35 });
            }
            this.frame = Math.floor(this.t / 20) % 2 + 1;
        } else if (action.turn) {
            this.frame = 0;
            this.facing = -this.facing;
            this.vel.x = -this.vel.x;
            this.stack.pop();
        }

        this.vel.y += GRAVITY;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.knight[this.facing === 1 ? 0 : 1][this.frame], { x: this.pos.x, y: this.pos.y });
    }
}
