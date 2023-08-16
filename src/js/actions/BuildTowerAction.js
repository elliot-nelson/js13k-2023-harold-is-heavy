import { game } from '../Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2 } from '../Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv,
    qr2xy
} from '../Util';
import { Sprite } from '../Sprite';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { TowerBuilding } from '../buildings/TowerBuilding';
import { Text } from '../Text';
import { Moth } from '../Moth';


/**
 * Monster
 */
export const BuildTowerAction = {
    defaultTapAction() {
        let building = World.buildingAt(World.selected);
        return !!building;
    },

    buttonSprite() {
        return Sprite.buttons[6];
    },

    buttonSelectedSprite() {
        return Sprite.buttons[7];
    },

    drawSelectedText(u, v) {
        let building = World.buildingAt(World.selected);
        let costs = [15, 0];
        let text = 'BUILD TOWER \n' + game.formatCost(...costs);

        if (building) {
            text = 'FINISH BUILDING';
        }

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let building = World.buildingAt(World.selected);
        let costs = [15, 0];

        if (building) {
            Moth.assign(moth => moth.construct(World.selected));
        } else if (game.canAfford(...costs)) {
            game.payCost(...costs);
            World.buildings.push(new TowerBuilding(World.selected));
            Moth.assign(moth => moth.construct(World.selected));
            return true;
        }
    }
};
