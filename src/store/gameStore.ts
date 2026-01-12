import { create } from 'zustand';
import { GameState, PlayerId, PlayerState, DieState, DiceFace } from '../types/game';

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
    endTurn: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
    phase: 'ROLL_PHASE',
    currentTurn: 'player', // Her zaman oyuncu başlar (şimdilik)
    rollCount: 0,
    players: {
        player: createInitialPlayer('player'),
        opponent: createInitialPlayer('opponent'),
    },
    winner: null,

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

    endTurn: () => {
        // Karmaşık Faz yönetimi burada olacak
        set((state) => {
            const nextRollCount = state.rollCount + 1;

            // Basit mantık: 3 atış bitti mi?
            if (nextRollCount > 3) {
                return { phase: 'GOD_FAVOR_PHASE', rollCount: 0 };
            }

            return {
                currentTurn: state.currentTurn === 'player' ? 'opponent' : 'player',
                rollCount: state.currentTurn === 'player' ? nextRollCount : state.rollCount // Sadece user turunda artırıyoruz şimdilik
            };
        });
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
