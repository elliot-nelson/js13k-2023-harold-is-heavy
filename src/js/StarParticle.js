// StarParticle
//
// Star particles are spawned when player spawns in level and around
// friends when rescued from crates.

import { Sprite } from './Sprite';
import { angle2vector, vector2point } from './Util';

export class StarParticle {
    constructor(pos, extra) {
        this.frame = 0;
        this.pos = { ...pos };
        this.angle = Math.random() * Math.PI * 2;
        this.vel = vector2point(angle2vector(this.angle, 2.7));
        this.a = 10 * Math.PI / 180;
        this.noClipEntity = true;
        this.radius = 1;
        this.r = Math.random() * Math.PI * 2;
        this.t = -1 - (extra || 0);
        this.d = 12;
        this.z = 1;

        // TEMPORARY
        this.noClipWall = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.vel.x *= 0.9;
        this.vel.y *= 0.9;
        //this.vel.x *= 0.9;
        //this.vel.y = clamp(this.vel.y + 0.11, -10, 2);
        this.a *= 0.99;
        this.r += this.a;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.star2[this.frame], this.pos, this.r);
    }
}
