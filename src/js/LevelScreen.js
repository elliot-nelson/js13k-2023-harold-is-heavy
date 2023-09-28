// LevelScreen

import { Audio } from './Audio';
import { BigArrowParticle } from './BigArrowParticle';
import { Camera } from './Camera';
import { CloudParticle } from './CloudParticle';
import { TARGET_GAME_HEIGHT, TARGET_GAME_WIDTH, TILE_SIZE } from './Constants';
import { FallingDirtParticle } from './FallingDirtParticle';
import { game } from './Game';
import { Hedgehog } from './Hedgehog';
import { Knight } from './Knight';
import { LandingParticle } from './LandingParticle';
import { LittlePigBox } from './LittlePigBox';
import { Player } from './Player';
import { Replay } from './Replay';
import { Sign } from './Sign';
import { Sprite } from './Sprite';
import { StarParticle } from './StarParticle';
import { clamp, qr2xy, uv2xy, xy2qr, xy2uv } from './Util';
import { Viewport } from './Viewport';
import { LevelData } from './generated/LevelData-gen';
import { Attack } from './systems/Attack';
import { Movement } from './systems/Movement';

export class LevelScreen {
    constructor(levelNumber, replay) {
        game.levelScreen = this;

        this.levelNumber = levelNumber;
        this.levelData = LevelData[this.levelNumber];
        this.tiles = this.levelData.floors[0].tiles.map(row => [...row]);
        this.tileshakemap = this.levelData.floors[0].tiles.map(row => row.map(x => ({ x: 0, y: 0 })));
        this.entities = [];
        this.screenshakes = [];
        this.tileshakes = [];
        this.superslamTiles = [];
        this.t = 0;
        this.lastCloud = 0;
        this.lightUpSlamTiles = 0;

        this.player = new Player(qr2xy({ q: this.levelData.spawn[0], r: this.levelData.spawn[1] }));

        if (replay) {
            replay.reset();
            this.player.replay = replay;
        } else {
            this.replay = new Replay(levelNumber);
            this.player.recording = this.replay;
        }

        this.addEntity(this.player);
        this.addEntity(new StarParticle(this.player.pos));
        this.addEntity(new StarParticle(this.player.pos));
        this.addEntity(new StarParticle(this.player.pos));
        this.addEntity(new StarParticle(this.player.pos));
        this.addEntity(new CloudParticle(true));

        this.littlePigs = 0;
        this.littlePigsRescued = 0;

        this.enemiesAlive = 0;

        for (const obj of this.levelData.floors[0].objects) {
            if (obj.name === 'BOX') {
                this.addEntity(new LittlePigBox({ q: obj.x, r: obj.y }));
                this.littlePigs++;
            } else if (obj.name === 'KNIGHT') {
                this.addEntity(new Knight(qr2xy({ q: obj.x, r: obj.y })));
                this.enemiesAlive++;
            } else if (obj.name === 'HEDGEHOG') {
                this.addEntity(new Hedgehog(qr2xy({ q: obj.x, r: obj.y })));
                this.enemiesAlive++;
            } else if (obj.name.startsWith('SIGN')) {
                this.addEntity(new Sign({ q: obj.x, r: obj.y }, Number(obj.name.slice(4))));
            } else if (obj.name === 'SLAM') {
                this.superslamTiles.push(this.extractSuperslamTiles({ q: obj.x, r: obj.y }));
            }
        }

        Camera.pos = { ...this.player.pos };
    }

