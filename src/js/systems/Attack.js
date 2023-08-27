
import { isBoundingBoxOverlap, entityBB, entityABB } from '../Util';

export const Attack = {
    perform(level, entities) {
        let relevantEntities = entities.filter(entity => !entity.noClipEntity);

        for (let attacker of relevantEntities) {
            if (attacker.abb) {
                for (let victim of relevantEntities) {
                    if (attacker.team === victim.team || victim.immune) continue;

                    if (victim.bb) {
                        if (isBoundingBoxOverlap(entityABB(attacker), entityBB(victim))) {
                            attacker.attack(victim);
                        }
                    }
                }
            }
        }
    }
}
