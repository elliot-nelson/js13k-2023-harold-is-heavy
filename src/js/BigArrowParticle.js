// Gore

import { game } from './Game';
import { R45, R90, R360 } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd } from './Util';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { clamp } from './Util';

export class BigArrowParticle {
    constructor(pos) {
        this.frame = 0;
        this.pos = { ...pos };
        this.t = 0;
        this.d = 15;
        this.z = 5;

        // TEMPORARY
        this.noClipEntity = true;
        this.noClipWall = true;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.pos.y += 1;
    }

    draw() {
        Viewport.ctx.globalAlpha = 0.6;
        Sprite.drawViewportSprite(Sprite.bigarrow[this.frame], this.pos);
        Viewport.ctx.globalAlpha = 1;
    }
}
