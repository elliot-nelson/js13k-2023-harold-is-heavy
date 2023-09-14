// BloodPoolParticle

import { Sprite } from './Sprite';

export class BloodPoolParticle {
    constructor(pos) {
        this.frame = 0;
        this.pos = { ...pos };
        this.noClipEntity = true;
        this.t = -1;
        this.d = 56;

        // TEMPORARY
        this.noClipWall = true;

        this.pos.y = this.pos.y + 8 - (this.pos.y % 8) + 2;
    }

    update() {
        if (++this.t === this.d) this.cull = true;

        this.frame = Math.floor(this.t * 8 / 16);
        if (this.frame > 7) this.frame = 7;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.bleed[this.frame], this.pos);
    }
}
