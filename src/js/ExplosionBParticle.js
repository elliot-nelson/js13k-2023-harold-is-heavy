// ExplosionBParticle
//
// "Explosion B" is a short pink/white explosion used when the player
// dies (i.e. falls off the screen or touches an enemy).

import { Sprite } from './Sprite';

export class ExplosionBParticle {
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
        if (this.t === 6) this.frame++;
        if (this.t === 12) this.frame++;
        if (this.t === 18) this.frame++;
        if (this.t === 24) this.frame++;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.explosionb[this.frame], this.pos, this.r);
    }
}
