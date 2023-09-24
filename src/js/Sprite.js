'use strict';

import { game } from './Game';
import { rgba, createCanvas } from './Util';
import { SpriteSheet } from './generated/SpriteSheet-gen';
import { Viewport } from './Viewport';
import { Camera } from './Camera';
import { TILE_SIZE } from './Constants';

/**
 * Sprite
 *
 * Encapsulates loading sprite slices from the spritesheet, organizing them, and
 * modifying them or constructing using primitives. To save space, we use some techniques
 * like storing only a small slice of an image in the spritesheet, then using code
 * to duplicate it, add some randomness, etc.
 */
export const Sprite = {
    // This is an exception to the rule, loading the spritesheet is a special action that
    // happens BEFORE everything is initialized.
    loadSpritesheet(cb) {
        let image = new Image();
        image.onload = cb;
        image.src = SpriteSheet.base64;
        Sprite.sheet = image;
    },

    init() {
        Sprite.bigpig = [SpriteSheet.bigpig.map(initBasicSprite, { x: 7, y: 4 })];
        Sprite.bigpig.push(Sprite.bigpig[0].map(sprite => initDynamicSprite(flipHorizontal(sprite.img), sprite.anchor)));

        Sprite.littlepig = [SpriteSheet.littlepig.map(initBasicSprite)];
        Sprite.littlepig.push(Sprite.littlepig[0].map(sprite => initDynamicSprite(flipHorizontal(sprite.img), sprite.anchor)));

        Sprite.littlepigbox = SpriteSheet.littlepigbox.map(initBasicSprite, { x: 7, y: 5 });

        Sprite.explosiona = SpriteSheet.explosiona.map(initBasicSprite);
        Sprite.explosionb = SpriteSheet.explosionb.map(initBasicSprite);

        Sprite.particle = SpriteSheet.particle.map(initBasicSprite);

        Sprite.star2 = SpriteSheet.star2.map(initBasicSprite);

        Sprite.bleed = SpriteSheet.bleed.map(initBasicSprite, { x: 4, y: 0 });

        Sprite.knight = [SpriteSheet.knight.map(initBasicSprite, { x: 3, y: 6 })];
        Sprite.knight.push(Sprite.knight[0].map(sprite => initDynamicSprite(flipHorizontal(sprite.img), sprite.anchor)));
        Sprite.hedgehog = [SpriteSheet.hedgehog.map(initBasicSprite, { x: 5, y: 4 })];
        Sprite.hedgehog .push(Sprite.hedgehog[0].map(sprite => initDynamicSprite(flipHorizontal(sprite.img), sprite.anchor)));

        Sprite.bigarrow = SpriteSheet.bigarrow.map(initBasicSprite);
        Sprite.dirt = SpriteSheet.dirt.map(initBasicSprite);

        Sprite.sign = SpriteSheet.sign.map(initBasicSprite);

        // Base pixel font and icons (see `Text.init` for additional variations)
        Sprite.font = initBasicSprite(SpriteSheet.font4[0]);
        //Sprite.icon_mouse_lmb = initBasicSprite(SpriteSheet.icon_mouse[0]);
        //Sprite.icon_mouse_rmb = initBasicSprite(SpriteSheet.icon_mouse[1]);

        Sprite.clouds = SpriteSheet.clouds.map(initBasicSprite);

        // Enemies

        // Tiles
        Sprite.tiles = SpriteSheet.tiles.map(initBasicSprite);
        Sprite.tilebg = SpriteSheet.tilebg.map(initBasicSprite);
    },

    /**
     * A small helper that draws a sprite onto a canvas, respecting the anchor point of
     * the sprite. Note that the canvas should be PRE-TRANSLATED and PRE-ROTATED, if
     * that's appropriate!
     */
    drawSprite(ctx, sprite, u, v) {
        ctx.drawImage(sprite.img, u - sprite.anchor.x, v - sprite.anchor.y);
    },

    drawViewportSprite(sprite, pos, rotation) {
        let { u, v } = this.viewportSprite2uv(
            sprite,
            pos
        );
        if (rotation) {
            Viewport.ctx.save();
            Viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
            Viewport.ctx.rotate(rotation);
            Viewport.ctx.drawImage(
                sprite.img,
                -sprite.anchor.x,
                -sprite.anchor.y
            );
            Viewport.ctx.restore();
        } else {
            Viewport.ctx.drawImage(sprite.img, u, v);
        }
    },

    drawSmashedSprite(sprite, pos, height) {
        let { u, v } = this.viewportSprite2uv(
            sprite,
            pos
        );

        Viewport.ctx.drawImage(sprite.img, u - 1, v - height + sprite.img.height, sprite.img.width + 2, height);
    },

    viewportSprite2uv(sprite, pos) {
        return {
            u: pos.x - sprite.anchor.x - Camera.pos.x + Viewport.center.u,
            v: pos.y - sprite.anchor.y - Camera.pos.y + Viewport.center.v
        };
    }
};

