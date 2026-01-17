import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Dice3D } from '../Dice/Dice3D';
import { PlayerHUD } from '../HUD/PlayerHUD';
import { GodSelectionModal } from '../Gods/GodSelectionModal';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Settings, Globe, CloudSnow, CloudRain, Flame, Sun, Trees, Box, Moon, Brain, Shield, Skull, Lock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationController } from '../Effects/AnimationController';
import { TokenAnimationLayer } from '../Effects/TokenAnimationLayer';
import { DynamicBackground } from '../Effects/DynamicBackground';

import { GameOverModal } from '../Modals/GameOverModal';

import { AIController } from '../../logic/ai/AIController';

// Available themes
type WeatherTheme = 'snow' | 'rain' | 'ember' | 'clear';
type BackgroundTheme = 'wood' | 'stone' | 'dark';

// CSS Patterns for backgrounds (More reliable than external images)
const BG_STYLES: Record<BackgroundTheme, React.CSSProperties> = {
    wood: {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
        backgroundBlendMode: 'overlay',
        backgroundColor: '#3d2b1f'
    },
    stone: {
        // Fallback to a dark noise if image fails, but trying a better source or style
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://www.transparenttextures.com/patterns/black-scales.png')`,
        backgroundColor: '#1c1c1c'
    },
    dark: {
        background: 'linear-gradient(to bottom, #0f172a, #000000)'
    }
};

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
        hasRolled,
        aiDifficulty,
        setLockedDice,
    } = useGameStore();

    const [isRolling, setIsRolling] = React.useState(false);
    const [isOpponentRolling, setIsOpponentRolling] = React.useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [weather, setWeather] = useState<WeatherTheme>('ember');
    const [bgTheme, setBgTheme] = useState<BackgroundTheme>('stone');
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

    // AI Turn Logic (Step-by-Step)
    useEffect(() => {
        const state = useGameStore.getState();

        // 1. ROLL PHASE LOGIC
        if (currentTurn === 'opponent' && phase === 'ROLL_PHASE' && !isOpponentRolling) {
            setIsOpponentRolling(true);

            // Step A: Animation Delay before Roll (0.8s)
            const preRollTimer = setTimeout(() => {
                state.rollDice('opponent');

                // Step B: Rolling Animation (1.2s)
                setTimeout(() => {
                    setIsOpponentRolling(false);

                    // Step C: Thinking & Decision (0.8s)
                    setTimeout(() => {
                        // AI Decides what to KEEP (Lock)
                        const keepIndices = AIController.decideNextMove(useGameStore.getState());
                        state.setLockedDice('opponent', keepIndices);

                        // Step D: Pass Turn (0.5s)
                        setTimeout(() => {
                            state.advancePhase();
                        }, 500);

                    }, 800);
                }, 1200);

            }, 800);

            return () => {
                clearTimeout(preRollTimer);
            };
        }

        // 2. GOD FAVOR PHASE LOGIC
        if (phase === 'GOD_FAVOR_PHASE') {
            // AI instantly picks a God power if it hasn't already (or we just overwrite)
            const decision = AIController.decideGodFavor(state);
            if (decision) {
                useGameStore.getState().selectGodFavor('opponent', decision.godId, decision.level);
            }
        }

    }, [currentTurn, phase, rollCount, setLockedDice]);

    const p1 = players.player;
    const p2 = players.opponent;

    // Pre-Roll State Logic (Face Down until first roll)
    // CRITICAL FIX: Only apply this during ROLL_PHASE. In God Favor/Resolution, dice must be visible!
    const isRollPhase = phase === 'ROLL_PHASE';
    const isFirstTurn = rollCount === 0;
    const p1FaceDown = isRollPhase && isFirstTurn && currentTurn === 'player' && !hasRolled && !isRolling;
    const p2FaceDown = isRollPhase && isFirstTurn && (currentTurn === 'player' || (currentTurn === 'opponent' && !hasRolled && !isOpponentRolling));

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans select-none transition-all duration-700"
            style={BG_STYLES[bgTheme]}
        >

            {/* Ambient Lighting Overlay based on Weather */}
            <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none mix-blend-soft-light
                ${weather === 'snow' ? 'bg-blue-200/5' : ''}
                ${weather === 'ember' ? 'bg-orange-500/10' : ''}
                ${weather === 'rain' ? 'bg-blue-900/20' : ''}
            `} />

            <DynamicBackground weather={weather} />

            <AnimationController />
            <TokenAnimationLayer />

            {phase === 'GAME_OVER' && <GameOverModal />}

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
                            className="absolute top-14 right-0 w-72 bg-[#15171b]/95 border border-viking-gold/20 rounded-xl shadow-2xl p-4 flex flex-col gap-4 backdrop-blur-xl"
                        >
                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-stone-300 hover:text-white transition-colors text-sm font-serif border border-white/5"
                            >
                                <Globe className="w-4 h-4 text-viking-gold" />
                                <span>{i18n.language === 'tr' ? 'English' : 'Türkçe'}</span>
                            </button>

                            {/* Restart Game Button */}
                            <button
                                onClick={() => {
                                    if (confirm(t('common.restart_confirm', 'Oyunu yeniden başlatmak istediğine emin misin?'))) {
                                        useGameStore.getState().resetGame();
                                        setShowSettings(false);
                                    }
                                }}
                                className="w-full mb-4 flex items-center justify-center gap-2 p-3 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 rounded-lg transition-all font-serif uppercase tracking-widest text-xs"
                            >
                                <RotateCcw size={14} />
                                <span>{t('game.restart')}</span>
                            </button>

                            {/* AI Difficulty Selector */}
                            {/* AI Difficulty Status (Read Only) */}
                            <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/5">
                                <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                    <span>{t('ai.difficulty_title')}</span>
                                    <Lock size={10} className="text-stone-600" />
                                </div>
                                <div className={clsx(
                                    "flex items-center gap-3 text-sm font-bold p-2 rounded",
                                    aiDifficulty === 'easy' ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                                        aiDifficulty === 'medium' ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
                                            "text-red-500 bg-red-600/10 border border-red-600/20"
                                )}>
                                    {aiDifficulty === 'easy' && <Shield size={18} />}
                                    {aiDifficulty === 'medium' && <Brain size={18} />}
                                    {aiDifficulty === 'hard' && <Skull size={18} />}
                                    <span>
                                        {aiDifficulty === 'easy' ? t('ai.easy').split(' ')[0] :
                                            aiDifficulty === 'medium' ? t('ai.medium').split(' ')[0] :
                                                t('ai.hard').split(' ')[0]}
                                    </span>
                                </div>
                                <div className="mt-2 text-[10px] text-stone-500 italic">
                                    {t(`ai.${aiDifficulty}_desc`)}
                                </div>
                            </div>

                            <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                {t('themes.title')}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {(['snow', 'rain', 'ember', 'clear'] as WeatherTheme[]).map((w) => (
                                    <button
                                        key={w}
                                        onClick={() => setWeather(w)}
                                        className={`
                                                flex items-center justify-center p-3 rounded-lg border transition-all
                                                ${weather === w
                                                ? 'bg-viking-gold/20 border-viking-gold text-viking-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                                                : 'bg-black/40 border-transparent text-stone-500 hover:bg-white/5 hover:text-stone-300'}
                                            `}
                                        title={t(`themes.${w}`)}
                                    >
                                        {w === 'snow' && <CloudSnow size={18} />}
                                        {w === 'rain' && <CloudRain size={18} />}
                                        {w === 'ember' && <Flame size={18} />}
                                        {w === 'clear' && <Sun size={18} />}
                                    </button>
                                ))}
                            </div>

                            {/* Background Texture Selector */}
                            <div>
                                <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-2">{t('themes.bg_texture', 'Zemin / Doku')}</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setBgTheme('stone')}
                                        className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${bgTheme === 'stone' ? 'bg-viking-gold/20 border-viking-gold text-viking-gold' : 'bg-black/40 border-transparent text-stone-500'}`}
                                    >
                                        <Box size={16} />
                                        <span className="text-[10px]">{t('themes.stone', 'Taş')}</span>
                                    </button>
                                    <button
                                        onClick={() => setBgTheme('wood')}
                                        className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${bgTheme === 'wood' ? 'bg-viking-gold/20 border-viking-gold text-viking-gold' : 'bg-black/40 border-transparent text-stone-500'}`}
                                    >
                                        <Trees size={16} />
                                        <span className="text-[10px]">{t('themes.wood', 'Ahşap')}</span>
                                    </button>
                                    <button
                                        onClick={() => setBgTheme('dark')}
                                        className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${bgTheme === 'dark' ? 'bg-viking-gold/20 border-viking-gold text-viking-gold' : 'bg-black/40 border-transparent text-stone-500'}`}
                                    >
                                        <Moon size={16} />
                                        <span className="text-[10px]">{t('themes.dark', 'Koyu')}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="text-[10px] text-stone-700 text-center uppercase tracking-widest pt-2 border-t border-white/5">
                                v0.4.4
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
                                id={die.id}
                                face={die.face}
                                locked={die.locked}
                                rolling={isOpponentRolling && !die.locked}
                                disabled={true}
                                isFaceDown={p2FaceDown}
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
                                disabled={rollCount >= 3 || hasRolled}
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

                    {phase === 'GOD_FAVOR_PHASE' && (
                        <button
                            onClick={advancePhase}
                            className="px-12 py-5 bg-gradient-to-r from-viking-gold to-amber-500 text-black font-serif font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-pulse border-2 border-white/20 uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                        >
                            {t('gods.start_battle')}
                        </button>
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
                    <div className="flex gap-6">
                        {p1.dice.map((die, idx) => (
                            <Dice3D
                                key={die.id}
                                id={die.id}
                                face={die.face}
                                locked={die.locked}
                                rolling={isRolling && !die.locked}
                                onClick={() => !p1FaceDown && toggleLock('player', idx)}
                                disabled={currentTurn !== 'player' || phase !== 'ROLL_PHASE' || rollCount >= 3 || p1FaceDown}
                                isFaceDown={p1FaceDown}
                            />
                        ))}
                    </div>
                </div>

                <PlayerHUD player={p1} isCurrentTurn={currentTurn === 'player'} />
            </div>
        </div >
    );
};
