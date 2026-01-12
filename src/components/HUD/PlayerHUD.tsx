import React from 'react';
import type { PlayerState } from '../../types/game';
import { Heart, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerHUDProps {
    player: PlayerState;
    isCurrentTurn: boolean;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ player, isCurrentTurn }) => {
    return (
        <div className={`p-4 rounded-xl border-2 transition-colors duration-300 w-full max-w-sm
      ${isCurrentTurn ? 'bg-slate-800 border-viking-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-slate-900/80 border-slate-700'}
    `}>
            <div className="flex items-center justify-between mb-2">
                <h2 className={`font-serif text-lg font-bold ${isCurrentTurn ? 'text-viking-gold' : 'text-slate-400'}`}>
                    {player.id === 'player' ? 'JARL (You)' : 'RIVAL'}
                </h2>
                {isCurrentTurn && <span className="text-xs text-viking-gold animate-pulse">YOUR TURN</span>}
            </div>

            <div className="flex gap-4">
                {/* Health */}
                <div className="flex items-center gap-2">
                    {/* Visual representation of stones could go here */}
                    <Heart className="text-viking-blood fill-viking-blood" size={20} />
                    <span className="text-xl font-mono text-gray-200">{player.health} / {player.maxHealth}</span>
                </div>

                {/* Tokens */}
                <div className="flex items-center gap-2">
                    <Coins className="text-viking-gold fill-viking-gold" size={20} />
                    <span className="text-xl font-mono text-viking-gold">{player.tokens}</span>
                </div>
            </div>

            <div className="h-2 w-full bg-slate-700 rounded-full mt-3 overflow-hidden">
                <motion.div
                    className="h-full bg-viking-blood"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
            </div>
        </div>
    );
};
