// LevelScreen

import { TILE_SIZE } from './Constants';
import { LevelData } from './generated/LevelData-gen';
import { Player } from './Player';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { Camera } from './Camera';
import { qr2xy, rgba, xy2uv, vectorBetween } from './Util';
import { Movement } from './systems/Movement';

export class LevelScreen {
    constructor(levelName) {
        this.levelName = levelName;
        this.levelData = LevelData[0];
        this.tiles = this.levelData.floors[0].tiles.map(row => [...row]);
        this.entities = [];

        this.player = new Player(qr2xy({ q: this.levelData.spawn[0], r: this.levelData.spawn[1] }));
        this.entities.push(this.player);

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
    }

    draw() {
        Viewport.ctx.fillStyle = rgba(36, 26, 200, 1);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        this.drawTiles();

        for (const entity of this.entities) {
            entity.draw();
        }
    }

    drawTiles() {
        const offset = xy2uv({ x: 0, y: 0 });
        const tiles = this.tiles;

        for (let r = 0; r < tiles.length; r++) {
            for (let q = 0; q < tiles[0].length; q++) {
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
}