    update() {
        this.t++;

        if (this.t === 4) {
            Audio.play(Audio.levelStart);
        }

        let levelBottomY = qr2xy({ q: 0, r: this.tiles.length - 1 }).y;
        let cameraMaxY = levelBottomY - (TARGET_GAME_HEIGHT / 2);

        /*Camera.forceTarget = {
            x: this.player.pos.x,
            y: Math.min(this.player.pos.y, cameraMaxY)
        };*/
        //Camera.update();

        Camera.pos.x = (Camera.pos.x * 0.92 + this.player.pos.x * 0.08);
        Camera.pos.y = Math.min((Camera.pos.y * 0.92 + this.player.pos.y * 0.08), cameraMaxY);

        if (this.player.pos.y > levelBottomY) {
            this.player.dieFalling(levelBottomY);
        }

        let entities = [...this.entities];

        for (const entity of entities) {
            entity.update();
        }

        Movement.perform(this, entities);
        Attack.perform(this, entities);

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
            }
        }

        if (this.fallingDirtCounter > 0) {
            this.fallingDirtCounter--;
            this.spawnFallingDirt();
        }

        if (this.lightUpSlamTiles > 0) {
            this.lightUpSlamTiles--;
        }

        this.spawnClouds();
    }

    draw() {
        Viewport.ctx.fillStyle = '#457cd6';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let bottomSea = 4;
        let topSea = 14;
        let percentage = Math.floor(clamp(this.player.pos.y / (this.tiles.length * TILE_SIZE), 0, Infinity) * (topSea - bottomSea) + bottomSea);

        Viewport.ctx.fillStyle = '#4b3b9c';
        Viewport.ctx.fillRect(0, Viewport.height - percentage, Viewport.width, percentage);

        /*Viewport.ctx.fillStyle = '#8fcccb';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 2, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#449489';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 4, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#285763';
        Viewport.ctx.fillRect(0, Viewport.height - percentage - 6, Viewport.width, 1);*/

        // Render screenshakes (canvas translation)
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);

        for (let entity of this.entities) {
            if (entity.z === -1) entity.draw();
        }

        this.drawTileShakemap();
        this.drawTiles();

        let overlayEntities = [];

        for (let entity of this.entities) {
            if (entity.z > -1) entity.draw();

            if (entity.displayOverlay) {
                overlayEntities.push(entity);
            }
        }

        //Text.drawText(Viewport.ctx, `${this.littlePigsRescued}/${this.littlePigs}`, 180, 5, 1, Text.duotone, Text.black);
        //Text.drawText(Viewport.ctx, 'PRESS mnop\nTO DO', 10, 100, 1, Text.tan, Text.shadow);

        for (let entity of overlayEntities) {
            entity.drawOverlay();
        }

        let pigsToShow = clamp(Math.floor(this.t / 5) - 5, 0, this.littlePigs);
        for (let i = 0; i < pigsToShow; i++) {
            let frame = (this.littlePigsRescued > i) ? 0 : 3;
            Viewport.ctx.drawImage(Sprite.littlepig[0][frame].img, Viewport.width - i * 11 - 13, 3);
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
                // Bit of a hack here... if the tile is a [background tile], draw that background tile
                // before we lay down tile outlines. But ALSO, separately, draw the [background tile]
                // if the tile is going to shake and the tile ABOVE it is a [background tile]. This
                // prevents unseemly sky showing through the castle interiors.
                //
                // (The real fix for this of course is to have multiple LAYERS of tiles, with bg and
                // fg in separate layers, but nobody has space for that!)
                if (tiles[r][q] === 6 || (r > 0 && tileshakemap[r][q].y > 0 && tiles[r - 1][q] === 6)) {
                    Viewport.ctx.drawImage(Sprite.tiles[6].img,
                        q * TILE_SIZE + offset.u,
                        r * TILE_SIZE + offset.v);
                }
            }
        }

        // "Foreground" tile outlines
        for (let r = r1; r <= r2; r++) {
            for (let q = q1; q <= q2; q++) {
                if (tiles[r][q] > 0 && tiles[r][q] !== 6) {
                    let frame = 0;
                    for (let i = 0; i < this.superslamTiles.length; i++) {
                        if (r === this.superslamTiles[i].r && q >= this.superslamTiles[i].q1 && q <= this.superslamTiles[i].q2) {
                            if (this.lightUpSlamTiles > 0) {
                                frame++;
                            }
                            if (this.lightUpSlamTiles > 6) {
                                frame++;
                            }
                        }
                    }

                    Viewport.ctx.drawImage(Sprite.tilebg[frame].img,
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

    landedOnTile(tile, superslamFlag) {
        if (superslamFlag) {
            for (let i = 0; i < this.superslamTiles.length; i++) {
                let slam = this.superslamTiles[i];
                if (tile.r === slam.r && tile.q >= slam.q1 && tile.q <= slam.q2) {
                    for (let q = slam.q1; q <= slam.q2; q++) {
                        this.tiles[slam.r + 1][q] = this.tiles[slam.r][q];
                        this.tiles[slam.r][q] = this.tiles[slam.r + 1][q] === 5 ? 6 : 0;

                        let xy = this.player.pos;
                        this.addEntity(new BigArrowParticle({ x: xy.x, y: xy.y }));
                    }
                }
            }
        }

        for (let entity of this.entities) {
            if (entity.landedOnTile) entity.landedOnTile(tile);
        }

        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));
        this.addEntity(new LandingParticle(this.player.pos));

        this.lightUpSlamTiles = 12;

        this.fallingDirtCounter = 4;
    }

    spawnFallingDirt() {
        for (let i = 0; i < this.superslamTiles.length; i++) {
            let slam = this.superslamTiles[i];
            if (!this.tileIsPassable(slam.q1, slam.r)) {
                let x = (slam.q1 + Math.random() * (slam.q2 + 1 - slam.q1)) * TILE_SIZE;
                let y = slam.r * TILE_SIZE + TILE_SIZE + 1;
                this.addEntity(new FallingDirtParticle({ x: x, y: y }));
            }
        }
    }

    rescueLittlePig() {
        this.littlePigsRescued++;

        if (this.littlePigsRescued === this.littlePigs) {
            if (game.levelScreen.player.recording) {
                game.lastReplay = game.levelScreen.player.recording;
            }
            game.nextLevel++;
            game.screens.pop();
            game.scores[this.levelNumber].time = this.t;
            game.scores[this.levelNumber].enemiesAlive = this.enemiesAlive;
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

    extractSuperslamTiles(originQR) {
        let r = originQR.r;
        let q1 = originQR.q;
        let q2 = originQR.q;

        for (let q = originQR.q; q >= 0; q--) {
            if (this.tileIsPassable(q, originQR.r + 1) && !this.tileIsPassable(q, originQR.r)) {
                q1 = q;
            } else {
                break;
            }
        }
        for (let q = originQR.q + 1; q < this.tiles[0].length; q++) {
            if (this.tileIsPassable(q, originQR.r + 1) && !this.tileIsPassable(q, originQR.r)) {
                q2 = q;
            } else {
                break;
            }
        }

        return {
            r: r,
            q1: q1,
            q2: q2
        };
    }

    spawnClouds() {
        let clouds = this.entities.filter(entity => entity instanceof CloudParticle).length;
        if (clouds < 1) {
            this.addEntity(new CloudParticle());
            this.lastCloud = this.t;
        }

        if (this.t - this.lastCloud > 60 * 5 && Math.random() < 0.01) {
            this.addEntity(new CloudParticle());
            this.lastCloud = this.t;
        }
    }
}
