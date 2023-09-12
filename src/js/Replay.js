
import { Input } from './input/Input';

export class Replay {
    constructor(levelNumber) {
        this.levelNumber = levelNumber;
        this.frames = [];
        this.replayIndex = 0;
    }

    record() {
        if (this.frames.length < 3000) {
            this.frames.push({
                direction: { ...Input.direction },
                pressed: {...Input.pressed }
            });
        }
    }

    reset() {
        this.replayIndex = 0;
    }

    replay() {
        if (this.replayIndex < this.frames.length) {
            this.direction = this.frames[this.replayIndex].direction;
            this.pressed = this.frames[this.replayIndex].pressed;
            this.replayIndex++;
        } else {
            this.direction = { x: 0, y: 0, m: 1 };
            this.pressed = {};
        }
    }

    done() {
        return this.replayIndex >= this.frames.length;
    }
}
