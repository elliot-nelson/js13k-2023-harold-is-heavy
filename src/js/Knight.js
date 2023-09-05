// Player

import { JUMP_VELOCITY, GRAVITY, TERMINAL_VELOCITY, PLAYER_FOOT_SPEED } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LandingParticle } from './Particle';
import { clamp, xy2qr } from './Util';
import { BloodPoolParticle } from './BloodPoolParticle';
import { Audio } from './Audio';

const PATROL = 0;
const MOVE_SPEED = 0.5;
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
        this.team = 2;
        this.z = 4;

        this.bb = [{ x: -3, y: -6 }, { x: 3, y: 6 }];
        this.hbb = [{ x: -3, y: -6 }, { x: 3, y: -4 }];
        this.abb = [{ x: -3, y: -6 }, { x: 3, y: 6 }];

        // temp
        this.noClipWall = true;
        this.newClip = true;

        this.t = 0;

        this.stack = [];
        this.stack.push({ walk: -1 });
        this.stack.push({ pause: 5 });
    }

    update() {
        this.t++;

        let action = this.stack[this.stack.length - 1];

        if (!game.screen.entityIsOnSolidGround(this)) {
            this.frame = 0;
            this.vel.x *= 0.9;
        } else if (action.pause) {
            this.frame = 0;
            action.pause--;
            if (action.pause < 1) this.stack.pop();
        } else if (action.walk) {
            this.vel.x += this.facing * MOVE_SPEED / 5;
            this.vel.x = clamp(this.vel.x, -MOVE_SPEED, MOVE_SPEED);

            let nextTile = xy2qr({ x: this.pos.x + this.vel.x, y: this.pos.y });
            if (game.screen.tileIsPassable(nextTile.q, nextTile.r + 1)) {
                this.vel.x = 0;
                this.stack.push({ turn: -1 });
                this.stack.push({ pause: 20 });
            }
            this.frame = Math.floor(this.t / 10) % 2 + 1;
        } else if (action.turn) {
            this.frame = 0;
            this.facing = -this.facing;
            this.vel.x = -this.vel.x;
            this.stack.pop();
        } else if (action.crush) {
            let gap = (this.pos.y + this.bb[1].y) - (this.crusher.pos.y + this.crusher.bb[1].y);
            if (gap <= 2 && !this.exploded) {
                this.exploded = true;
                game.screen.addEntity(new BloodPoolParticle(this.pos));
            }
            if (gap === 0) {
                this.cull = true;
            }
            // do nothing forever
        }

        this.vel.y += GRAVITY;
    }

    draw() {
        if (this.crusher) {
            let gap = (this.pos.y + this.bb[1].y) - (this.crusher.pos.y + this.crusher.bb[1].y);
            Sprite.drawSmashedSprite(Sprite.knight[this.facing === 1 ? 0 : 1][this.frame], { x: this.pos.x, y: this.pos.y }, gap);
        } else {
            Sprite.drawViewportSprite(Sprite.knight[this.facing === 1 ? 0 : 1][this.frame], { x: this.pos.x, y: this.pos.y });
        }
    }

    crushedBy(enemy) {
        this.crusher = enemy;
        this.stack = [{ crush: -1 }];
        this.abb = undefined;
        Audio.play(Audio.enemyDeath);
    }

    attack(victim) {
        victim.dieHit(this);
    }
}
