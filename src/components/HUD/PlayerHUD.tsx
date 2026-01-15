import React from 'react';
import type { PlayerState } from '../../types/game';
import { Heart, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GodFavorButton } from './GodFavorButton';
import { RuneStoneIcon } from '../Icons/VikingIcons';
import { useGameStore } from '../../store/gameStore';

interface PlayerHUDProps {
    player: PlayerState;
    isCurrentTurn: boolean;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ player, isCurrentTurn }) => {
    const { t } = useTranslation();
    const selectGodFavor = useGameStore(state => state.selectGodFavor);
    const phase = useGameStore(state => state.phase);

    // Only allow interaction if it's the player's HUD and we are in the God Favor phase (or potentially Roll phase if we want pre-selection)
    // For now, let's strictly restrict to GOD_FAVOR_PHASE for the "Invocation" step.
    const isInteractive = player.id === 'player' && phase === 'GOD_FAVOR_PHASE';

    return (
        <div className={`p-4 rounded-xl border-2 transition-colors duration-300 w-full max-w-sm flex flex-col gap-3
      ${isCurrentTurn ? 'bg-slate-800 border-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-slate-900/80 border-slate-700'}
    `}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className={`font-serif text-lg font-bold ${isCurrentTurn ? 'text-viking-gold' : 'text-slate-400'}`}>
                    {player.id === 'player' ? t('hud.jarl') : t('hud.rival')}
                </h2>
                {isCurrentTurn && <span className="text-xs text-viking-gold animate-pulse">{t('hud.your_turn')}</span>}
            </div>

            {/* Stats Row */}
            <div className="flex gap-4">
                {/* Health */}
                <div className="flex items-center gap-2">
                    <Heart className="text-viking-blood fill-viking-blood" size={20} />
                    <span className="text-xl font-mono text-gray-200">{player.health} / {player.maxHealth}</span>
                </div>

                {/* Tokens */}
                <div className="flex items-center gap-2">
                    <RuneStoneIcon size={20} className="text-viking-gold" />
                    <span className="text-xl font-mono text-viking-gold">{player.tokens}</span>
                </div>
            </div>

            {/* Health Bar */}
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-viking-blood"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
            </div>

            {/* God Favors List */}
            {player.equippedGods.length > 0 && (
                <div className="flex gap-2 justify-center pt-2 border-t border-white/5">
                    {player.equippedGods.map(godId => (
                        <GodFavorButton
                            key={godId}
                            godId={godId}
                            currentTokens={player.tokens}
                            selectedLevel={player.selectedGodFavor?.godId === godId ? player.selectedGodFavor.level : null}
                            onSelect={(level) => selectGodFavor(player.id, godId, level)}
                            disabled={!isInteractive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
