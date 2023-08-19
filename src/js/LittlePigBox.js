// LittlePigBox

import { R45, R90, R180, R360 } from './Constants';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { game } from './Game';
import { LittlePigBoxParticle } from './LittlePigBoxParticle';

export class LittlePigBox {
    constructor(pos) {
        this.pos = { ...pos };
        this.t = 0;
    }

    update() {
        this.t++;

        if (this.t === 60) {
            game.screen.entities.push(new LittlePigBoxParticle(1, { x: this.pos.x, y: this.pos.y }, 225 * Math.PI / 180, 0));
            game.screen.entities.push(new LittlePigBoxParticle(2, { x: this.pos.x + 2, y: this.pos.y }, 246 * Math.PI / 180, 0));
            game.screen.entities.push(new LittlePigBoxParticle(2, { x: this.pos.x + 2, y: this.pos.y }, 292 * Math.PI / 180, R180));
            game.screen.entities.push(new LittlePigBoxParticle(3, { x: this.pos.x + 4, y: this.pos.y }, 270 * Math.PI / 180, R45));
            game.screen.entities.push(new LittlePigBoxParticle(1, { x: this.pos.x + 10, y: this.pos.y }, 315 * Math.PI / 180, 0));
        }
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.littlepigbox[0], this.pos);
    }
}