// Sprite utility functions

function initBasicSprite(data, opts) {
    return initDynamicSprite(loadCacheSlice(...data), opts);
}

function initDynamicSprite(source, opts) {
    let w = source.width,
        h = source.height;

    if (typeof opts !== 'object') {
        opts = {};
    }

    if (!opts.anchor) {
        opts.anchor = { x: (w / 2) | 0, y: (h / 2) | 0 };
    }

    if (!opts.bb) {
        opts.bb = [-opts.anchor.x, -opts.anchor.y, source.width, source.height];
    }

    return {
        img: source,
        ...opts
    };
}

function loadCacheSlice(x, y, w, h) {
    const source = Sprite.sheet;
    const sliceCanvas = createCanvas(w, h);
    sliceCanvas.ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    return sliceCanvas.canvas;
}

function createDynamicTile(tiles, bitmask) {
    let canvas = createCanvas(TILE_SIZE, TILE_SIZE);

    // First, we render outer corners

    if (bitmask & 0b100_000_000) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_OUTER - 1].img, 0, 0, 4, 4, 0, 0, 4, 4);
    }
    if (bitmask & 0b001_000_000) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_OUTER - 1].img, 5, 0, 3, 3, 5, 0, 3, 3);
    }
    if (bitmask & 0b000_000_001) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_OUTER - 1].img, 6, 6, 2, 2, 6, 6, 2, 2);
    }
    if (bitmask & 0b000_000_100) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_OUTER - 1].img, 0, 5, 3, 3, 0, 5, 3, 3);
    }

    // Next we render standard walls (potentially overwriting outer corners above)

    if (bitmask & 0b000_001_000) {
        canvas.ctx.drawImage(tiles[TILE_WALL_LEFT - 1].img, 5, 0, 3, 8, 5, 0, 3, 8);
    }
    if (bitmask & 0b000_100_000) {
        canvas.ctx.drawImage(tiles[TILE_WALL_RIGHT - 1].img, 0, 0, 4, 8, 0, 0, 4, 8);
    }
    if (bitmask & 0b000_000_010) {
        canvas.ctx.drawImage(tiles[TILE_WALL_TOP - 1].img, 0, 5, 8, 3, 0, 5, 8, 3);
    }
    if (bitmask & 0b010_000_000) {
        canvas.ctx.drawImage(tiles[TILE_WALL_BOTTOM - 1].img, 0, 0, 8, 4, 0, 0, 8, 4);
    }

    // Next we render inner corners (potentially overwriting parts of walls above)

    if ((bitmask & 0b010_100_000) === 0b010_100_000) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_INNER - 1].img, 0, 0, 5, 5, 0, 0, 5, 5);
    }
    if ((bitmask & 0b010_001_000) === 0b010_001_000) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_INNER - 1].img, 4, 0, 4, 4, 4, 0, 4, 4);
    }
    if ((bitmask & 0b000_001_010) === 0b000_001_010) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_INNER - 1].img, 4, 4, 4, 4, 4, 4, 4, 4);
    }
    if ((bitmask & 0b000_100_010) === 0b000_100_010) {
        canvas.ctx.drawImage(tiles[TILE_CORNER_INNER - 1].img, 0, 4, 5, 4, 0, 4, 5, 4);
    }

    return canvas.canvas;
}

function flipHorizontal(source) {
    let canvas = createCanvas(source.width, source.height);
    canvas.ctx.translate(source.width, 0);
    canvas.ctx.scale(-1, 1);
    canvas.ctx.drawImage(source, 0, 0);
    return canvas.canvas;
}
