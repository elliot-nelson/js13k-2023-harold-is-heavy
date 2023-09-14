// Player

import { Audio } from './Audio';
import { GRAVITY, JUMP_CHEAT_LANDING_FRAMES, JUMP_VELOCITY, PLAYER_FOOT_SPEED, SLAM_ENEMY_DISTANCE, SUPER_SLAM_FALL_DISTANCE, TERMINAL_VELOCITY } from './Constants';
import { ExplosionBParticle } from './ExplosionBParticle';
import { game } from './Game';
import { ScreenShake } from './ScreenShake';
import { Sprite } from './Sprite';
import { clamp, xy2qr } from './Util';
import { Viewport } from './Viewport';
import { Input } from './input/Input';

const PLAYING = 1;
const DYING = 2;

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.frame = 0;
        this.radius = 4;
        this.jumpLength = 0;
        this.jumpFrames = 0;
        this.facing = 0;
        this.isJumping = true;
        this.lastJumpPressed = 0;
        this.team = 1;
        this.z = 10;
        this.highestY = this.pos.y;
        this.state = PLAYING;
        this.last = [this.pos, this.pos];
        this.dead = false;

        this.bb = [{ x: -4, y: -4 }, { x: 4, y: 5 }];
        this.hbb = [{ x: -4, y: -4 }, { x: 4, y: 5 }];
        this.abb = [{ x: -6, y: 4 }, { x: 6, y: 5 }];

        // temp
        this.noClipWall = true;
        this.newClip = true;
    }

    update() {
        let input = Input;

        // The player character has two modes -- if we're RECORDING (default), then we take
        // the current Input set and record this frame. If we're REPLAYING (victory screen),
        // we grab the next input frame from the recording and use that as our input.
        if (this.recording) {
            this.recording.record();
        } else if (this.replay) {
            this.replay.replay();
            input = this.replay;
        }

        this.last[1] = { ...this.last[0] };
        this.last[0] = { ...this.pos };

        if (this.state === DYING) {
            this.stateFrames++;
            if (this.stateFrames > 30) {
                game.restartLevel();
            }
            return;
        }

        if (this.pos.y < this.highestY) {
            this.highestY = this.pos.y;
        }

        let v = {
            x: input.direction.x * input.direction.m * PLAYER_FOOT_SPEED,
            y: input.direction.y * input.direction.m * 0.4
        };

        this.vel.x = clamp((this.vel.x + v.x) / 2, -PLAYER_FOOT_SPEED, PLAYER_FOOT_SPEED);
        //this.vel.y = (this.vel.y + v.y) / 2;

        // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;

        if (input.pressed[Input.Action.JUMP]) {
            this.lastJumpPressed = game.frame;
        }

        if (!this.isJumping && game.frame - this.lastJumpPressed <= JUMP_CHEAT_LANDING_FRAMES) {
            this.isJumping = true;
            this.lastJumpPressed = 0;
            //this.jumpFrames = 16;
            //this.jumpLength = 0;
            this.vel.y = JUMP_VELOCITY - GRAVITY;
            Audio.play(Audio.playerJump);
        }

        /*if (this.jumpFrames > 0) {
            this.jumpFrames--;
            this.jumpLength++;
            this.vel.y = -1.2;
        }

        if (Input.held[Input.Action.JUMP] && this.jumpFrames < 1 && this.jumpLength < 36) {
            this.jumpFrames = 1;
        }*/

        if (this.vel.y < 0) {
            this.frame = 3;
        } else if (this.vel.y > 0) {
            // If you start falling, you can't jump anymore
            this.isJumping = true;

            this.frame = 4;
            if (this.pos.y - this.highestY > 12) {
                this.frame = 5;
            }
            /*if (this.pos.y - this.highestY > 32) {
                this.frame = 6;
            }*/
        } else if (Math.abs(this.vel.x) < 0.1) {
            this.frame = 0;
        } else {
            this.frame = (Math.floor(this.pos.x / 8) % 2) + 1;
        }

        this.vel.y += GRAVITY;
        //this.vel.y += 0.12;

        if (this.vel.y > TERMINAL_VELOCITY) this.vel.y = TERMINAL_VELOCITY;

        if (this.vel.x > 0) this.facing = 0;
        if (this.vel.x < 0) this.facing = 1;
    }

    landedOnTile(tile) {
        if (this.dead) return;

        let distanceFallen = this.pos.y - this.highestY;
        this.highestY = this.pos.y;

        if (this.isJumping) {
            this.isJumping = false;
        }

        if (distanceFallen > 4) {
            game.levelScreen.landedOnTile(tile, distanceFallen > SUPER_SLAM_FALL_DISTANCE);
            game.levelScreen.screenshakes.push(new ScreenShake(12, 0, 3));
            game.levelScreen.addTileShake(new ScreenShake(15, 0, 9), tile);

            //game.levelScreen.addEntity(new StarParticle(this.pos));
            for (let entity of game.levelScreen.entities) {
                if (entity.team && entity.team !== this.team && Math.abs(entity.pos.x - this.pos.x) < SLAM_ENEMY_DISTANCE && Math.abs(entity.pos.y - this.pos.y) < 4) {
                    entity.landedNearby(this);
                }
            }

            if (distanceFallen > SUPER_SLAM_FALL_DISTANCE) {
                Audio.play(Audio.playerSlam);
            }
        }
    }

    draw() {
        if (this.state !== DYING) {
            let qr = xy2qr(this.pos);
            let shakemap = game.levelScreen.tileshakemap[qr.r + 1]?.[qr.q];
            let y = shakemap && shakemap.y ? shakemap.y : 0;

            if (this.pos.y - this.highestY > SUPER_SLAM_FALL_DISTANCE) {
                Viewport.ctx.globalAlpha = 0.2;
                Sprite.drawViewportSprite(Sprite.bigpig[this.facing][this.frame], { x: this.last[1].x, y: this.pos.y + y - 4 });
            }
            if (this.pos.y - this.highestY > SUPER_SLAM_FALL_DISTANCE) {
                Viewport.ctx.globalAlpha = 0.4;
                Sprite.drawViewportSprite(Sprite.bigpig[this.facing][this.frame], { x: this.last[0].x, y: this.pos.y + y - 2 });
            }
            Viewport.ctx.globalAlpha = 1;
            Sprite.drawViewportSprite(Sprite.bigpig[this.facing][this.frame], { x: this.pos.x, y: this.pos.y + y });
        }
    }

    attack(victim) {
        victim.crushedBy(this);
    }

    dieFalling(levelBottomY) {
        if (this.state !== DYING) {
            this.state = DYING;
            this.dead = true;
            this.vel.x = 0;
            this.stateFrames = 0;
            game.levelScreen.addEntity(new ExplosionBParticle({ x: this.pos.x, y: levelBottomY - 2 }));
            Audio.play(Audio.playerDeath);
        }
    }

    dieHit(enemy) {
        if (this.state !== DYING) {
            this.state = DYING;
            this.dead = true;
            this.vel.x = 0;
            this.stateFrames = 0;
            game.levelScreen.addEntity(new ExplosionBParticle({ x: this.pos.x, y: this.pos.y }));
            Audio.play(Audio.playerDeath);
        }
    }
}
