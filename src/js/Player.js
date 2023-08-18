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
        this.jumpLength = 0;
        this.jumpFrames = 0;
    }

    update() {
        let v = {
            x: Input.direction.x * Input.direction.m * 0.4,
            y: Input.direction.y * Input.direction.m * 0.4
        };

        this.vel.x = (this.vel.x + v.x) / 2;
        //this.vel.y = (this.vel.y + v.y) / 2;

        // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;

        if (Input.pressed[Input.Action.JUMP]) {
            this.jumpFrames = 20;
            this.jumpLength = 0;
        }

        if (this.jumpFrames > 0) {
            this.jumpFrames--;
            this.jumpLength++;
            this.vel.y = -1;
        }

        if (Input.held[Input.Action.JUMP] && this.jumpFrames < 1 && this.jumpLength < 30) {
            this.jumpFrames = 1;
        }

        this.vel.y += 0.11;

        if (this.vel.y > 2.5) this.vel.y = 2.5;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.bigpig[this.frame], { x: this.pos.x, y: this.pos.y });
    }
}
