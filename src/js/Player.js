// Player

import { JUMP_VELOCITY, GRAVITY, TERMINAL_VELOCITY, PLAYER_FOOT_SPEED, TARGET_GAME_HEIGHT } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LandingParticle } from './Particle';
import { clamp, uv2xy, xy2qr } from './Util';
import { ScreenShake } from './ScreenShake';
import { ExplosionBParticle } from './ExplosionBParticle';

const PLAYING = 1;
const DYING = 2;

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.frame = 0;
        this.radius = 4;
        this.jumpLength = 0;
        this.jumpFrames = 0;
        this.facing = 0;
        this.isJumping = true;
        this.team = 0;
        this.z = 10;
        this.highestY = this.pos.y;
        this.state = PLAYING;

        this.bb = [{ x: -4, y: -4 }, { x: 4, y: 5 }];
        this.abb = [{ x: -4, y: 4 }, { x: 4, y: 5 }];

        // temp
        this.noClipWall = true;
        this.newClip = true;
    }

    update() {
        if (this.state === DYING) {
            this.stateFrames++;
            if (this.stateFrames > 30) {
                game.restartLevel();
            }
            return;
        }

        if (this.pos.y < this.highestY) {
            this.highestY = this.pos.y;
        }

        let v = {
            x: Input.direction.x * Input.direction.m * PLAYER_FOOT_SPEED,
            y: Input.direction.y * Input.direction.m * 0.4
        };

        this.vel.x = clamp((this.vel.x + v.x) / 2, -PLAYER_FOOT_SPEED, PLAYER_FOOT_SPEED);
        //this.vel.y = (this.vel.y + v.y) / 2;

        // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;

        if (Input.pressed[Input.Action.JUMP] && !this.isJumping) {
            this.isJumping = true;
            //this.jumpFrames = 16;
            //this.jumpLength = 0;
            this.vel.y = JUMP_VELOCITY - GRAVITY;
        }

        /*if (this.jumpFrames > 0) {
            this.jumpFrames--;
            this.jumpLength++;
            this.vel.y = -1.2;
        }

        if (Input.held[Input.Action.JUMP] && this.jumpFrames < 1 && this.jumpLength < 36) {
            this.jumpFrames = 1;
        }*/

        if (this.vel.y < 0) {
            this.frame = 3;
        } else if (this.vel.y > 0) {
            this.frame = 4;
            if (this.pos.y - this.highestY > 12) {
                this.frame = 5;
            }
        } else if (Math.abs(this.vel.x) < 0.1) {
            this.frame = 0;
        } else {
            this.frame = (Math.floor(this.pos.x / 8) % 2) + 1;
        }

        this.vel.y += GRAVITY;
        //this.vel.y += 0.12;

        if (this.vel.y > TERMINAL_VELOCITY) this.vel.y = TERMINAL_VELOCITY;

        if (this.vel.x > 0) this.facing = 0;
        if (this.vel.x < 0) this.facing = 1;
    }

    landedOnTile(tile) {
        let distanceFallen = this.pos.y - this.highestY;
        this.highestY = this.pos.y;

        if (this.isJumping) {
            this.isJumping = false;
        }

        if (distanceFallen > 4) {
            game.screen.landedOnTile(tile);
            game.screen.screenshakes.push(new ScreenShake(12, 0, 3));
            game.screen.addTileShake(new ScreenShake(15, 0, 9), tile);
        }
    }

    draw() {
        let qr = xy2qr(this.pos);
        let shakemap = game.screen.tileshakemap[qr.r + 1]?.[qr.q];
        let y = shakemap && shakemap.y ? shakemap.y : 0;

        Sprite.drawViewportSprite(Sprite.bigpig[this.facing][this.frame], { x: this.pos.x, y: this.pos.y + y });
    }

    attack(victim) {
        victim.crushedBy(this);
    }

    dieFalling(levelBottomY) {
        if (this.state !== DYING) {
            this.state = DYING;
            this.vel.x = 0;
            this.stateFrames = 0;
            game.screen.addEntity(new ExplosionBParticle({ x: this.pos.x, y: levelBottomY - 2 }));
        }
    }
}
