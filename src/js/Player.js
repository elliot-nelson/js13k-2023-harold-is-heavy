// Player

import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';
import { Input } from './input/Input';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.frame = 0;
        this.radius = 4;
    }

    update() {
        let v = {
            x: Input.direction.x * Input.direction.m * 0.9,
            y: Input.direction.y * Input.direction.m * 0.9
        };

        this.vel.x = (this.vel.x + v.x) / 2;
        this.vel.y = (this.vel.y + v.y) / 2;

        // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.bigpig[this.frame], { x: this.pos.x, y: this.pos.y });
    }
}
