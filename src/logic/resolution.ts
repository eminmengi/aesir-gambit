import type { PlayerState, DiceFace, LogEntry, GodFavorId, GodFavorLevel } from "../types/game";
import { GODS } from "../data/gods";

interface ResolutionResult {
    newP1State: PlayerState;
    newP2State: PlayerState;
    logs: LogEntry[];
}

export const resolveRound = (
    p1: PlayerState,
    p2: PlayerState
): ResolutionResult => {
    const logs: LogEntry[] = [];

    // Clone states
    let p1State = structuredClone(p1);
    let p2State = structuredClone(p2);

    // Helpers
    const rollDie = (): DiceFace => {
        const types = ['axe', 'arrow', 'helmet', 'shield', 'hand'] as const;
        return { type: types[Math.floor(Math.random() * types.length)], value: 1, hasToken: Math.random() < 0.35 };
    };

    // 1. TOKEN GAIN (Base)
    const p1Gold = p1State.dice.filter(d => d.face.hasToken).length;
    const p2Gold = p2State.dice.filter(d => d.face.hasToken).length;

    p1State.tokens += p1Gold;
    p2State.tokens += p2Gold;

    if (p1Gold > 0 || p2Gold > 0) {
        logs.push({ key: 'logs.token_gain', params: { p1: p1Gold, p2: p2Gold } });
    }

    // 2. GOD ACTIVATION & INTERFERENCE (Priority Sorted)
    interface ActiveGod {
        player: 'p1' | 'p2';
        id: GodFavorId;
        levelIdx: number; // 0-2
        data: GodFavorLevel;
    }

    let activeGods: ActiveGod[] = [];

    // Queue contenders
    if (p1State.selectedGodFavor) {
        const god = GODS[p1State.selectedGodFavor.godId];
        activeGods.push({ player: 'p1', id: god.id, levelIdx: p1State.selectedGodFavor.level - 1, data: god.levels[p1State.selectedGodFavor.level - 1] });
    }
    if (p2State.selectedGodFavor) {
        const god = GODS[p2State.selectedGodFavor.godId];
        activeGods.push({ player: 'p2', id: god.id, levelIdx: p2State.selectedGodFavor.level - 1, data: god.levels[p2State.selectedGodFavor.level - 1] });
    }

    // Sort by priority (Low number = High priority, goes first)
    activeGods.sort((a, b) => GODS[a.id].priority - GODS[b.id].priority);

    // Helper map to track successful activations for later phases
    const successfulGods: { p1?: ActiveGod, p2?: ActiveGod } = {};
    const tokensSpent = { p1: 0, p2: 0 };

    // Process Activations
    for (const ag of activeGods) {
        const user = ag.player === 'p1' ? p1State : p2State;
        const opponent = ag.player === 'p1' ? p2State : p1State;
        const opponentGod = ag.player === 'p1' ? successfulGods.p2 : successfulGods.p1;

        // Apply Thrymr debuff if opponent used it and has BETTER priority (already activated)
        let effectiveLevelIdx = ag.levelIdx;
        if (opponentGod && opponentGod.id === 'thrymrs_theft') {
            const reduction = opponentGod.data.effectValue; // 1, 2, or 3 (Disable)
            effectiveLevelIdx -= reduction;
            logs.push({ key: 'logs.god_interrupted', params: { player: ag.player === 'p1' ? 'P1' : 'P2', source: 'Thrymr' } });
        }

        if (effectiveLevelIdx < 0) {
            logs.push({ key: 'logs.fizzle', params: { player: ag.player === 'p1' ? 'P1' : 'P2', god: GODS[ag.id].name } });
            continue;
        }

        const effectiveData = GODS[ag.id].levels[effectiveLevelIdx];

        // Cost Check
        if (user.tokens < effectiveData.cost) {
            logs.push({ key: 'logs.fizzle', params: { player: ag.player === 'p1' ? 'P1' : 'P2', god: GODS[ag.id].name } });
            continue;
        }

        // Pay Cost
        user.tokens -= effectiveData.cost;
        if (ag.player === 'p1') tokensSpent.p1 += effectiveData.cost;
        else tokensSpent.p2 += effectiveData.cost;

        // Mark Success
        if (ag.player === 'p1') successfulGods.p1 = { ...ag, levelIdx: effectiveLevelIdx, data: effectiveData };
        else successfulGods.p2 = { ...ag, levelIdx: effectiveLevelIdx, data: effectiveData };

        logs.push({ key: 'logs.god_used', params: { player: ag.player === 'p1' ? 'P1' : 'P2', god: GODS[ag.id].name, level: effectiveLevelIdx + 1 } });

        // IMMEDIATE EFFECTS (Interference / Dice Manipulation)
        if (ag.id === 'friggs_sight') {
            // Reroll X dice
            const count = effectiveData.effectValue === 4 ? 6 : effectiveData.effectValue; // 4 means all/any
            // Reroll opponent dice randomly
            for (let i = 0; i < count; i++) {
                if (i < opponent.dice.length) opponent.dice[i].face = rollDie();
            }
        }
        else if (ag.id === 'lokis_trick') {
            // Ban X dice (Remove them from calculation)
            // We'll mark them as banned in a temporary set? 
            // Better: Filter them out locally for counts.
            // Actually, we need to store "bannedCount" in state for next phases.
        }
        else if (ag.id === 'freyjas_plenty') {
            // Add extra dice
            const extraCount = effectiveData.effectValue;
            for (let i = 0; i < extraCount; i++) {
                user.dice.push({ id: `extra-${i}`, face: rollDie(), locked: true });
            }
        }
    }

    // 3. DICE COUNTING (Buffs Phase)
    const getCounts = (state: PlayerState, activeGod?: ActiveGod, opponentGod?: ActiveGod) => {
        let dice = state.dice.map(d => d.face);

        // Loki's Trick (Removal)
        if (opponentGod && opponentGod.id === 'lokis_trick') {
            const banCount = opponentGod.data.effectValue;
            dice = dice.slice(0, Math.max(0, dice.length - banCount));
        }

        let axes = dice.filter(d => d.type === 'axe').length;
        let arrows = dice.filter(d => d.type === 'arrow').length;
        let helmets = dice.filter(d => d.type === 'helmet').length;
        let shields = dice.filter(d => d.type === 'shield').length;
        let hands = dice.filter(d => d.type === 'hand').length;

        // Apply Self Buffs
        if (activeGod) {
            if (activeGod.id === 'skadis_hunt') {
                // Add X Arrows per Arrow
                arrows += arrows * activeGod.data.effectValue;
            }
            else if (activeGod.id === 'baldrs_invulnerability') {
                // Add X Helmet/Shield per matching die? 
                // Reference: "Add X per die" usually means per Helmet/Shield die? 
                // Let's assume per Helmet/Shield die.
                const defensiveDice = helmets + shields;
                const bonus = defensiveDice * activeGod.data.effectValue;
                helmets += bonus; // Put it all in helmets for simplicity or split?
            }
            else if (activeGod.id === 'freyrs_plenty') { // Freyr's Gift
                // Add X to majority face
                const counts = { axe: axes, arrow: arrows, helmet: helmets, shield: shields, hand: hands };
                const majorityType = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                const bonus = activeGod.data.effectValue;
                if (majorityType === 'axe') axes += bonus;
                if (majorityType === 'arrow') arrows += bonus;
                if (majorityType === 'helmet') helmets += bonus;
                if (majorityType === 'shield') shields += bonus;
                if (majorityType === 'hand') hands += bonus;
            }
            else if (activeGod.id === 'brunhilds_fury') {
                // Multiply Axes
                axes = Math.ceil(axes * activeGod.data.effectValue);
            }
        }

        return { axes, arrows, helmets, shields, hands };
    };

    let p1Counts = getCounts(p1State, successfulGods.p1, successfulGods.p2);
    let p2Counts = getCounts(p2State, successfulGods.p2, successfulGods.p1);

    // Vidar's Might (Remove Opponent Helmets)
    if (successfulGods.p1 && successfulGods.p1.id === 'vidars_might') p2Counts.helmets = Math.max(0, p2Counts.helmets - successfulGods.p1.data.effectValue);
    if (successfulGods.p2 && successfulGods.p2.id === 'vidars_might') p1Counts.helmets = Math.max(0, p1Counts.helmets - successfulGods.p2.data.effectValue);


    // 4. STEAL PHASE
    const resolveSteal = (stealer: PlayerState, victim: PlayerState, amount: number) => {
        let stealAmount = amount;

        // Skuld's Claim (Destroy tokens instead of steal? No, "Destroy tokens per Arrow die" is different)
        // Reference: Skuld destroys tokens based on Arrow dice. Not theft.

        const stolen = Math.min(victim.tokens, stealAmount);
        victim.tokens -= stolen;
        stealer.tokens += stolen;
        return stolen;
    }

    const p1Stolen = resolveSteal(p1State, p2State, p1Counts.hands);
    const p2Stolen = resolveSteal(p2State, p1State, p2Counts.hands);

    // Skuld (Destroy Tokens)
    if (successfulGods.p1 && successfulGods.p1.id === 'skulds_claim') {
        const destroy = p1Counts.arrows * successfulGods.p1.data.effectValue;
        p2State.tokens = Math.max(0, p2State.tokens - destroy);
    }
    if (successfulGods.p2 && successfulGods.p2.id === 'skulds_claim') {
        const destroy = p2Counts.arrows * successfulGods.p2.data.effectValue;
        p1State.tokens = Math.max(0, p1State.tokens - destroy);
    }

    // Tyr's Pledge (Sacrifice HP to destroy Tokens)
    if (successfulGods.p1 && successfulGods.p1.id === 'tyrs_pledge') {
        if (p1State.health > 1) {
            p1State.health -= 1;
            p2State.tokens = Math.max(0, p2State.tokens - successfulGods.p1.data.effectValue);
        }
    }
    if (successfulGods.p2 && successfulGods.p2.id === 'tyrs_pledge') {
        if (p2State.health > 1) {
            p2State.health -= 1;
            p1State.tokens = Math.max(0, p1State.tokens - successfulGods.p2.data.effectValue);
        }
    }

    if (p1Stolen > 0 || p2Stolen > 0) logs.push({ key: 'logs.steal', params: { p1: p1Stolen, p2: p2Stolen } });

    // 5. COMBAT RESOLUTION
    let p1PhysicalDmg = 0;
    let p2PhysicalDmg = 0;

    // Ullr (Piercing)
    const p1Pierce = (successfulGods.p1?.id === 'ullrs_aim') ? successfulGods.p1.data.effectValue : 0;
    const p2Pierce = (successfulGods.p2?.id === 'ullrs_aim') ? successfulGods.p2.data.effectValue : 0;

    // P1 Attack
    const p1BlockedAxe = Math.min(p1Counts.axes, p2Counts.helmets);
    const p1AxeDmg = p1Counts.axes - p1BlockedAxe;

    // Arrows: First X pierce, rest checked against shields
    const p1PiercingArrows = Math.min(p1Counts.arrows, p1Pierce);
    const p1NormalArrows = p1Counts.arrows - p1PiercingArrows;
    const p1BlockedArrow = Math.min(p1NormalArrows, p2Counts.shields);
    const p1ArrowDmg = p1PiercingArrows + (p1NormalArrows - p1BlockedArrow);

    p1PhysicalDmg = p1AxeDmg + p1ArrowDmg;

    // P2 Attack
    const p2BlockedAxe = Math.min(p2Counts.axes, p1Counts.helmets);
    const p2AxeDmg = p2Counts.axes - p2BlockedAxe;

    const p2PiercingArrows = Math.min(p2Counts.arrows, p2Pierce);
    const p2NormalArrows = p2Counts.arrows - p2PiercingArrows;
    const p2BlockedArrow = Math.min(p2NormalArrows, p1Counts.shields);
    const p2ArrowDmg = p2PiercingArrows + (p2NormalArrows - p2BlockedArrow);

    p2PhysicalDmg = p2AxeDmg + p2ArrowDmg;

    // Apply Damage
    p2State.health = Math.max(0, p2State.health - p1PhysicalDmg);
    p1State.health = Math.max(0, p1State.health - p2PhysicalDmg);

    if (p1PhysicalDmg > 0) logs.push({ key: 'logs.physical_damage', params: { player: 'P1', amount: p1PhysicalDmg } });
    if (p2PhysicalDmg > 0) logs.push({ key: 'logs.physical_damage', params: { player: 'P2', amount: p2PhysicalDmg } });

    // 6. REACTIVE & POST-RESOLUTION

    // Mimir (Token per damage taken)
    if (successfulGods.p1?.id === 'mimirs_wisdom') {
        const dmgTaken = p2PhysicalDmg;
        if (dmgTaken > 0) p1State.tokens += dmgTaken * successfulGods.p1.data.effectValue;
    }
    if (successfulGods.p2?.id === 'mimirs_wisdom') {
        const dmgTaken = p1PhysicalDmg;
        if (dmgTaken > 0) p2State.tokens += dmgTaken * successfulGods.p2.data.effectValue;
    }

    // Heimdall (Heal per block)
    if (successfulGods.p1?.id === 'heimdalls_watch') {
        // P1 blocked P2
        const blocks = p2BlockedAxe + p2BlockedArrow;
        if (blocks > 0) p1State.health = Math.min(p1State.maxHealth, p1State.health + (blocks * successfulGods.p1.data.effectValue));
    }
    if (successfulGods.p2?.id === 'heimdalls_watch') {
        const blocks = p1BlockedAxe + p1BlockedArrow;
        if (blocks > 0) p2State.health = Math.min(p2State.maxHealth, p2State.health + (blocks * successfulGods.p2.data.effectValue));
    }

    // Hel (Heal per Axe Damage Dealt)
    if (successfulGods.p1?.id === 'hels_grip') {
        p1State.health = Math.min(p1State.maxHealth, p1State.health + (p1AxeDmg * successfulGods.p1.data.effectValue));
    }
    if (successfulGods.p2?.id === 'hels_grip') {
        p2State.health = Math.min(p2State.maxHealth, p2State.health + (p2AxeDmg * successfulGods.p2.data.effectValue));
    }

    // Bragi (Token per Hand)
    if (successfulGods.p1?.id === 'bragis_verve') p1State.tokens += p1Counts.hands * successfulGods.p1.data.effectValue;
    if (successfulGods.p2?.id === 'bragis_verve') p2State.tokens += p2Counts.hands * successfulGods.p2.data.effectValue;

    // Var (Heal per opponent spend) - Fixed: Heal 1 per 5 tokens spent
    if (successfulGods.p1?.id === 'vars_bond') {
        const heal = Math.floor(tokensSpent.p2 / 5) * successfulGods.p1.data.effectValue;
        p1State.health = Math.min(p1State.maxHealth, p1State.health + heal);
    }
    if (successfulGods.p2?.id === 'vars_bond') {
        const heal = Math.floor(tokensSpent.p1 / 5) * successfulGods.p2.data.effectValue;
        p2State.health = Math.min(p2State.maxHealth, p2State.health + heal);
    }

    // Thor (Post-Res Damage)
    if (successfulGods.p1?.id === 'thors_strike') {
        const dmg = successfulGods.p1.data.effectValue;
        p2State.health = Math.max(0, p2State.health - dmg);
        logs.push({ key: 'logs.damage_dealt', params: { source: 'Thor', amount: dmg } });
    }
    if (successfulGods.p2?.id === 'thors_strike') {
        const dmg = successfulGods.p2.data.effectValue;
        p1State.health = Math.max(0, p1State.health - dmg);
        logs.push({ key: 'logs.damage_dealt', params: { source: 'Thor', amount: dmg } });
    }

    // Idun (Post-Res Heal)
    if (successfulGods.p1?.id === 'iduns_rejuvenation') {
        const heal = successfulGods.p1.data.effectValue;
        p1State.health = Math.min(p1State.maxHealth, p1State.health + heal);
        logs.push({ key: 'logs.healed', params: { source: 'Idun', amount: heal } });
    }
    if (successfulGods.p2?.id === 'iduns_rejuvenation') {
        const heal = successfulGods.p2.data.effectValue;
        p2State.health = Math.min(p2State.maxHealth, p2State.health + heal);
        logs.push({ key: 'logs.healed', params: { source: 'Idun', amount: heal } });
    }

    // Odin (Sacrifice Health for Tokens)
    if (successfulGods.p1?.id === 'odins_sacrifice') {
        if (p1State.health > 3) {
            const sac = 3;
            p1State.health -= sac;
            p1State.tokens += sac * successfulGods.p1.data.effectValue;
            logs.push({ key: 'logs.god_used', params: { player: 'P1', god: 'Odin', level: successfulGods.p1.levelIdx + 1 } });
        }
    }
    if (successfulGods.p2?.id === 'odins_sacrifice') {
        if (p2State.health > 3) {
            const sac = 3;
            p2State.health -= sac;
            p2State.tokens += sac * successfulGods.p2.data.effectValue;
            logs.push({ key: 'logs.god_used', params: { player: 'P2', god: 'Odin', level: successfulGods.p2.levelIdx + 1 } });
        }
    }

    return { newP1State: p1State, newP2State: p2State, logs };
};
