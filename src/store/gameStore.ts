import { create } from 'zustand';
import type { GameState, PlayerId, PlayerState, DiceFace } from '../types/game';
import { resolveRound } from '../logic/resolution';

// Yardımcı: Rastgele Zar yüzü üret
const rollSingleDie = (): DiceFace => {
    const types = ['axe', 'arrow', 'helmet', 'shield', 'hand'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const hasToken = Math.random() < 0.35; // %35 şansla tokenlı gelir
    return { type, value: 1, hasToken };
};

// Initial Player State
const createInitialPlayer = (id: PlayerId): PlayerState => ({
    id,
    health: 15,
    maxHealth: 15,
    tokens: 0,
    dice: Array.from({ length: 6 }, (_, i) => ({
        id: `${id}-die-${i}`,
        face: rollSingleDie(),
        locked: false,
    })),
    selectedGodFavor: null,
    equippedGods: ['thors_strike', 'iduns_rejuvenation', 'vidars_might'], // Başlangıç seti
});

interface GameActions {
    rollDice: (player: PlayerId) => void;
    toggleLock: (player: PlayerId, dieIndex: number) => void;
    selectGodFavor: (player: PlayerId, godId: string, level: 1 | 2 | 3) => void;
    confirmGodFavorSelection: (player: PlayerId) => void;
    advancePhase: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
    phase: 'ROLL_PHASE',
    currentTurn: 'player', // 'player' or 'opponent'
    rollCount: 0,
    players: {
        player: createInitialPlayer('player'),
        opponent: createInitialPlayer('opponent'),
    },
    winner: null,
    logs: [], // To store resolution logs

    rollDice: (playerId) => {
        const state = get();
        if (state.rollCount >= 3) return;

        set((state) => {
            const player = state.players[playerId];
            const newDice = player.dice.map((die) =>
                die.locked ? die : { ...die, face: rollSingleDie() }
            );

            return {
                players: {
                    ...state.players,
                    [playerId]: { ...player, dice: newDice }
                },
                rollCount: playerId === 'player' ? state.rollCount : state.rollCount // AI sırasında rollCount artmaz, state makinesi yönetir
            };
        });
    },

    toggleLock: (playerId, dieIndex) => {
        set((state) => {
            const player = state.players[playerId];
            const newDice = [...player.dice];
            newDice[dieIndex] = { ...newDice[dieIndex], locked: !newDice[dieIndex].locked };

            return {
                players: {
                    ...state.players,
                    [playerId]: { ...player, dice: newDice }
                }
            };
        });
    },

    selectGodFavor: (playerId, godId, level) => {
        // @ts-ignore - ID mismatch fix later
        set(state => ({
            players: {
                ...state.players,
                [playerId]: {
                    ...state.players[playerId],
                    selectedGodFavor: { godId: godId as any, level }
                }
            }
        }))
    },

    confirmGodFavorSelection: (_playerId) => {
        // In a real game, both players lock in secretly. 
        // For now, we just wait for the button press.
        // If It's Multiplayer/AI, we need a "ready" state.
        // Simplification: Direct advance for now managed by UI or AI controller.
    },

    advancePhase: () => {
        const state = get();

        // LOGIC: Handles State Machine Transitions

        // 1. ROLL PHASE LOGIC
        if (state.phase === 'ROLL_PHASE') {
            const nextRollCount = state.rollCount + 1;

            // If Player 1 played -> switch to Player 2
            // IF Player 2 played -> Increment roll count or Finish Phase

            if (state.currentTurn === 'player') {
                set({ currentTurn: 'opponent' });
            } else {
                // Opponent finished their roll
                if (nextRollCount >= 3) {
                    // All rolls done -> Move to God Favor
                    set({
                        phase: 'GOD_FAVOR_PHASE',
                        rollCount: 0,
                        currentTurn: 'player' // Reset turn for selection
                    });
                } else {
                    // Next roll round
                    set({
                        currentTurn: 'player',
                        rollCount: nextRollCount
                    });
                }
            }
            return;
        }

        // 2. GOD FAVOR PHASE LOGIC
        if (state.phase === 'GOD_FAVOR_PHASE') {
            // Assume both selected. Move to Resolution.
            set({ phase: 'RESOLUTION_PHASE' });

            // Trigger Resolution immediately? Or wait for animation?
            // Let's trigger logic immediately, result updates state.
            const result = resolveRound(state.players.player, state.players.opponent);

            set({
                players: {
                    player: result.newP1State,
                    opponent: result.newP2State
                },
                logs: result.logs
            });

            return;
        }

        // 3. RESOLUTION / END PHASE
        if (state.phase === 'RESOLUTION_PHASE') {
            // Clean up for new round
            set(state => ({
                phase: 'ROLL_PHASE',
                rollCount: 0,
                currentTurn: 'player',
                players: {
                    player: {
                        ...state.players.player,
                        selectedGodFavor: null,
                        dice: state.players.player.dice.map(d => ({ ...d, locked: false, face: rollSingleDie() }))
                    },
                    opponent: {
                        ...state.players.opponent,
                        selectedGodFavor: null,
                        dice: state.players.opponent.dice.map(d => ({ ...d, locked: false, face: rollSingleDie() }))
                    }
                }
            }));
        }
    },

    resetGame: () => {
        set({
            phase: 'ROLL_PHASE',
            currentTurn: 'player',
            rollCount: 0,
            players: {
                player: createInitialPlayer('player'),
                opponent: createInitialPlayer('opponent'),
            },
            winner: null
        });
    }
}));
