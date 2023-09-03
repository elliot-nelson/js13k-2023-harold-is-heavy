// LevelScreen

import { TILE_SIZE, TARGET_GAME_WIDTH, TARGET_GAME_HEIGHT } from './Constants';
import { LevelData } from './generated/LevelData-gen';
import { Player } from './Player';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { qr2xy, rgba, xy2uv, vectorBetween, xy2qr, uv2xy, clamp } from './Util';
import { Movement } from './systems/Movement';
import { Attack } from './systems/Attack';
import { LittlePigBox } from './LittlePigBox';
import { LandingParticle } from './Particle';
import { Text } from './Text';
import { Knight } from './Knight';
import { Sign } from './Sign';
import { game } from './Game';

export class LevelScreen {
    constructor(levelNumber) {
        this.levelName = 'something';
        this.levelData = LevelData[levelNumber];
        this.tiles = this.levelData.floors[0].tiles.map(row => [...row]);
        this.entities = [];

        this.player = new Player(qr2xy({ q: this.levelData.spawn[0], r: this.levelData.spawn[1] }));
        this.addEntity(this.player);

        this.littlePigs = 0;
        this.littlePigsRescued = 0;

        this.enemies = 0;
        this.enemiesDefeated = 0;

        for (const obj of this.levelData.floors[0].objects) {
            if (obj.name === 'BOX') {
                this.addEntity(new LittlePigBox({ q: obj.x, r: obj.y }));
                this.littlePigs++;
            } else if (obj.name === 'KNIGHT') {
                this.addEntity(new Knight(qr2xy({ q: obj.x, r: obj.y })));
                this.enemies++;
            } else if (obj.name.startsWith('SIGN')) {
                this.addEntity(new Sign({ q: obj.x, r: obj.y }, Number(obj.name.slice(4))));
                console.log('after sign', this.entities);
            }
        }

        Camera.pos = { ...this.player.pos };
    }

    update() {
        //if (vectorBetween(Camera.pos, this.player.pos).m > 48) {
            Camera.forceTarget = this.player.pos;
        //}
        Camera.update();

        for (const entity of this.entities) {
            entity.update();
        }

        Movement.perform(this, this.entities);
        Attack.perform(this, this.entities);

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].cull) {
                this.entities.splice(i, 1);
                i--;
            }
        }
    }

    draw() {
        Viewport.ctx.fillStyle = '#457cd6';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        this.drawTiles();

        let overlayEntities = [];

        for (let entity of this.entities) {
            entity.draw();

            if (entity.displayOverlay) {
                overlayEntities.push(entity);
            }
        }

        Text.drawText(Viewport.ctx, `${this.littlePigsRescued}/${this.littlePigs}`, 180, 5, 1, Text.duotone, Text.black);

        Text.drawText(Viewport.ctx, 'PRESS mnop\nTO DO', 10, 100, 1, Text.tan, Text.shadow);

        for (let entity of overlayEntities) {
            entity.drawOverlay();
        }
    }

    drawTiles() {
        const offset = xy2uv({ x: 0, y: 0 });
        const tiles = this.tiles;

        // When we draw the tilesheet on the screen, we don't need to draw the ENTIRE tilesheet,
        // so let's clamp what we draw the portion on-screen (and up to one tile off-screen,
        // mostly for screenshake purposes).
        const topleft = xy2qr(uv2xy({ u: 0, v: 0 }));
        const bottomright = xy2qr(uv2xy({ u: TARGET_GAME_WIDTH, v: TARGET_GAME_HEIGHT }));
        const r1 = clamp(topleft.r - 1, 0, tiles.length - 1);
        const r2 = clamp(bottomright.r + 2, 0, tiles.length - 1);
        const q1 = clamp(topleft.q - 1, 0, tiles[0].length - 1);
        const q2 = clamp(bottomright.q + 2, 0, tiles[0].length - 1);

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                if (tiles[r][q] > 0) {
                    Viewport.ctx.drawImage(Sprite.tilebg[0].img, q * TILE_SIZE + offset.u - 1, r * TILE_SIZE + offset.v - 1);
                }
            }
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                if (tiles[r][q] > 0) {
                    Viewport.ctx.drawImage(Sprite.tiles[tiles[r][q]].img, q * TILE_SIZE + offset.u, r * TILE_SIZE + offset.v);
                }
            }
        }
    }

    tileIsPassable(q, r) {
        if (r < 0 || r >= this.tiles.length) return true;
        if (q < 0 || q >= this.tiles[0].length) return true;
        return this.tiles[r][q] < 1;
    }

    entityIsOnSolidGround(entity) {
        let qr = xy2qr({ x: entity.pos.x, y: entity.pos.y + entity.bb[1].y });

        return !this.tileIsPassable(qr.q, qr.r);
    }

    landedOnTile(tile) {
        for (let entity of this.entities) {
            if (entity.landedOnTile) entity.landedOnTile(tile);
        }

        this.addEntity(new LandingParticle(this.pos));
        this.addEntity(new LandingParticle(this.pos));
        this.addEntity(new LandingParticle(this.pos));
        this.addEntity(new LandingParticle(this.pos));
        this.addEntity(new LandingParticle(this.pos));
        this.addEntity(new LandingParticle(this.pos));
    }

    rescueLittlePig() {
        this.littlePigsRescued++;

        if (this.littlePigsRescued === this.littlePigs) {
            game.nextLevel++;
            game.screens.pop();
        }
    }

    addEntity(entity) {
        if (!entity.z) {
            entity.z = 1;
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].z > entity.z) {
                this.entities.splice(i, 0, entity);
                return;
            }
        }

        this.entities.push(entity);
    }
}
