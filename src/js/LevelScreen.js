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
import { ScreenShake } from './ScreenShake';

export class LevelScreen {
    constructor(levelNumber) {
        this.levelName = 'something';
        this.levelData = LevelData[levelNumber];
        this.tiles = this.levelData.floors[0].tiles.map(row => [...row]);
        this.tileshakemap = this.levelData.floors[0].tiles.map(row => row.map(x => ({ x: 0, y: 0 })));
        this.entities = [];
        this.screenshakes = [];
        this.tileshakes = [];

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
            }
        }

        Camera.pos = { ...this.player.pos };
    }

    update() {
        let levelBottomY = qr2xy({ q: 0, r: this.tiles.length - 1 }).y;
        let cameraMaxY = levelBottomY - (TARGET_GAME_HEIGHT / 2);
        Camera.forceTarget = {
            x: this.player.pos.x,
            y: Math.min(this.player.pos.y, cameraMaxY)
        };
        Camera.update();

        if (this.player.pos.y > levelBottomY) {
            this.player.dieFalling(levelBottomY);
        }

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

        // Tick screenshakes and cull finished screenshakes
        for (let i = 0; i < this.screenshakes.length; i++) {
            if (!this.screenshakes[i].update()) {
                this.screenshakes.splice(i, 1);
                i--;
            }
        }

        // Tick tileshakes and cull finished tileshakes
        for (let i = 0; i < this.tileshakes.length; i++) {
            if ((this.tileshakes[i].s++ > 15)) {
                this.tileshakes.splice(i, 1);
                i--;
                console.log('tile shake gone');
            }
        }
    }

    draw() {
        Viewport.ctx.fillStyle = '#457cd6';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let bottomSea = 5;
        let topSea = 40;
        let percentage = Math.floor(clamp(this.player.pos.y / (this.tiles.length * TILE_SIZE), 0, Infinity) * (topSea - bottomSea) + bottomSea);

        Viewport.ctx.fillStyle = '#4b3b9c';
        Viewport.ctx.fillRect(0, Viewport.height - percentage, Viewport.width, percentage);

        Viewport.ctx.fillStyle = '#8fcccb';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 2, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#449489';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 4, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#285763';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 6, Viewport.width, 1);


        // Render screenshakes (canvas translation)
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);

        this.drawTileShakemap();
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
        const tileshakemap = this.tileshakemap;

        // When we draw the tilesheet on the screen, we don't need to draw the ENTIRE tilesheet,
        // so let's clamp what we draw the portion on-screen (and up to one tile off-screen,
        // mostly for screenshake purposes).
        const topleft = xy2qr(uv2xy({ u: 0, v: 0 }));
        const bottomright = xy2qr(uv2xy({ u: TARGET_GAME_WIDTH, v: TARGET_GAME_HEIGHT }));
        const r1 = clamp(topleft.r - 1, 0, tiles.length - 1);
        const r2 = clamp(bottomright.r + 2, 0, tiles.length - 1);
        const q1 = clamp(topleft.q - 1, 0, tiles[0].length - 1);
        const q2 = clamp(bottomright.q + 2, 0, tiles[0].length - 1);

        // "Background" tiles
        for (let r = r1; r <= r2; r++) {
            for (let q = q1; q <= q2; q++) {
                if (tiles[r][q] === 6) {
                    Viewport.ctx.drawImage(Sprite.tiles[tiles[r][q]].img,
                        q * TILE_SIZE + offset.u + tileshakemap[r][q].x,
                        r * TILE_SIZE + offset.v + tileshakemap[r][q].y);
                }
            }
        }

        // "Foreground" tile outlines
        for (let r = r1; r <= r2; r++) {
            for (let q = q1; q <= q2; q++) {
                if (tiles[r][q] > 0 && tiles[r][q] !== 6) {
                    Viewport.ctx.drawImage(Sprite.tilebg[0].img,
                        q * TILE_SIZE + offset.u - 1 + tileshakemap[r][q].x,
                        r * TILE_SIZE + offset.v - 1 + tileshakemap[r][q].y);
                }
            }
        }

        // "Foreground" tiles
        for (let r = r1; r <= r2; r++) {
            for (let q = q1; q <= q2; q++) {
                if (tiles[r][q] > 0 && tiles[r][q] !== 6) {
                    Viewport.ctx.drawImage(Sprite.tiles[tiles[r][q]].img,
                        q * TILE_SIZE + offset.u + tileshakemap[r][q].x,
                        r * TILE_SIZE + offset.v + tileshakemap[r][q].y);
                }
            }
        }
    }

    drawTileShakemap() {
        for (let r = 0; r < this.tileshakemap.length; r++) {
            for (let q = 0; q < this.tileshakemap[0].length; q++) {
                this.tileshakemap[r][q].x = 0;
                this.tileshakemap[r][q].y = 0;
            }
        }

        for (let i = 0; i < this.tileshakes.length; i++) {
            let tileshake = this.tileshakes[i];
            for (let tile of tileshake.tiles) {
                //this.tileshakemap[tile.r][tile.q].x += tileshake.screenshake.x;
                let k = 0;
                if (tileshake.s < 9) k++;
                if (tileshake.s < 6) k++;
                if (tileshake.s < 4) k++;
                if (tileshake.s < 2) k++;
                this.tileshakemap[tile.r][tile.q].y += k;
            }
        }
    }

    tileIsPassable(q, r) {
        if (r < 0 || r >= this.tiles.length) return true;
        if (q < 0 || q >= this.tiles[0].length) return true;
        return this.tiles[r][q] < 1 || this.tiles[r][q] === 6;
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

    addScreenShake(screenshake) {
        // This screen shake applies to the entire rendered screen, including GUI
        this.screenshakes.push(screenshake);
    }

    addTileShake(screenshake, originQR) {
        console.log('add tile shake');

        let tiles = [];

        for (let q = originQR.q; q >= 0; q--) {
            if (this.tileIsPassable(q, originQR.r - 1) && !this.tileIsPassable(q, originQR.r)) {
                tiles.push({ q: q, r: originQR.r });
            } else {
                break;
            }
        }
        for (let q = originQR.q + 1; q < this.tiles[0].length; q++) {
            if (this.tileIsPassable(q, originQR.r - 1) && !this.tileIsPassable(q, originQR.r)) {
                tiles.push({ q: q, r: originQR.r });
            } else {
                break;
            }
        }

        this.tileshakes.push({
            screenshake: screenshake,
            tiles: tiles,
            s: 0
        });
    }
}
