// Player

import { Audio } from './Audio';
import { BloodPoolParticle } from './BloodPoolParticle';
import { GRAVITY, TILE_SIZE } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { clamp, xy2qr } from './Util';

const PATROL = 0;
const FLIPPING = 1;
const FLIPPED = 2;

const MOVE_SPEED = 0.5;
const PAUSE_FRAMES = 5;

export class Hedgehog {
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
        this.r = 0;

        this.bb = [{ x: -5, y: -4 }, { x: 6, y: 4 }];
        this.abb = [{ x: -5, y: -4 }, { x: 6, y: 4 }];
        this.hbb = [{ x: -5, y: -4 }, { x: 6, y: 4 }];

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

        this.immune = !action.vulnerable;
        this.r = 0;

        if (action.pause) {
            this.frame = 0;
            action.pause--;
            if (action.pause < 1) this.stack.pop();
        } else if (action.walk) {
            if (!game.levelScreen.entityIsOnSolidGround(this)) {
                this.frame = 0;
                this.vel.x *= 0.9;
            }
            this.vel.x += this.facing * MOVE_SPEED / 5;
            this.vel.x = clamp(this.vel.x, -MOVE_SPEED, MOVE_SPEED);

            let nextTile = xy2qr({ x: this.pos.x + this.vel.x, y: this.pos.y });
            if (game.levelScreen.tileIsPassable(nextTile.q, nextTile.r + 1) ||
                (this.vel.x < 0 && (this.pos.x - (nextTile.q - 1) * TILE_SIZE < 12) && !game.levelScreen.tileIsPassable(nextTile.q - 1, nextTile.r)) ||
                (this.vel.x > 0 && ((nextTile.q + 1) * TILE_SIZE - this.pos.x < 12) && !game.levelScreen.tileIsPassable(nextTile.q + 1, nextTile.r))) {
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
            action.crush--;
            if (action.crush === 2) {
                game.levelScreen.addEntity(new BloodPoolParticle(this.pos));
            }
            if (action.crush === 0) {
                this.cull = true;
            }
            this.frame = 2 - Math.floor(action.crush / 3);
        } else if (action.flip) {
            action.flip++;
            if (action.flip === 2) {
                this.vel.x = 0;
            }
            if (action.flip === 4) {
                this.vel.y = -2.3;
            }
            this.r = (action.flip / 10) * Math.PI;
            if (action.flip === 10) {
                this.stack.pop();
                this.stack.push({ liedown: 1, vulnerable: true });
            }
        } else if (action.liedown) {
            action.liedown++;
            if (action.liedown > 120) {
                this.stack.pop();
            }
            this.r = Math.PI;
            this.frame = (Math.floor(action.liedown / 5) % 2) + 1;
        }

        this.vel.y += GRAVITY;
    }

    draw() {
        if (this.dead) {
            Sprite.drawViewportSprite(Sprite.explosiona[this.frame], this.pos);
        } else {
            Sprite.drawViewportSprite(Sprite.hedgehog[this.facing === 1 ? 0 : 1][this.frame], this.pos, this.r);
        }
    }

    landedNearby(enemy) {
        if (!this.dead) {
            this.stack.push({ flip: 1 });
        }
    }

    crushedBy(enemy) {
        if (!this.dead) {
            this.dead = true;
            this.stack = [{ crush: 8 }];
            game.levelScreen.enemiesAlive--;
            Audio.play(Audio.enemyDeath);
        }
    }

    attack(victim) {
        victim.dieHit(this);
    }
}
