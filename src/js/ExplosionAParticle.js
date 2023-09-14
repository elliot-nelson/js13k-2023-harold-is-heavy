// ExplosionAParticle
//
// "Explosion A" is a short white/tan explosion used when the player
// lands on an enemy or breaks a crate.

import { Sprite } from './Sprite';

export class ExplosionAParticle {
    constructor(pos) {
        this.frame = 0;
        this.pos = { ...pos };
        this.noClipEntity = true;
        this.t = -1;
        this.d = 30;

        // TEMPORARY
        this.noClipWall = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        if (this.t === 16) this.frame++;
        if (this.t === 25) this.frame++;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.explosiona[this.frame], this.pos, this.r);
    }
}
