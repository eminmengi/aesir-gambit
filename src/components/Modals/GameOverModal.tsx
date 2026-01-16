import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Trophy, Skull } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const GameOverModal: React.FC = () => {
    const { winner, resetGame } = useGameStore();
    const { t } = useTranslation();

    if (!winner) return null;

    const isVictory = winner === 'player';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 p-1 w-full max-w-lg mx-4"
            >
                <div className={`
                    relative overflow-hidden rounded-3xl border-4 
                    ${isVictory ? 'border-viking-gold bg-gradient-to-b from-amber-900/90 to-black' : 'border-slate-600 bg-gradient-to-b from-slate-900/95 to-black'}
                    shadow-[0_0_50px_rgba(0,0,0,0.8)]
                `}>

                    {/* Background Pattern - Removed noise, using subtle gradient overlay instead */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Content Container */}
                    <div className="relative p-10 flex flex-col items-center text-center gap-6">

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`p-6 rounded-full border-4 ${isVictory ? 'bg-viking-gold/20 border-viking-gold text-viking-gold' : 'bg-slate-700/50 border-slate-500 text-stone-400'}`}
                        >
                            {isVictory ? <Trophy size={64} /> : <Skull size={64} />}
                        </motion.div>

                        {/* Text */}
                        <div className="space-y-2">
                            <h2 className={`text-5xl font-serif font-bold tracking-widest uppercase ${isVictory ? 'text-transparent bg-clip-text bg-gradient-to-r from-viking-gold to-yellow-200' : 'text-stone-400'}`}>
                                {isVictory ? t('game.victory') : t('game.defeat')}
                            </h2>
                            <p className="text-stone-400 font-serif italic text-lg">
                                {isVictory ? t('game.victory_desc', 'Valhalla awaits!') : t('game.defeat_desc', 'Fallen, but not forgotten.')}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => resetGame()}
                            className={`
                                group relative px-8 py-4 rounded-xl font-bold text-xl uppercase tracking-widest flex items-center gap-3 transition-all
                                ${isVictory
                                    ? 'bg-gradient-to-r from-viking-gold to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]'
                                    : 'bg-slate-800 border border-slate-600 text-stone-300 hover:bg-slate-700 hover:text-white'}
                            `}
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            {t('game.play_again')}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Confetti or Rain based on result (Optional polish integration later) */}
        </div>
    );
};
