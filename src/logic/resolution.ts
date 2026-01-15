import type { PlayerState, GameState, DiceFace, LogEntry } from "../types/game";
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

    // Clone states to avoid direct mutation
    let p1State = structuredClone(p1);
    let p2State = structuredClone(p2);

    // Helper: Count Dice Faces
    const countFaces = (dice: DiceFace[], type: string) => dice.filter(d => d.type === type).length;

    // 1. Token Gain
    const p1Gold = p1State.dice.filter(d => d.face.hasToken).length;
    const p2Gold = p2State.dice.filter(d => d.face.hasToken).length;

    p1State.tokens += p1Gold;
    p2State.tokens += p2Gold;
    if (p1Gold > 0 || p2Gold > 0) {
        logs.push({ key: 'logs.token_gain', params: { p1: p1Gold, p2: p2Gold } });
    }

    // 2. Steal Logic
    const p1Steal = countFaces(p1State.dice.map(d => d.face), 'hand');
    const p2Steal = countFaces(p2State.dice.map(d => d.face), 'hand');

    const p1Stolen = Math.min(p2State.tokens, p1Steal);
    p2State.tokens -= p1Stolen;
    p1State.tokens += p1Stolen;

    const p2Stolen = Math.min(p1State.tokens, p2Steal);
    p1State.tokens -= p2Stolen;
    p2State.tokens += p2Stolen;

    if (p1Stolen > 0 || p2Stolen > 0) {
        logs.push({ key: 'logs.steal', params: { p1: p1Stolen, p2: p2Stolen } });
    }

    // 3. GOD POWER ACTIVATION
    const resolveGod = (user: PlayerState, opponent: PlayerState, isP1: boolean) => {
        if (!user.selectedGodFavor) return;

        const god = GODS[user.selectedGodFavor.godId];
        const level = god.levels[user.selectedGodFavor.level - 1];
        const playerName = isP1 ? 'P1' : 'P2';

        // FIZZLE CHECK
        if (user.tokens < level.cost) {
            logs.push({ key: 'logs.fizzle', params: { player: playerName, god: god.name } });
            return;
        }

        // PAY COST
        user.tokens -= level.cost;
        logs.push({ key: 'logs.god_used', params: { player: playerName, god: god.name, level: user.selectedGodFavor.level } });

        // APPLY EFFECT
        if (god.id === 'thors_strike') {
            opponent.health = Math.max(0, opponent.health - level.effectValue);
            logs.push({ key: 'logs.damage_dealt', params: { source: god.name, amount: level.effectValue } });
        } else if (god.id === 'iduns_rejuvenation') {
            user.health = Math.min(user.maxHealth, user.health + level.effectValue);
            logs.push({ key: 'logs.healed', params: { source: god.name, amount: level.effectValue } });
        }
    };

    const p1God = p1State.selectedGodFavor ? GODS[p1State.selectedGodFavor.godId] : null;
    const p2God = p2State.selectedGodFavor ? GODS[p2State.selectedGodFavor.godId] : null;

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
    if (totalP1Dmg > 0) {
        logs.push({ key: 'logs.physical_damage', params: { player: 'P1', amount: totalP1Dmg } });
    }

    // P2 Attack -> P1 Defend
    const p2AxeDmg = Math.max(0, p2Axes - p1Helmets);
    const p2ArrowDmg = Math.max(0, p2Arrows - p1Shields);
    const totalP2Dmg = p2AxeDmg + p2ArrowDmg;

    p1State.health = Math.max(0, p1State.health - totalP2Dmg);
    if (totalP2Dmg > 0) {
        logs.push({ key: 'logs.physical_damage', params: { player: 'P2', amount: totalP2Dmg } });
    }

    // 5. POST-RESOLUTION GODS (Thor)
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
