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
                // In real AI, we would select locks here first
                rollDice('opponent');
                advancePhase();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentTurn, phase, rollDice, advancePhase]);

    const p1 = players.player;
    const p2 = players.opponent;

    return (
        <div className="min-h-screen bg-viking-dark flex flex-col items-center justify-between p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] relative overflow-hidden">

            {/* --- OPPONENT AREA (TOP) --- */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-4 rotate-180 transform opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex gap-4">
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
                <PlayerHUD player={p2} isCurrentTurn={currentTurn === 'opponent'} />
            </div>

            {/* --- CENTER AREA (Logs & Phase Info) --- */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 my-4 w-full max-w-4xl">

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-serif text-viking-gold drop-shadow-lg tracking-widest">{t('game.title')}</h1>

                    <div className="inline-block px-6 py-2 bg-slate-900 border border-viking-stone rounded-full">
                        <span className="text-stone-300 font-sans tracking-wider text-sm">
                            {phase === 'ROLL_PHASE' ? `ROLL PHASE (${rollCount}/3)` :
                                phase === 'GOD_FAVOR_PHASE' ? 'GOD FAVOR PHASE' :
                                    'RESOLUTION'}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                {phase === 'ROLL_PHASE' && currentTurn === 'player' && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => rollDice('player')}
                            disabled={rollCount >= 3}
                            className="bg-viking-gold hover:bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-serif text-xl border-b-4 border-amber-700"
                        >
                            {rollCount >= 3 ? "NO ROLLS LEFT" : t('game.roll')}
                        </button>

                        <button
                            onClick={advancePhase}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all font-serif text-xl border-b-4 border-slate-900"
                        >
                            {t('game.end_turn')}
                        </button>
                    </div>
                )}

                {/* Simple Log Display */}
                {logs && logs.length > 0 && (
                    <div className="bg-black/50 p-4 rounded-lg w-full h-32 overflow-y-auto font-mono text-sm text-green-400 border border-viking-wood">
                        {logs.map((log, i) => <div key={i}>{'>'} {log}</div>)}
                    </div>
                )}

                {phase === 'RESOLUTION_PHASE' && (
                    <button onClick={advancePhase} className="animate-bounce bg-viking-blood text-white px-8 py-4 rounded-xl font-bold font-serif border-2 border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                        NEXT ROUND
                    </button>
                )}

            </div>

            {/* --- PLAYER AREA (BOTTOM) --- */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-6">
                <PlayerHUD player={p1} isCurrentTurn={currentTurn === 'player'} />

                <div className="flex justify-center gap-4 bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
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

        </div>
    );
};
