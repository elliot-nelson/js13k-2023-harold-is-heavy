
import { isBoundingBoxOverlap, entityBB, entityABB, entityHBB } from '../Util';

export const Attack = {
    perform(level, entities) {
        let relevantEntities = entities.filter(entity => entity.team);

        relevantEntities.sort((a, b) => a.team - b.team);

        for (let attacker of relevantEntities) {
            if (attacker.abb) {
                for (let victim of relevantEntities) {
                    if (attacker.team === victim.team || victim.immune || attacker.dead) continue;

                    if (victim.bb) {
                        if (isBoundingBoxOverlap(entityABB(attacker), entityHBB(victim))) {
                            attacker.attack(victim);
                        }
                    }
                }
            }
        }
    }
}
