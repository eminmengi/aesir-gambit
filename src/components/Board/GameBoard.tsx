import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Dice3D } from '../Dice/Dice3D';
import { PlayerHUD } from '../HUD/PlayerHUD';
import { GodSelectionModal } from '../Gods/GodSelectionModal';
import { useTranslation } from 'react-i18next';
import { Settings, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GameBoard: React.FC = () => {
    const {
        players,
        phase,
        currentTurn,
        rollCount,
        rollDice,
        toggleLock,
        advancePhase,
        resetGame: _resetGame,
        logs,
    } = useGameStore();

    const [isRolling, setIsRolling] = React.useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { t, i18n } = useTranslation();

    const handleRoll = () => {
        setIsRolling(true);
        setTimeout(() => {
            rollDice('player');
            setIsRolling(false);
        }, 800);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    // Auto-open God Selection if gods are not equipped
    const showGodSelection = players.player.equippedGods.length === 0;

    // AI Turn Simulation
    useEffect(() => {
        if (currentTurn === 'opponent' && phase === 'ROLL_PHASE') {
            const timer = setTimeout(() => {
                rollDice('opponent');
                advancePhase();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentTurn, phase, rollDice, advancePhase]);

    const p1 = players.player;
    const p2 = players.opponent;

    return (
        <div className="min-h-screen bg-[#1a1c20] flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans select-none">

            {/* Ambient Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-[#1a1c20] to-[#0f1115] pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none mix-blend-overlay" />

            {/* --- MODALS --- */}
            {showGodSelection && (
                <GodSelectionModal onClose={() => { }} />
            )}

            {/* --- HEADER (Settings) --- */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-black/40 text-stone-400 hover:text-viking-gold border border-white/5 rounded-full backdrop-blur-md transition-all hover:bg-black/60"
                >
                    <Settings className="w-6 h-6" />
                </button>

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-14 right-0 w-48 bg-[#15171b] border border-viking-gold/20 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl"
                        >
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-stone-300 hover:text-white transition-colors text-sm font-serif"
                            >
                                <Globe className="w-4 h-4 text-viking-gold" />
                                <span>{i18n.language === 'tr' ? 'English' : 'Türkçe'}</span>
                            </button>
                            <div className="px-4 py-2 text-xs text-stone-600 border-t border-white/5 mt-1 pt-2 text-center uppercase tracking-widest">
                                Version 0.4.1
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- OPPONENT AREA (TOP) --- */}
            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 pt-4">
                <PlayerHUD player={p2} isCurrentTurn={currentTurn === 'opponent'} />

                <div className="relative p-6 rounded-3xl bg-black/30 border border-white/5 shadow-2xl backdrop-blur-sm">
                    <div className="flex gap-6">
                        {p2.dice.map((die) => (
                            <Dice3D
                                key={die.id}
                                face={die.face}
                                locked={die.locked}
                                rolling={false}
                                disabled={true}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CENTER AREA (Logs & Phase Info) --- */}
            <div className="z-10 flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-3xl">

                {/* Game Title & Phase */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-viking-gold to-amber-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.2em] uppercase">
                        {t('game.title')}
                    </h1>

                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#0f1115]/80 border border-viking-stone/30 rounded-full shadow-inner">
                        <span className={`w-2 h-2 rounded-full ${currentTurn === 'player' ? 'bg-viking-gold animate-pulse' : 'bg-slate-600'}`}></span>
                        <span className="text-stone-300 font-serif tracking-widest text-sm uppercase">
                            {t(`phases.${phase}`)} {phase === 'ROLL_PHASE' && `(${rollCount}/3)`}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${currentTurn === 'opponent' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
                    </div>
                </div>

                {/* Log & Action Display */}
                <div className="w-full relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-viking-gold/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-[#0f1115]/90 border border-viking-wood/50 p-4 rounded-xl shadow-2xl min-h-[120px] max-h-[160px] overflow-y-auto flex flex-col-reverse gap-1 scrollbar-hide">
                        {logs && logs.map((log, i) => (
                            <div key={i} className="text-sm font-mono text-emerald-400/90 border-b border-white/5 pb-1 last:border-0 truncate">
                                <span className="text-viking-gold opacity-50 mr-2">›</span>
                                {/* Check if log is string (legacy) or LogEntry object */}
                                {typeof log === 'string' ? log : t(log.key, log.params)}
                            </div>
                        ))}
                        {(!logs || logs.length === 0) && (
                            <div className="text-center text-slate-600 italic font-serif mt-2 opacity-50">{t('game.waiting')}</div>
                        )}
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="h-20 flex items-center justify-center gap-6">
                    {phase === 'ROLL_PHASE' && currentTurn === 'player' && (
                        <>
                            <button
                                onClick={handleRoll}
                                disabled={rollCount >= 3}
                                className="relative group px-10 py-4 bg-gradient-to-b from-viking-gold to-amber-600 rounded-lg shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.5)] transform active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-300"
                            >
                                <div className="font-serif font-bold text-slate-900 text-xl tracking-wider uppercase flex items-center gap-2">
                                    {rollCount >= 3 ? t('game.locked') : t('game.roll')}
                                </div>
                                <div className="absolute inset-0 rounded-lg border-2 border-white/20 pointer-events-none" />
                            </button>

                            <button
                                onClick={advancePhase}
                                className="px-8 py-4 bg-slate-800 border border-slate-600 text-stone-300 font-serif font-bold rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-500 shadow-lg transform active:scale-95 transition-all uppercase tracking-wider"
                            >
                                {t('game.end_turn')}
                            </button>
                        </>
                    )}

                    {phase === 'RESOLUTION_PHASE' && (
                        <button
                            onClick={advancePhase}
                            className="px-12 py-5 bg-gradient-to-r from-viking-blood to-red-900 text-white font-serif font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(136,14,79,0.5)] animate-bounce border-2 border-red-400/50 uppercase tracking-[0.2em]"
                        >
                            {t('game.next_round')}
                        </button>
                    )}
                </div>
            </div>

            {/* --- PLAYER AREA (BOTTOM) --- */}
            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 pb-8">
                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-slate-900/80 to-[#15171b]/90 border border-viking-gold/20 shadow-2xl backdrop-blur-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1a1c20] border border-viking-gold/30 rounded-full text-[10px] text-viking-gold uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                        {t('game.your_bowl')}
                    </div>
                    <div className="flex gap-6">
                        {p1.dice.map((die, idx) => (
                            <Dice3D
                                key={die.id}
                                face={die.face}
                                locked={die.locked}
                                rolling={isRolling && !die.locked}
                                onClick={() => toggleLock('player', idx)}
                                disabled={currentTurn !== 'player' || phase !== 'ROLL_PHASE' || rollCount >= 3}
                            />
                        ))}
                    </div>
                </div>

                <PlayerHUD player={p1} isCurrentTurn={currentTurn === 'player'} />
            </div>
        </div>
    );
};
