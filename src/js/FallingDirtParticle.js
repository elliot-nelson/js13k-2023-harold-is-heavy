// FallingDirtParticle
//
// A falling dirt particle is spawned only beneath tiles that are super-slammable
// (can be pushed down by the player), whenever the player lands.

import { Sprite } from './Sprite';
import { Viewport } from './Viewport';

export class FallingDirtParticle {
    constructor(pos) {
        this.frame = Math.floor(Math.random() * 2);
        this.pos = { ...pos };
        this.t = 0;
        this.d = 15;
        this.z = 4;

        // TEMPORARY
        this.noClipEntity = true;
        this.noClipWall = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.pos.y += 0.5;
    }

    draw() {
        Viewport.ctx.globalAlpha = 1;
        Sprite.drawViewportSprite(Sprite.dirt[this.frame], this.pos);
    }
}
