// Movement

import { TILE_SIZE, JUMP_CHEAT_Y_PIXELS } from '../Constants';
import { game } from '../Game';
import {
    qr2xy,
    xy2qr,
    intersectCircleCircle,
    intersectCircleRectangle,
    normalizeVector,
    tilesHitInBounds,
    centerxy,
    uv2xy,
    vectorBetween
} from '../Util';
import { Sign } from '../Sign';

export const Movement = {
    perform(level, entities) {
        // Movement only applies to active entities with positions and velocities
        let movers = entities.filter(
            entity => entity.pos && entity.vel && !entity.cull
        );

        // Very basic "rounds" of collision resolution, since we have no real physics.
        // (As usual, "detecting" a collision is not the hard part... we need to resolve
        // them too!)
        for (let rounds = 0; rounds < 5; rounds++) {
            for (let entity of movers) {
                Movement.clipVelocityAgainstTiles2(level, entity);
            }
        }

        // Now we perform all movement, even if it's not going to be perfect.
        for (let entity of movers) {
            entity.pos.x += entity.vel.x;
            entity.pos.y += entity.vel.y;
        }
    },

    clipVelocityAgainstTiles2(level, entity) {
        if (!entity.newClip) return;

        let xArray = [
            entity.pos.x + entity.bb[0].x,
            entity.pos.x + entity.bb[1].x
        ];

        let yArray = [
            entity.pos.y + entity.bb[0].y,
            entity.pos.y + entity.bb[1].y
        ];

        if (entity.vel.x <= 0) {
            xArray[0] += entity.vel.x;
        } else {
            xArray[1] += entity.vel.x;
        }

        if (entity.vel.y <= 0) {
            yArray[0] += entity.vel.y;
        } else {
            yArray[1] += entity.vel.y;
        }

        let bounds = [
            { x: xArray[0], y: yArray[0] },
            { x: xArray[1], y: yArray[1] }
        ];

        for (let tile of tilesHitInBounds(bounds)) {
            if (!level.tileIsPassable(tile.q, tile.r)) {
                let tileXY = qr2xy(tile);

                // This algorithm is kind of a practical approach to the question of
                // how to interact with tiles hit while moving. Instead of computing the
                // the normal of our velocity into the sides of a tile hit, we compute
                // what we WOULD do if we chose to bounce off the X side or Y side of
                // a tile, and then we pick whichever one will move the player the least.
                //
                // This generally gives behavior that feels "expected" - jumping into the side
                // of a block results in stopping and sliding down, while jumping into the
                // bottom of a block results in hitting your head.

                let suggested = [];

                if (tileXY.y + JUMP_CHEAT_Y_PIXELS >= entity.pos.y + entity.bb[1].y) {
                    let lowestAllowedY = tileXY.y - entity.bb[1].y;
                    suggested.push({
                        pos: { x: entity.pos.x, y: lowestAllowedY },
                        vel: { x: entity.vel.x, y: 0 },
                        tile: tile
                    });
                }
                if (tileXY.x >= entity.pos.x + entity.bb[1].x) {
                    let rightmostAllowedX = tileXY.x - entity.bb[1].x;
                    suggested.push({
                        pos: { x: rightmostAllowedX, y: entity.pos.y },
                        vel: { x: 0, y: entity.vel.y }
                    });
                }
                if (tileXY.x <= entity.pos.x - entity.bb[1].x) {
                    let leftmostAllowedX = tileXY.x + TILE_SIZE - entity.bb[0].x;
                    suggested.push({
                        pos: { x: leftmostAllowedX, y: entity.pos.y },
                        vel: { x: 0, y: entity.vel.y }
                    });
                }
                if (tileXY.y < entity.pos.y) {
                    let highestAllowedY = tileXY.y + TILE_SIZE - entity.bb[0].y;
                    suggested.push({
                        pos: { x: entity.pos.x, y: highestAllowedY },
                        vel: { x: entity.vel.x, y: 0 }
                    });
                }

                let chosen = suggested[0];
                let pixelDistance = vectorBetween(entity.pos, chosen.pos).m;
                for (let i = 1; i < suggested.length; i++) {
                    let newPixelDistance = vectorBetween(entity.pos, suggested[i].pos).m;
                    if (newPixelDistance < pixelDistance) {
                        pixelDistance = newPixelDistance;
                        chosen = suggested[i];
                    }
                }

                entity.pos = chosen.pos;
                entity.vel = chosen.vel;
                if (chosen.tile && entity.landedOnTile) entity.landedOnTile(tile);
            }
        }
    }
};
