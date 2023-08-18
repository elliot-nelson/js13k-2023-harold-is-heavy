// Player

import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { Viewport } from './Viewport';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.frame = 0;
    }

    update() {
        this.pos = { x: 0, y: 0 };
        console.log(this.pos);
    }

    draw() {
        Viewport.ctx.fillStyle = '#209020';
        Viewport.ctx.fillRect(5, 5, 10, 10);

        Sprite.drawViewportSprite(Sprite.bigpig[this.frame], { x: this.pos.x, y: this.pos.y });

        Sprite.drawViewportSprite(Sprite.tiles[3], { x: this.pos.x, y: this.pos.y });

//        Sprite.drawViewportSprite(Sprite.bigpig[this.frame], { x: Camera.pos.x, y: Camera.pos.y });
    }
}
