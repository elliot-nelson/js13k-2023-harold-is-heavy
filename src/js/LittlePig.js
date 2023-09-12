
// LittlePig

import { R45, R90, R180, R360, TILE_SIZE, JUMP_VELOCITY, GRAVITY, TERMINAL_VELOCITY, TARGET_GAME_WIDTH } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LittlePigBoxParticle } from './LittlePigBoxParticle';
import { ExplosionAParticle } from './ExplosionAParticle';
import { qr2xy, xy2qr, centerxy, xy2uv } from './Util';
import { StarParticle } from './StarParticle';
import { Audio } from './Audio';

export class LittlePig {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.bb = [{ x: -7, y: -5 }, { x: 7, y: 6 }];
        this.t = 0;
        this.r = 0;
        this.z = 5;
        this.immune = true;

        this.noClipWall = true;
        this.noClipEntity = true;
        this.newClip = true;
        this.id = Math.random();
    }

    update() {
        this.t++;

        if (this.t === 5) {
            this.vel.y = JUMP_VELOCITY - GRAVITY;
            this.newClip = false;
            Audio.play(Audio.littleJump);
        } else if (this.t > 5 && this.t < 32) {
            this.r = (this.t / 32) * Math.PI * 2;
        } else if (this.t === 32) {
            this.r = 0;
            this.vel.x = 3.7;
            this.vel.y = JUMP_VELOCITY - GRAVITY - GRAVITY;
            Audio.play(Audio.littleEscape);
        } else if (this.t > 32) {
            this.vel.y -= GRAVITY * 0.5;
        }

        if (this.t % 3 === 0) {
            game.levelScreen.addEntity(new StarParticle(this.pos, 0));
        }

        this.vel.y += GRAVITY * 0.9;

/*        if (this.t > 80) {
            this.r += 2 * Math.PI / 180;
        }

        if (this.t > 90) {
            this.r += 2 * Math.PI / 180;
        }

        if (this.t > 100) {
            this.r += 2 * Math.PI / 180;
            this.vel.x += 0.05;
        }*/

        //if (this.vel.y > TERMINAL_VELOCITY) this.vel.y = TERMINAL_VELOCITY;

        if (this.vel.x > 0) this.facing = 0;
        if (this.vel.x < 0) this.facing = 1;

        if (xy2uv(this.pos).u > Viewport.width) {
            this.cull = true;
            game.levelScreen.rescueLittlePig();
        }
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.littlepig[0][0], this.pos, this.r);
    }
}
