// Game

import { Audio } from './Audio';
import { Camera } from './Camera';
import { FPS } from './Constants';
import { IntroScreen } from './IntroScreen';
import { LevelScreen } from './LevelScreen';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { VictoryScreen } from './VictoryScreen';
import { Viewport } from './Viewport';
import { LevelData } from './generated/LevelData-gen';
import { Input } from './input/Input';

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

        this.scores = [
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 }
        ];

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
            if (this.nextLevel >= LevelData.length) {
                this.screens.push(new VictoryScreen());
            } else {
                this.screens.push(new LevelScreen(this.nextLevel));
            }
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

    speedrunScore() {
        let score = 100000;

        for (let i = 0; i < this.scores.length; i++) {
            score -= this.scores[i].time;
            score -= this.scores[i].enemiesAlive * 5 * 60;
        }

        let scoreText = String(score);
        if (scoreText.length > 3) {

            scoreText = scoreText.slice(0, scoreText.length - 3) + ',' + scoreText.slice(scoreText.length - 3);
        }

        return scoreText;
    }
}

export const game = new Game();
