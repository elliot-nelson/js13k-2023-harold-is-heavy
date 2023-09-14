// LittlePigBoxParticle
//
// A little pig box particle is a "piece of debris" thrown from a broken crate,
// several are spawned flying off in different directions.

import { Sprite } from './Sprite';
import { angle2vector, clamp, vector2point } from './Util';

export class LittlePigBoxParticle {
    constructor(frame, pos, angle, r) {
        this.frame = frame;
        this.pos = { ...pos };
        this.angle = angle;
        this.vel = vector2point(angle2vector(this.angle, 1.7));
        this.a = 10 * Math.PI / 180;
        this.noClipEntity = true;
        //this.bounce = true;
        this.radius = 1;
        this.r = r;
        this.t = -1;
        this.d = 60;

        // TEMPORARY
        //this.noClipWall = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.vel.x *= 0.9;
        this.vel.y = clamp(this.vel.y + 0.11, -10, 2);
        this.a *= 0.99;
        this.r += this.a;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.littlepigbox[this.frame], this.pos, this.r);
    }
}
