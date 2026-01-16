import React, { useState } from 'react';
import { GODS } from '../../data/gods';
import type { GodFavorId } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const GodSelectionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { players, setPlayerGods, aiDifficulty } = useGameStore();
    const [selectedGods, setSelectedGods] = useState<GodFavorId[]>(players.player.equippedGods || []);
    const { t } = useTranslation();

    const handleToggleGod = (godId: GodFavorId) => {
        if (selectedGods.includes(godId)) {
            setSelectedGods(prev => prev.filter(id => id !== godId));
        } else {
            if (selectedGods.length < 3) {
                setSelectedGods(prev => [...prev, godId]);
            }
        }
    };

    const handleConfirm = () => {
        setPlayerGods('player', selectedGods);
        // Auto-select 3 random gods for opponent if not set
        if (players.opponent.equippedGods.length === 0) {
            const allGods = Object.keys(GODS) as GodFavorId[];
            const randomGods = allGods.sort(() => 0.5 - Math.random()).slice(0, 3);
            setPlayerGods('opponent', randomGods);
        }
        onClose();
    };

    // Filter to only implemented gods for now to prevent issues
    const availableGods = Object.values(GODS).filter(g =>
        ['thors_strike', 'iduns_rejuvenation', 'vidars_might',
            'baldrs_invulnerability', 'skadis_hunt', 'freyrs_plenty', 'heimdalls_watch', 'lokis_trick', 'odins_sacrifice', 'friggs_sight', 'tyrs_pledge',
            'hels_grip'].includes(g.id) || true // Show all for now, assuming data exists
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="bg-[#1a1c20] w-full max-w-5xl h-[85vh] rounded-3xl border border-viking-gold/30 shadow-2xl flex flex-col overflow-hidden relative">
                    {/* Background Ambient */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 pointer-events-none mix-blend-overlay" />

                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#0f1115] to-[#1a1c20] z-10">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-viking-gold tracking-widest uppercase drop-shadow-md">
                                {t('gods.select_title', 'Choose Your Patrons')}
                            </h2>
                            <p className="text-stone-400 font-sans mt-1">
                                {t('gods.select_subtitle', 'Select 3 Gods to aid you in battle')} ({selectedGods.length}/3)
                            </p>
                        </div>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedGods.length !== 3}
                            className="bg-viking-gold/90 hover:bg-viking-gold text-black font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-serif flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
                        >
                            <span>{t('gods.start_battle')}</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Difficulty & Settings Bar */}
                    <div className="bg-[#15171b] border-b border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 shadow-lg">
                        <div className="flex items-center gap-4">
                            <span className="text-stone-400 text-sm font-serif uppercase tracking-widest">
                                {t('ai.difficulty_title', 'AI Difficulty')}:
                            </span>
                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                {(['easy', 'medium', 'hard'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => useGameStore.getState().setAiDifficulty(level)}
                                        className={clsx(
                                            "px-4 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1",
                                            aiDifficulty === level
                                                ? level === 'easy' ? "bg-emerald-900/50 text-emerald-400 border border-emerald-500/50"
                                                    : level === 'medium' ? "bg-amber-900/50 text-amber-400 border border-amber-500/50"
                                                        : "bg-red-900/50 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                                                : "text-stone-600 hover:text-stone-300 hover:bg-white/5"
                                        )}
                                        title={t(`ai.${level}_desc`)}
                                    >
                                        <span>{t(`ai.${level}`).split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="hidden md:block text-xs text-stone-500 italic max-w-md border-l border-white/10 pl-4">
                                {t(`ai.${aiDifficulty}_desc`)}
                            </div>
                        </div>
                    </div>

                    {/* God Grid */}
                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 custom-scrollbar">
                        {availableGods.map(god => {
                            const isSelected = selectedGods.includes(god.id);
                            return (
                                <div
                                    key={god.id}
                                    onClick={() => handleToggleGod(god.id)}
                                    className={clsx(
                                        "relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-4 min-h-[220px]",
                                        isSelected
                                            ? "bg-viking-gold/10 border-viking-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner transition-colors duration-300",
                                                isSelected ? "bg-viking-gold text-black" : "bg-black/40 text-stone-500 group-hover:text-stone-300"
                                            )}>
                                                {(() => {
                                                    const IconComponent = GOD_ICONS[god.id] || RuneStoneIcon;
                                                    return <IconComponent size={28} />;
                                                })()}
                                            </div>
                                            <h3 className={clsx("font-serif font-bold text-lg", isSelected ? "text-viking-gold" : "text-stone-300")}>
                                                {t(`gods.${god.id}.name`, god.name)}
                                            </h3>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 bg-viking-gold rounded-full flex items-center justify-center">
                                                <CheckIcon className="w-4 h-4 text-black stroke-2" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-stone-400 font-sans leading-relaxed line-clamp-3">
                                        {/* Show Description from i18n */}
                                        {t(`gods.${god.id}.desc`, god.levels[0].description)}
                                    </p>

                                    {/* Levels Preview (Mini) */}
                                    <div className="mt-auto flex gap-2 text-xs font-mono text-stone-500">
                                        <div className="px-2 py-1 bg-black/30 rounded border border-white/5" title={t(`gods.${god.id}.l1`)}>
                                            {t('game.lvl')} 1: {god.levels[0].cost}
                                        </div>
                                        <div className="px-2 py-1 bg-black/30 rounded border border-white/5" title={t(`gods.${god.id}.l2`)}>
                                            {t('game.lvl')} 2: {god.levels[1].cost}
                                        </div>
                                        <div className="px-2 py-1 bg-black/30 rounded border border-white/5" title={t(`gods.${god.id}.l3`)}>
                                            {t('game.lvl')} 3: {god.levels[2].cost}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

import {
    ThorHammerIcon, WolfHeadIcon, RuneStoneIcon,
    HuntingHornIcon, SnakeIcon, SnowflakeIcon, CrossedSwordsIcon,
    SkullIcon, OakLeafIcon, SunIcon, BoarIcon, SpiderWebIcon,
    QuiverIcon, HarpIcon, DropIcon, GemNecklaceIcon, TrollIcon,
    KeyIcon, EyeShieldIcon, KnotIcon, WingedEmblemIcon
} from '../Icons/VikingIcons';

// Map God IDs to Viking Icons for visual flair
const GOD_ICONS: Record<string, React.FC<{ size?: number, className?: string }>> = {
    'thors_strike': ThorHammerIcon,
    'iduns_rejuvenation': OakLeafIcon,
    'vidars_might': WolfHeadIcon,
    'baldrs_invulnerability': SunIcon,
    'skadis_hunt': SnowflakeIcon,
    'freyrs_plenty': BoarIcon,
    'skulds_claim': SpiderWebIcon,
    'ullrs_aim': QuiverIcon,
    'heimdalls_watch': HuntingHornIcon,
    'friggs_sight': KeyIcon,
    'bragis_verve': HarpIcon,
    'mimirs_wisdom': DropIcon,
    'hels_grip': SkullIcon,
    'freyjas_plenty': GemNecklaceIcon,
    'lokis_trick': SnakeIcon,
    'thrymrs_theft': TrollIcon,
    'vars_bond': KnotIcon,
    'brunhilds_fury': WingedEmblemIcon,
    'tyrs_pledge': CrossedSwordsIcon,
    'odins_sacrifice': EyeShieldIcon,
};
