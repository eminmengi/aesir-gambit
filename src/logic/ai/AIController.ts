import type { DiceFace, GameState, PlayerState, GodFavorId } from '../../types/game';
import { GODS } from '../../data/gods';

// Heuristic Weights
interface Weights {
    axe: number;
    arrow: number;
    helmet: number;
    shield: number;
    hand: number;
    tokenBonus: number; // Extra weight if face has token
}

export class AIController {

    /**
     * Simulates a full turn (3 rolls) instantly to produce a "smart" final hand.
     */
    static simulateTurn(currentState: GameState): DiceFace[] {
        const ai = currentState.players.opponent;
        const player = currentState.players.player;

        // 1. Determine Needs (Weights)
        const weights = this.calculateWeights(ai, player);

        // 2. Simulation Loop (3 Rolls)
        let currentHand: DiceFace[] = [];
        let keptIndices: number[] = [];

        // Initial Roll (6 dice)
        currentHand = Array.from({ length: 6 }, () => this.rollDie());

        // Round 1 Decision
        keptIndices = this.decideKeep(currentHand, weights);

        // Reroll 1 (Unkept dice)
        currentHand = currentHand.map((d, i) => keptIndices.includes(i) ? d : this.rollDie());

        // Round 2 Decision
        keptIndices = this.decideKeep(currentHand, weights);

        // Reroll 2 (Final)
        currentHand = currentHand.map((d, i) => keptIndices.includes(i) ? d : this.rollDie());

        return currentHand;
    }

    /**
     * Decides which God Favor to use and at what level.
     */
    static decideGodFavor(state: GameState): { godId: string, level: 1 | 2 | 3 } | null {
        const ai = state.players.opponent;

        if (ai.equippedGods.length === 0) return null;

        let bestChoice: { godId: string, level: 1 | 2 | 3, score: number } | null = null;

        // Iterate over equipped gods (equippedGods is string[])
        for (const godId of ai.equippedGods) {
            const god = GODS[godId];
            if (!god) continue;

            // Check affordability of levels
            for (let i = 0; i < 3; i++) {
                const levelIdx = i; // 0, 1, 2
                const levelNum = (i + 1) as 1 | 2 | 3;
                const cost = god.levels[levelIdx].cost;

                if (ai.tokens >= cost) {
                    const score = this.evaluateGodEffect(godId, levelNum, state);
                    if (!bestChoice || score > bestChoice.score) {
                        bestChoice = { godId: godId, level: levelNum, score };
                    }
                }
            }
        }

        // minimum threshold to ACT
        if (bestChoice && bestChoice.score > 5) {
            return { godId: bestChoice.godId, level: bestChoice.level };
        }

        return null;
    }

    // --- Helpers ---

    private static rollDie(): DiceFace {
        const types = ['axe', 'arrow', 'helmet', 'shield', 'hand'] as const;
        return {
            type: types[Math.floor(Math.random() * types.length)],
            value: 1,
            hasToken: Math.random() < 0.35
        };
    }

    private static calculateWeights(ai: PlayerState, player: PlayerState): Weights {
        const w: Weights = { axe: 1, arrow: 1, helmet: 1, shield: 1, hand: 1, tokenBonus: 2 };

        // 1. Survival Mode
        if (ai.health <= 5) {
            w.helmet += 3;
            w.shield += 3;
            w.hand += 2; // Steal tokens to prevent enemy gods
        }

        // 2. Kill Mode
        if (player.health <= 4) {
            w.axe += 3;
            w.arrow += 3;
        }

        // 3. Economy Mode (Early game)
        if (ai.tokens < 5 && ai.health > 10) {
            w.tokenBonus += 3; // Heavily prioritize dotted dice
            w.hand += 1.5;
        }

        // 4. God Specific Synergies (Simple check of first equipped god)
        if (ai.equippedGods.length > 0) {
            const godId = ai.equippedGods[0];
            if (godId === 'thors_strike') w.tokenBonus += 1;
            if (godId === 'iduns_rejuvenation') { w.tokenBonus += 1; }
            if (godId === 'vidars_might') { w.tokenBonus += 1; }
        }

        return w;
    }

    private static decideKeep(hand: DiceFace[], w: Weights): number[] {
        // Score each die
        const scoredDice = hand.map((d, index) => {
            let score = w[d.type];
            if (d.hasToken) score += w.tokenBonus;
            return { index, score };
        });

        // Sort by score desc
        scoredDice.sort((a, b) => b.score - a.score);

        // Keep dice with score >= 3.5
        return scoredDice.filter(d => d.score >= 3.5).map(d => d.index);
    }

    private static evaluateGodEffect(godId: GodFavorId, level: number, state: GameState): number {
        const ai = state.players.opponent;
        const P = state.players.player;
        const god = GODS[godId];
        const effectVal = god.levels[level - 1].effectValue;

        let score = 0;

        switch (godId) {
            case 'thors_strike':
                // Damage
                score = effectVal * 2; // 1 dmg = 2 score
                if (P.health <= effectVal) score += 50; // LETHAL!
                break;
            case 'iduns_rejuvenation':
                // Heal
                if (ai.health < ai.maxHealth) {
                    score = effectVal * 2.5; // Healing is valuable
                    if (ai.health <= 5) score += 10; // Critical heal
                }
                break;
            case 'vidars_might':
                // Remove helmets (Situational)
                score = effectVal * 1;
                if (P.health < 8) score += 5; // Good to push damage
                break;
            default:
                score = 5; // Base utility
        }

        return score;
    }
}
