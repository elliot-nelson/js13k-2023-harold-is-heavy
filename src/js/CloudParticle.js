// CloudParticle
//
// Cloud particles slowly move across the top of the screen. They are drawn
// a bit different because their coordinate system is the screen, not the map.

import { Sprite } from './Sprite';
import { Viewport } from './Viewport';

export class CloudParticle {
    constructor(middle) {
        let velDice = Math.floor(Math.random() * 3);
        let velX = [0.1, 0.2, 0.3];

        this.frame = Math.floor(Math.random() * 4);
        this.pos = {
            x: middle ? Viewport.width / 2 + Math.random() * 40 : Viewport.width + 1,
            y: Math.floor(Math.random() * 30 + 2)
        };
        this.vel = {
            x: 0 - velX[velDice],
            y: 0
        };
        this.z = -1;

        // TEMPORARY
        this.noClipWall = true;
        this.noClipEntity = true;
    }

    update() {
        if (this.pos.x < -30) this.cull = true;
    }

    draw() {
        // Our "x,y" is ACTUALLY a "u,v", which is a bit confusing... clouds don't move with
        // the tileset in this game.
        Viewport.ctx.drawImage(Sprite.clouds[this.frame].img, this.pos.x, this.pos.y);
    }
}
