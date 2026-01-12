import { PlayerState, GameState, DiceFace } from "../types/game";
import { GODS } from "../data/gods";

type ResolutionLog = string[];

interface ResolutionResult {
    newP1State: PlayerState;
    newP2State: PlayerState;
    logs: ResolutionLog;
}

export const resolveRound = (
    p1: PlayerState,
    p2: PlayerState
): ResolutionResult => {
    const logs: ResolutionLog = [];

    // Clone states to avoid direct mutation
    let p1State = structuredClone(p1);
    let p2State = structuredClone(p2);

    // Helper: Count Dice Faces
    const countFaces = (dice: DiceFace[], type: string) => dice.filter(d => d.type === type).length;

    // 1. GOD PRIORITY CHECK & FIZZLE PRE-CALCULATION
    // We need to determine if players have enough tokens AFTER keeping Gold Dice but BEFORE combat.
    // Actually, 'Steal' happens before God Power in some cases or after?
    // According to rules: 
    // 1. Gain Tokens from Gold Dice.
    // 2. Resolution (Axe/Helm, Arrow/Shield). Steal happens here too.
    // 3. God Powers activate based on Priority. 
    // Wait, if Priority is HIGH (low number), it might happen BEFORE Steal?
    // "Most favors happen before the Resolution Phase, unless the card says otherwise (like Thor's Strike)."
    // Correction: Orlog in Valhalla has specific priorities. 
    // We will use a simplified Priority queue.

    // 1. Token Gain (Gold Trim)
    const p1Gold = p1State.dice.filter(d => d.face.hasToken).length;
    const p2Gold = p2State.dice.filter(d => d.face.hasToken).length;

    p1State.tokens += p1Gold;
    p2State.tokens += p2Gold;
    logs.push(`P1 gained ${p1Gold} tokens, P2 gained ${p2Gold} tokens from dice.`);

    // 2. Define Actions Queue based on Priority
    // Actions: 'Steal' (Hand dice), 'GodPower', 'Damage' (Axe/Arrow)
    // We treat 'Steal' as a special phase within Resolution.
    // Generally: Pre-Resolution Gods -> Steal -> Combat -> Post-Resolution Gods.

    // Actually, Steal Dice resolve alongside combat but effect tokens immediately.

    // Let's implement the standard stack:
    // Step A: Pre-Resolution Gods (Priority < 10?) -> Actually using the `priority` field.
    // Step B: Physical Resolution (Combat + Steal)
    // Step C: Post-Resolution Gods (Thor's Strike)

    // Simulation of "Steal" Logic:
    const p1Steal = countFaces(p1State.dice.map(d => d.face), 'hand');
    const p2Steal = countFaces(p2State.dice.map(d => d.face), 'hand');

    // Apply Steal
    // Net steal calculation
    const p1Stolen = Math.min(p2State.tokens, p1Steal);
    p2State.tokens -= p1Stolen;
    p1State.tokens += p1Stolen;

    const p2Stolen = Math.min(p1State.tokens, p2Steal);
    p1State.tokens -= p2Stolen;
    p2State.tokens += p2Stolen;

    logs.push(`P1 stole ${p1Stolen} tokens. P2 stole ${p2Stolen} tokens.`);

    // 3. GOD POWER ACTIVATION (Check for Fizzle)
    const resolveGod = (user: PlayerState, opponent: PlayerState, isP1: boolean) => {
        if (!user.selectedGodFavor) return;

        const god = GODS[user.selectedGodFavor.godId];
        const level = god.levels[user.selectedGodFavor.level - 1];

        // FIZZLE CHECK
        if (user.tokens < level.cost) {
            logs.push(`${isP1 ? 'P1' : 'P2'}'s ${god.name} FIZZLED! (Not enough tokens)`);
            return;
        }

        // PAY COST
        user.tokens -= level.cost;
        logs.push(`${isP1 ? 'P1' : 'P2'} used ${god.name} (Level ${user.selectedGodFavor.level}).`);

        // APPLY EFFECT (Simplified for Thor/Idun)
        if (god.id === 'thors_strike') {
            opponent.health = Math.max(0, opponent.health - level.effectValue);
            logs.push(`${god.name} dealt ${level.effectValue} damage.`);
        } else if (god.id === 'iduns_rejuvenation') {
            user.health = Math.min(user.maxHealth, user.health + level.effectValue);
            logs.push(`${god.name} healed ${level.effectValue} HP.`);
        }
    };

    // Resolve Gods based on Priority
    // High Priority (Lower Number) goes first.
    const p1God = p1State.selectedGodFavor ? GODS[p1State.selectedGodFavor.godId] : null;
    const p2God = p2State.selectedGodFavor ? GODS[p2State.selectedGodFavor.godId] : null;

    // Simple sequential check
    // Note: This is simplified. Real logic needs strict timing windows.
    // For now, assume all gods resolve AFTER steal but before/after combat based on type.
    // To be robust, we need a 'timing' property in GodFavor (pre_resolution, post_resolution).

    // Executing Thor (Post-Resolution) later.

    // 4. COMBAT RESOLUTION
    const p1Axes = countFaces(p1State.dice.map(d => d.face), 'axe');
    const p1Arrows = countFaces(p1State.dice.map(d => d.face), 'arrow');
    const p1Helmets = countFaces(p1State.dice.map(d => d.face), 'helmet');
    const p1Shields = countFaces(p1State.dice.map(d => d.face), 'shield');

    const p2Axes = countFaces(p2State.dice.map(d => d.face), 'axe');
    const p2Arrows = countFaces(p2State.dice.map(d => d.face), 'arrow');
    const p2Helmets = countFaces(p2State.dice.map(d => d.face), 'helmet');
    const p2Shields = countFaces(p2State.dice.map(d => d.face), 'shield');

    // P1 Attack -> P2 Defend
    const p1AxeDmg = Math.max(0, p1Axes - p2Helmets);
    const p1ArrowDmg = Math.max(0, p1Arrows - p2Shields);
    const totalP1Dmg = p1AxeDmg + p1ArrowDmg;

    p2State.health = Math.max(0, p2State.health - totalP1Dmg);
    logs.push(`P1 dealt ${totalP1Dmg} physical damage.`);

    // P2 Attack -> P1 Defend
    const p2AxeDmg = Math.max(0, p2Axes - p1Helmets);
    const p2ArrowDmg = Math.max(0, p2Arrows - p1Shields);
    const totalP2Dmg = p2AxeDmg + p2ArrowDmg;

    p1State.health = Math.max(0, p1State.health - totalP2Dmg);
    logs.push(`P2 dealt ${totalP2Dmg} physical damage.`);

    // 5. POST-RESOLUTION GODS (Thor)
    // Check priority again to see who strikes first if both used Thor
    if (p1God && p2God) {
        if (p1God.priority >= p2God.priority) {
            resolveGod(p1State, p2State, true);
            resolveGod(p2State, p1State, false);
        } else {
            resolveGod(p2State, p1State, false);
            resolveGod(p1State, p2State, true);
        }
    } else if (p1God) {
        resolveGod(p1State, p2State, true);
    } else if (p2God) {
        resolveGod(p2State, p1State, false);
    }

    return { newP1State: p1State, newP2State: p2State, logs };
};
