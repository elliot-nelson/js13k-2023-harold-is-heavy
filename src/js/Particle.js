// Gore

import { game } from './Game';
import { R45, R90, R360 } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd } from './Util';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { clamp } from './Util';

export class LandingParticle {
    constructor(pos) {
        this.pos = { ...pos };
        this.pos.x += Math.random() * 8 - 4;
        this.angle = Math.random() * Math.PI * 2;
        this.vel = vector2point(angle2vector(this.angle, 1.7));

        //this.bounce = true;
        this.radius = 1;
        this.r = 0;
        this.t = -1;
        this.d = 60;

        // TEMPORARY
        this.noClipWall = true;
        this.noClipEntity = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.vel.x *= 0.9;
        this.vel.y = clamp(this.vel.y + 0.05, -10, 1.5);
        //this.a *= 0.99;
        //this.r += this.a;
    }

    draw() {
        //Sprite.drawViewportSprite(Sprite.littlepigbox[0], this.pos, this.r);
        Sprite.drawViewportSprite(Sprite.particle[0], this.pos, this.r);
    }
}
