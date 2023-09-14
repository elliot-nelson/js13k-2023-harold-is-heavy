// LandingParticle

import { GRAVITY, TERMINAL_VELOCITY } from './Constants';
import { Sprite } from './Sprite';
import { angle2vector, clamp, vector2point } from './Util';

export class LandingParticle {
    constructor(pos) {
        this.pos = { ...pos };
        this.angle = (Math.random() * Math.PI * 0.8) + Math.PI * 1.1;
        this.vel = vector2point(angle2vector(this.angle, 1.5));
        this.pos.x += this.vel.x * 3;
        this.pos.y += 5;
        this.vel.x /= 10;
        this.z = 12;

        this.radius = 1;
        this.r = 0;
        this.t = -1;
        this.d = 12;

        // TEMPORARY
        this.noClipWall = true;
        this.noClipEntity = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.vel.x *= 0.99;
        this.vel.y = clamp(this.vel.y + GRAVITY / 2, -TERMINAL_VELOCITY, TERMINAL_VELOCITY);
        //this.a *= 0.99;
        //this.r += this.a;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.particle[0], this.pos, this.r);
    }
}
