// LittlePigBox

import { R45, R90, R180, R360, TILE_SIZE } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LittlePigBoxParticle } from './LittlePigBoxParticle';
import { ExplosionAParticle } from './ExplosionAParticle';
import { LittlePig } from './LittlePig';
import { qr2xy, xy2qr, centerxy } from './Util';

export class LittlePigBox {
    constructor(qr) {
        this.qr = { ...qr };
        this.bb = [{ x: -7, y: -5 }, { x: 7, y: 6 }];
        this.immune = true;

        this.pos = centerxy(qr2xy(qr));
        this.pos.y = (qr.r + 1) * TILE_SIZE - this.bb[1].y;
        this.t = 0;

        this.shakeY = 0;
    }

    update() {
        this.t++;

        if (this.shakeX > 0) this.shakeX--;
        if (this.shakeY > 0) this.shakeY--;

        if (!this.shakeY && !this.shakeX && Math.random() < 0.01) {
            this.shakeX = 30;
        }
        if (!this.shakeY && !this.shakeX && Math.random() < 0.01) {
            this.shakeY = 8;
        }
    }

    draw() {
        let shakeX = 0, shakeY = 0;
        if (this.shakeY) shakeY = -1;
        if (this.shakeX) {
            if (this.shakeX > 20 || this.shakeX < 10) shakeX = 1;
        }
        Sprite.drawViewportSprite(Sprite.littlepigbox[0], { x: this.pos.x + shakeX, y: this.pos.y + shakeY });
    }

    landedOnTile(tile) {
        if (this.qr.r === tile.r - 1 && Math.abs(this.qr.q - tile.q) <= 2 && !this.cull) {
            game.levelScreen.addEntity(new ExplosionAParticle({ x: this.pos.x, y: this.pos.y }));
            game.levelScreen.addEntity(new LittlePigBoxParticle(1, { x: this.pos.x, y: this.pos.y }, 225 * Math.PI / 180, 0));
            game.levelScreen.addEntity(new LittlePigBoxParticle(2, { x: this.pos.x + 2, y: this.pos.y }, 246 * Math.PI / 180, 0));
            game.levelScreen.addEntity(new LittlePigBoxParticle(2, { x: this.pos.x + 2, y: this.pos.y }, 292 * Math.PI / 180, R180));
            game.levelScreen.addEntity(new LittlePigBoxParticle(3, { x: this.pos.x + 4, y: this.pos.y }, 270 * Math.PI / 180, R45));
            game.levelScreen.addEntity(new LittlePigBoxParticle(1, { x: this.pos.x + 10, y: this.pos.y }, 315 * Math.PI / 180, 0));
            game.levelScreen.addEntity(new LittlePig(this.pos));
            this.cull = true;
        }
    }
}
