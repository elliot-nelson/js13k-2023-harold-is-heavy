
import { isBoundingBoxOverlap } from '../Util';

export const Attack = {
    perform(level, entities) {
        let relevantEntities = entities.filter(entity => !entity.noClipEntity);

        for (let attacker of relevantEntities) {
            if (attacker.abb) {
                for (let victim of relevantEntities) {
                    if (victim.bb) {
                        if (isBoundingBoxOverlap(attacker.abb, victim.bb)) {
                            attacker.attack(victim);
                        }
                    }
                }
            }
        }
    }
}
