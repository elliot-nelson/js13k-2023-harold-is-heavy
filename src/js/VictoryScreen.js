// VictoryScreen

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { game } from './Game';

export class VictoryScreen {
    constructor() {
        this.text = [
            'THANKS FOR PLAYING ACT 1 OF HAROLD IS HEAVY!',
            '',
            'ACT 1 IS SHAREWARE. TO FINISH HAROLD\'S ADVENTURE,',
            'ORDER THE FULL GAME VIA CHECK OR MONEY ORDER USING',
            'THE ORDER.FRM FILE DISTRIBUTED WITH YOUR GAME.',
            '',
            'THANK YOU FOR SUPPORTING THE SHAREWARE MOVEMENT.'
        ];
        this.frames = 0;
    }

    update() {
        this.frames++;

        return true;
    }

    draw() {
        Viewport.ctx.fillStyle = '#457cd6';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        for (let i = 0; i < this.text.length; i++) {
            let width = Text.measure(this.text[i], 1).w;
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, 24 + i * 10, 1, Text.white, Text.shadow);
        }
    }
}
