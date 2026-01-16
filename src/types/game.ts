export type PlayerId = 'player' | 'opponent';

export type DiceType = 'axe' | 'arrow' | 'helmet' | 'shield' | 'hand';

export interface DiceFace {
    type: DiceType;
    value: number; // Usually 1
    hasToken: boolean; // Gold border
}

export interface DieState {
    id: string;
    face: DiceFace;
    locked: boolean;
}

export type Phase = 'ROLL_PHASE' | 'GOD_FAVOR_PHASE' | 'RESOLUTION_PHASE' | 'GAME_OVER';

export interface GodFavorLevel {
    cost: number;
    effectValue: number;
    description: string;
}

export type GodFavorId =
    | 'thors_strike'
    | 'iduns_rejuvenation'
    | 'vidars_might'
    | 'baldrs_invulnerability'
    | 'skadis_hunt'
    | 'freyrs_plenty'
    | 'skulds_claim'
    | 'ullrs_aim'
    | 'heimdalls_watch'
    | 'friggs_sight'
    | 'bragis_verve'
    | 'mimirs_wisdom'
    | 'hels_grip'
    | 'freyjas_plenty'
    | 'lokis_trick'
    | 'thrymrs_theft'
    | 'vars_bond'
    | 'brunhilds_fury'
    | 'tyrs_pledge'
    | 'odins_sacrifice';


export interface GodFavor {
    id: GodFavorId;
    name: string;
    priority: number;
    levels: [GodFavorLevel, GodFavorLevel, GodFavorLevel]; // 3 levels
}

export interface PlayerState {
    id: PlayerId;
    health: number;
    maxHealth: number;
    tokens: number;
    dice: DieState[];
    selectedGodFavor: {
        godId: GodFavorId;
        level: 1 | 2 | 3;
    } | null;
    equippedGods: GodFavorId[]; // Max 3
}

export interface LogEntry {
    key: string;
    params?: Record<string, any>;
}

export interface GameState {
    phase: Phase; // Assuming GamePhase was a typo and should be Phase based on existing type
    currentTurn: PlayerId;
    rollCount: number; // 0-3
    hasRolled: boolean;
    players: {
        player: PlayerState;
        opponent: PlayerState;
    };
    winner: PlayerId | null;
    logs: LogEntry[];
    aiDifficulty: 'easy' | 'medium' | 'hard';
}
