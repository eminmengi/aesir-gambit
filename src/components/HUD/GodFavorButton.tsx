import React from 'react';
import { GODS } from '../../data/gods';
import type { GodFavorId } from '../../types/game';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    ThorHammerIcon, WolfHeadIcon,
    HuntingHornIcon, SnakeIcon, SnowflakeIcon, CrossedSwordsIcon,
    SkullIcon, OakLeafIcon, SunIcon, BoarIcon, SpiderWebIcon,
    QuiverIcon, HarpIcon, DropIcon, GemNecklaceIcon, TrollIcon,
    KeyIcon, EyeShieldIcon, KnotIcon, WingedEmblemIcon
} from '../Icons/VikingIcons';

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
    'mimirs_wisdom': DropIcon, // Water from the well
    'hels_grip': SkullIcon,
    'freyjas_plenty': GemNecklaceIcon,
    'lokis_trick': SnakeIcon,
    'thrymrs_theft': TrollIcon,
    'vars_bond': KnotIcon,
    'brunhilds_fury': WingedEmblemIcon, // Valkyrie wings
    'tyrs_pledge': CrossedSwordsIcon,
    'odins_sacrifice': EyeShieldIcon,
};

interface GodFavorButtonProps {
    godId: GodFavorId;
    currentTokens: number;
    selectedLevel: 1 | 2 | 3 | null;
    onSelect: (level: 0 | 1 | 2 | 3) => void;
    disabled?: boolean;
}

export const GodFavorButton: React.FC<GodFavorButtonProps> = ({ godId, currentTokens, selectedLevel, onSelect, disabled }) => {
    const { t } = useTranslation();
    const god = GODS[godId];
    const IconComponent = GOD_ICONS[godId];

    if (!god) return null;


    return (
        <div className="relative group">
            {/* God Icon / Card - CLICKABLE */}
            <div
                onClick={() => {
                    if (disabled) return;

                    let nextLevel = (selectedLevel || 0) + 1;
                    if (nextLevel > 3) nextLevel = 0; // Cycle back to 0

                    // Skip levels we can't afford (optional UX choice: skip or just stop?)
                    // User request: "1 kere tıkladığında lvl1, 2 kere tıkladığında lvl2..."
                    // If we can't afford next level, what happens? Just don't select it?
                    // Let's cycle: 0 -> 1 (if $) -> 2 (if $) -> 3 (if $) -> 0

                    // If next level is too expensive, reset to 0 (or find highest affordable? No, strict cycle is clearer)
                    // If I have tokens for Lvl 1 but not Lvl 2: Click 1 -> Selects Lvl 1. Click 2 -> Tries Lvl 2, fails(stay Lvl 1? or deselect?).
                    // Let's implement: Cycle 0->1->2->3->0. If can't afford specific level, skip to next affordable or wrap to 0.
                    // Simplified: Try next. If too expensive, treat as invalid step and try next-next? 
                    // Better UX: Just standard cycle 0-1-2-3-0. Checks affordability. If can't afford, don't change state? Or deselect?

                    // Let's proceed with: Try next level. If affordable, select. If not, reset to 0.
                    // Actually, if I can't afford Lvl 2, clicking on Lvl 1 (active) should probably just deselect (0) or stay Lvl 1.
                    // User Logic: "1 click Lvl1, 2 clicks Lvl2".

                    if (nextLevel > 0) {
                        const cost = god.levels[nextLevel - 1].cost;
                        if (currentTokens >= cost) {
                            onSelect(nextLevel as 1 | 2 | 3);
                        } else {
                            // If can't afford next level, effectively deselect (loop breaker)
                            onSelect(0);
                        }
                    } else {
                        onSelect(0);
                    }
                }}
                className={`
                w-16 h-16 rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300
                ${selectedLevel ? 'border-viking-gold bg-viking-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-stone-600 bg-stone-800/50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-viking-light cursor-pointer hover:scale-105 active:scale-95'}
            `}
            >
                {/* Background texture or gradient */}
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />

                {/* God Icon (SVG) - Centered & Large */}
                {IconComponent ? (
                    <div className={`transition-all duration-300 ${selectedLevel ? 'text-viking-gold scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'text-stone-500 group-hover:text-stone-400'}`}>
                        <IconComponent size={40} className="w-full h-full" />
                    </div>
                ) : (
                    // Fallback to name if icon missing
                    <span className={`font-serif text-[10px] leading-tight text-center px-1 font-bold ${selectedLevel ? 'text-viking-gold' : 'text-stone-400'}`}>
                        {t(`gods.${god.id}.name`)}
                    </span>
                )}

                {/* Selection Indicator Overlay */}
                {selectedLevel && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-yellow-500/10"
                    />
                )}
            </div>

            {/* Level Selectors (Always visible or only on hover? Let's make them always visible below) */}
            < div className="flex justify-between mt-1 gap-1 w-16" >
                {
                    [1, 2, 3].map((level) => {
                        const cost = god.levels[level - 1].cost;
                        const canAfford = currentTokens >= cost;
                        const isSelected = selectedLevel === level;

                        return (
                            <button
                                key={level}
                                disabled={disabled || !canAfford}
                                onClick={() => onSelect(isSelected ? 0 : level as 1 | 2 | 3)}
                                className={`
                                h-1.5 flex-1 rounded-full transition-all duration-200
                                ${isSelected ? 'bg-viking-gold shadow-[0_0_5px_#d4af37]' : ''}
                                ${!isSelected && canAfford ? 'bg-emerald-500/50 hover:bg-emerald-400' : ''}
                                ${!isSelected && !canAfford ? 'bg-stone-800' : ''}
                            `}
                                title={disabled ? '' : `${t(`gods.${god.id}.l${level}`)} (Cost: ${cost})`}
                            />
                        );
                    })
                }
            </div >

            {/* Hover Tooltip */}
            < div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded bg-slate-900 border border-viking-gold/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs text-center hidden group-hover:block" >
                <div className="font-bold text-viking-gold mb-1">{t(`gods.${god.id}.name`)}</div>
                <div className="text-stone-400 mb-2 italic text-[10px]">{t(`gods.${god.id}.desc`)}</div>
                <div className="space-y-1">
                    {god.levels.map((l, i) => (
                        <div key={i} className={`flex justify-between ${currentTokens >= l.cost ? 'text-emerald-400' : 'text-stone-600'}`}>
                            <span>Lvl {i + 1}</span>
                            <span>{l.cost} <span className="text-yellow-500">❂</span></span>
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
};
