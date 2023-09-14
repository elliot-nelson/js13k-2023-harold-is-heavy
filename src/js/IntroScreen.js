// LevelScreen

import { GRAVITY, TERMINAL_VELOCITY } from './Constants';
import { game } from './Game';
import { LoadingScreen } from './LoadingScreen';
import { ScreenShake } from './ScreenShake';
import { Text } from './Text';
import { clamp } from './Util';
import { Viewport } from './Viewport';
import { Input } from './input/Input';

export class IntroScreen {
    constructor() {
        this.text = [
            'HAROLD',
            'IS',
            'HEAVY'
        ];
        this.pos = [
            { y: -20 },
            { y: -20 },
            { y: -20 }
        ];
        this.vel = [
            { y: 0 },
            { y: 0 },
            { y: 0 }
        ];
        this.screenshakes = [];
        this.t = 0;
        this.fadet = -1;
    }

    update() {
        this.t++;

        this.vel[0].y = clamp(this.vel[0].y + GRAVITY, 0, TERMINAL_VELOCITY);
        if (this.pos[0].y > 15) {
            this.vel[1].y = clamp(this.vel[1].y + GRAVITY, 0, TERMINAL_VELOCITY);
        }
        if (this.pos[1].y > 15) {
            this.vel[2].y = clamp(this.vel[2].y + GRAVITY, 0, TERMINAL_VELOCITY);
        }

        if (this.pos[0].y < 45) {
            this.pos[0].y += this.vel[0].y;
        } else if (!this.screenshakes[0]) {
            this.screenshakes[0] = new ScreenShake(12, 0, 3);
        }
        if (this.pos[1].y < 60) {
            this.pos[1].y += this.vel[1].y;
        } else if (!this.screenshakes[1]) {
            this.screenshakes[1] = new ScreenShake(12, 0, 3);
        }
        if (this.pos[2].y < 75) {
            this.pos[2].y += this.vel[2].y;
        } else if (!this.screenshakes[2]) {
            this.screenshakes[2] = new ScreenShake(12, 0, 3);
        }

        if (this.fadet >= 0) this.fadet++;

        if (this.fadet > 30) {
            game.screens.pop();
            game.screens.push(new LoadingScreen());
        }

        if (Input.pressed[Input.Action.JUMP] || Input.pressed[Input.Action.CONTINUE]) {
            this.fadet = 0;
        }

        for (let i = 0; i < 3; i++) {
            if (this.screenshakes[i]) {
                this.screenshakes[i].update();
            }
        }
    }

    draw() {
        Viewport.ctx.fillStyle = '#457cd6';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let shakeX = 0, shakeY = 0;
        for (let i = 0; i < 3; i++) {
            if (this.screenshakes[i]) {
                shakeX += this.screenshakes[i].x;
                shakeY += this.screenshakes[i].y;
            }
        }
        Viewport.ctx.translate(shakeX, shakeY);

        for (let i = this.text.length - 1; i >= 0; i--) {
            let width = Text.measure(this.text[i], 2).w;

            //Viewport.ctx.globalAlpha = 0.3;
            //Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, 50 + i * 15 - 4, 2, Text.pig);

            Viewport.ctx.globalAlpha = 1;
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, this.pos[i].y - 1, 2, Text.shadow);
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, this.pos[i].y + 1, 2, Text.shadow);
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2 - 1, this.pos[i].y, 2, Text.shadow);
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2 + 1, this.pos[i].y, 2, Text.shadow);
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, this.pos[i].y, 2, Text.pig);
        }

        if (this.pos[2].y > 50) {
            this.drawInstructions();
        }

        // Fade to load screen
        if (this.fadet >= 0) {
            let fade = 0;
            if (this.fadet > 8) {
                fade = (this.fadet - 8) * (Viewport.width / 2 - 40) / 20;
            }

            Viewport.ctx.fillStyle = '#2c1b2e';
            Viewport.ctx.beginPath();
            Viewport.ctx.moveTo(Viewport.width / 2 - 0 - fade, 0);
            Viewport.ctx.lineTo(Viewport.width / 2 + 40 + fade, 0);
            Viewport.ctx.lineTo(Viewport.width / 2 + 0 + fade, Viewport.height);
            Viewport.ctx.lineTo(Viewport.width / 2 - 40 - fade, Viewport.height);
            Viewport.ctx.closePath();
            Viewport.ctx.fill();
        }
    }

    drawInstructions() {
        let text = 'PRESS SPACE OR ENTER TO START';
        let width = Text.measure(text, 1).w;

        if (this.t % 30 < 24) {
            Text.drawText(Viewport.ctx, text, (Viewport.width - width) / 2, Viewport.height - 10, 1, Text.white, Text.shadow);
        }
    }
}
