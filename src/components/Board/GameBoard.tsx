import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Dice3D } from '../Dice/Dice3D';
import { PlayerHUD } from '../HUD/PlayerHUD';
import { useTranslation } from 'react-i18next';

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

    const { t } = useTranslation();

    // AI Turn Simulation
    useEffect(() => {
        if (currentTurn === 'opponent' && phase === 'ROLL_PHASE') {
            const timer = setTimeout(() => {
                // Simulate AI thinking and rolling
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

            {/* --- OPPONENT AREA (TOP) --- */}
            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 pt-4">
                {/* HUD */}
                <PlayerHUD player={p2} isCurrentTurn={currentTurn === 'opponent'} />

                {/* Dice Tray - Top */}
                <div className="relative p-6 rounded-3xl bg-black/30 border border-white/5 shadow-2xl backdrop-blur-sm">
                    <div className="flex gap-6">
                        {p2.dice.map((die, _idx) => (
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

                {/* Game Title & Phase Indicator */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-viking-gold to-amber-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.2em] uppercase">
                        {t('game.title')}
                    </h1>

                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#0f1115]/80 border border-viking-stone/30 rounded-full shadow-inner">
                        <span className={`w-2 h-2 rounded-full ${currentTurn === 'player' ? 'bg-viking-gold animate-pulse' : 'bg-slate-600'}`}></span>
                        <span className="text-stone-300 font-serif tracking-widest text-sm uppercase">
                            {phase.replace('_', ' ')} {phase === 'ROLL_PHASE' && `(${rollCount}/3)`}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${currentTurn === 'opponent' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
                    </div>
                </div>

                {/* Log & Action Display */}
                <div className="w-full relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-viking-gold/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-[#0f1115]/90 border border-viking-wood/50 p-4 rounded-xl shadow-2xl min-h-[120px] max-h-[160px] overflow-y-auto flex flex-col-reverse gap-1">
                        {logs && logs.map((log, i) => (
                            <div key={i} className="text-sm font-mono text-emerald-400/90 border-b border-white/5 pb-1 last:border-0">
                                <span className="text-viking-gold opacity-50 mr-2">›</span>
                                {log}
                            </div>
                        ))}
                        {(!logs || logs.length === 0) && (
                            <div className="text-center text-slate-600 italic font-serif mt-2">The battle awaits...</div>
                        )}
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="h-20 flex items-center justify-center gap-6">
                    {phase === 'ROLL_PHASE' && currentTurn === 'player' && (
                        <>
                            <button
                                onClick={() => rollDice('player')}
                                disabled={rollCount >= 3}
                                className="relative group px-10 py-4 bg-gradient-to-b from-viking-gold to-amber-600 rounded-lg shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.5)] transform active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-300"
                            >
                                <div className="font-serif font-bold text-slate-900 text-xl tracking-wider uppercase flex items-center gap-2">
                                    {rollCount >= 3 ? "Locked" : t('game.roll')}
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
                            Next Round
                        </button>
                    )}
                </div>
            </div>

            {/* --- PLAYER AREA (BOTTOM) --- */}
            <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-6 pb-8">
                {/* Dice Tray - Bottom */}
                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-slate-900/80 to-[#15171b]/90 border border-viking-gold/20 shadow-2xl backdrop-blur-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1a1c20] border border-viking-gold/30 rounded-full text-[10px] text-viking-gold uppercase tracking-widest">
                        Your Bowl
                    </div>
                    <div className="flex gap-6">
                        {p1.dice.map((die, idx) => (
                            <Dice3D
                                key={die.id}
                                face={die.face}
                                locked={die.locked}
                                rolling={false}
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
