// Game

import { FPS } from './Constants';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { Audio } from './Audio';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';

import { Camera } from './Camera';
import { VictoryScreen } from './VictoryScreen';
import { DefeatScreen } from './DefeatScreen';

import { LevelScreen } from './LevelScreen';
import { IntroScreen } from './IntroScreen';

/**
 * Game state.
 */
export class Game {
    init() {
        Sprite.loadSpritesheet(() => {
            Viewport.init();
            Sprite.init();
            Text.init();
            Input.init();
            Audio.init();

            Camera.init();

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.reset();
            this.start();
        });
    }

    reset() {
        this.screens = [];
        this.lastFrame = 0;
        this.nextLevel = 0;

        this.screens.push(new IntroScreen());
    }

    start() {
        this.frame = 0;
        this.framestamps = [0];
        this.update();
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));
    }

    onFrame(currentms) {
        let startTime= new Date().getTime();

        /*this.framestamps.push(currentms);*/
        if (this.framestamps.length >= 40) {
            this.framestamps.shift();
        }
        this.fps = 1000 / ((this.framestamps[this.framestamps.length - 1] - this.framestamps[0]) / this.framestamps.length);

        if (currentms - this.lastFrame >= 1000 / FPS) {
            this.frame++;
            this.lastFrame = currentms;
            Viewport.resize();
            this.update();
            this.draw(Viewport.ctx);
        }
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));

        let endTime = new Date().getTime();
        this.framestamps.push(this.framestamps[this.framestamps.length - 1] + endTime - startTime);
    }

    update() {
        // Gather user input
        Input.update();

        // Handle special keys that are screen-independent
        if (Input.pressed[Input.Action.MUSIC_TOGGLE]) {
            Audio.musicEnabled = !Audio.musicEnabled;
        }
        if (Input.pressed[Input.Action.SFX_TOGGLE]) {
            Audio.sfxEnabled = !Audio.sfxEnabled;
        }

        // Hand off control to the current "screen" (for example, game screen or menu)
        if (this.screens.length === 0) {
            this.screens.push(new LevelScreen(this.nextLevel));
        }
        this.screen = this.screens[this.screens.length - 1];
        this.screen.update();

        // Do per-frame audio updates
        Audio.update();
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(1, 0, 0, 1, 0, 0);
        Viewport.ctx.scale(Viewport.scale, Viewport.scale);

        this.screen.draw();
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        Audio.pause();
    }

    unpause() {
        if (!this.paused) return;
        this.paused = false;
        Audio.unpause();
    }

    restartLevel() {
        this.screens.pop();
    }
}

export const game = new Game();
