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
import { qr2xy, xy2qr, centerxy, vectorBetween, manhattanXY, rgba } from './Util';
import { Text } from './Text';

const SIGN_TEXT = [
    'pn TO MOVE HAROLD',
    'SPACEBAR TO JUMP',
    'mo TO PEEK UP AND DOWN',
    'HAROLD IS HEAVY! SLAM THE GROUND\n' +
    'NEAR CRATES TO BREAK THEM OPEN',
    'THE KING IS CAPTURING YOUR FRIENDS\n' +
    'AND TURNING THEM INTO SANDALS!\n' +
    'BREAK ALL THE CRATES TO RESCUE THEM'
];

export class Sign {
    constructor(qr, signNumber) {
        this.qr = { ...qr };
        this.bb = [{ x: -7, y: -5 }, { x: 7, y: 6 }];
        this.immune = true;
        this.signIndex = signNumber - 1;

        this.pos = centerxy(qr2xy(qr));
        this.pos.y = (qr.r + 1) * TILE_SIZE - this.bb[1].y;
        this.t = 0;

        this.text = SIGN_TEXT[this.signIndex];
        this.displayOverlay = false;
        this.overlaySize = Text.measure(this.text);
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

        console.log(manhattanXY(this.pos, game.screen.player.pos));
        this.displayOverlay = (manhattanXY(this.pos, game.screen.player.pos) < 12);
    }

    draw() {
        let shakeX = 0, shakeY = 0;
        Sprite.drawViewportSprite(Sprite.sign[0], { x: this.pos.x + shakeX, y: this.pos.y + shakeY });
    }

    drawOverlay() {
        let u = (Viewport.width - this.overlaySize.w) / 2;
        let v = (Viewport.height / 2) + 24;

        Viewport.ctx.fillStyle = rgba(44, 27, 46, 0.6);
        //Viewport.ctx.fillStyle = rgba(148, 53, 61, 0.66);
        Viewport.ctx.fillRect(u - 2, v - 2, this.overlaySize.w + 3, this.overlaySize.h + 2);

        Text.drawText(Viewport.ctx, this.text, (Viewport.width - this.overlaySize.w) / 2, (Viewport.height / 2) + 24, 1, Text.tan, Text.shadow);
    }
}
