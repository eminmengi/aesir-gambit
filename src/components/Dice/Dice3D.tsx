import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { DiceFace, DiceType } from '../../types/game';
import clsx from 'clsx';

interface Dice3DProps {
    face: DiceFace;
    locked: boolean;
    onClick?: () => void;
    rolling: boolean;
    disabled?: boolean;
    id?: string;
    isFaceDown?: boolean;
}

import {
    AxeIcon, ArrowIcon, HelmetIcon, ShieldIcon, HandIcon
} from '../Icons/VikingIcons';

const ICONS: Record<DiceType, React.ReactNode> = {
    axe: <AxeIcon size={48} className="text-[#3e2723] rotate-[15deg]" />,
    arrow: <ArrowIcon size={46} className="text-[#b71c1c] rotate-[15deg]" />,
    helmet: <HelmetIcon size={44} className="text-[#37474f]" />,
    shield: <ShieldIcon size={44} className="text-[#01579b]" />,
    hand: <HandIcon size={42} className="text-[#e65100]" />,
};

// Standard Orlog Dice Neighbors (Visual approximation)
const NEIGHBORS: Record<DiceType, DiceType[]> = {
    axe: ['helmet', 'shield', 'arrow', 'hand', 'axe'],
    arrow: ['shield', 'helmet', 'axe', 'hand', 'arrow'],
    helmet: ['axe', 'arrow', 'shield', 'hand', 'helmet'],
    shield: ['arrow', 'axe', 'helmet', 'hand', 'shield'],
    hand: ['axe', 'helmet', 'arrow', 'shield', 'hand']
};

export const Dice3D: React.FC<Dice3DProps> = ({ face, locked, onClick, rolling, disabled, id, isFaceDown }) => {
    const { t } = useTranslation();
    const controls = useAnimation();

    // Generate neighbors based on the current face type
    const decorativeFaces = useMemo(() => {
        const neighbors = NEIGHBORS[face.type];
        return [
            { type: neighbors[0], hasToken: false },
            { type: neighbors[1], hasToken: true },
            { type: neighbors[2], hasToken: false },
            { type: neighbors[3], hasToken: true },
            { type: neighbors[4], hasToken: false },
        ];
    }, [face.type]);

    useEffect(() => {
        if (rolling) {
            // Randomize tumbling to make it look organic
            // We spin 4 full rotations (1440 deg) ensuring we land back at 0 relative (multiple of 360)
            const randomX = 720 + Math.random() * 360; // Mid-air chaotic spin
            const randomY = 720 + Math.random() * 360;
            const randomZ = 180 + Math.random() * 180;
            const direction = Math.random() > 0.5 ? 1 : -1;

            controls.start({
                y: [0, -120 * direction, 0], // The "Toss" arc (vertical) and LAND
                x: [0, 20 * direction, 0],   // Slight horizontal drift
                scale: [1, 1.15, 1],         // Looming effect (closer to camera)
                rotateX: [0, randomX, 1440], // Spin X
                rotateY: [0, randomY, 1440], // Spin Y
                rotateZ: [0, randomZ, 360],  // Spin Z
                transition: {
                    duration: 1.0,
                    times: [0, 0.5, 1], // Peak at 50%
                    ease: "easeInOut"
                }
            }).then(() => {
                // Impact Shake (Landing)
                controls.start({
                    y: [0, -10, 0],
                    rotateX: [1440, 1450, 1440],
                    transition: { duration: 0.2, ease: "easeOut" }
                });
            });
        } else {
            // Reset to clean state (0,0,0) INSTANTLY to prevent "unwinding" mechanism
            // We use duration: 0 to snap from 1440 -> 0 (visually identical)
            controls.start({
                y: 0,
                x: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                transition: { duration: 0 }
            });
        }
    }, [rolling, controls]);

    const halfSize = "40px"; // 80px cube / 2

    const CubeFace = ({
        style,
        className,
        isFront = false,
        type,
        hasToken = false,
        hideContent = false
    }: {
        style?: React.CSSProperties,
        className?: string,
        isFront?: boolean,
        type: DiceType,
        hasToken?: boolean,
        hideContent?: boolean
    }) => (
        <div
            className={clsx(
                "absolute inset-0 rounded-sm flex items-center justify-center backface-hidden",
                // Material: Paper Texture
                "bg-[#d7ccc4] border border-[#8d6e63]",
                className
            )}
            style={style}
        >
            {/* Render Icon (Hidden if Face Down) */}
            {!hideContent && (
                <div className={clsx("transform transition-all duration-300", locked && isFront ? "scale-90" : "scale-100")}>
                    {ICONS[type]}
                </div>
            )}

            {/* Gold Token Border (Hidden if Face Down) */}
            {hasToken && !hideContent && (
                <>
                    {/* Inner Glow for depth */}
                    <div className="absolute inset-[4px] rounded-sm shadow-[inset_0_0_8px_rgba(251,191,36,0.4)] pointer-events-none" />
                    {/* Main Gold Dashed Border with Outer Glow */}
                    <div className="absolute inset-[6px] border-[3px] border-dashed border-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)] opacity-90" />
                </>
            )}

            {/* Inner Shadow for recessed look */}
            <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(62,39,35,0.2)] pointer-events-none" />
        </div>
    );

    return (
        <div id={id} className="group relative w-24 h-24 flex items-center justify-center select-none perspective-[800px]">
            <motion.div
                className={clsx(
                    "w-20 h-20 relative preserve-3d cursor-pointer active:scale-95",
                    locked ? "translate-y-3" : "hover:-translate-y-2",
                    disabled && !locked && !rolling && "opacity-70 grayscale-[0.3]",
                    rolling && "z-50" // Boost Z-Index when rolling
                )}
                style={{
                    transformStyle: 'preserve-3d',
                    // Force full visibility when rolling to prevent 2D flattening
                    ...(rolling ? { opacity: 1, filter: 'none' } : {})
                }}
                onClick={() => !disabled && onClick?.()}
                animate={controls}
            >
                {/* FRONT - Result Face */}
                <CubeFace
                    style={{ transform: `rotateY(0deg) translateZ(${halfSize})` }}
                    isFront={true}
                    type={face.type}
                    hasToken={face.hasToken}
                    hideContent={isFaceDown}
                />

                {/* BACK */}
                <CubeFace
                    style={{ transform: `rotateY(180deg) translateZ(${halfSize})` }}
                    type={decorativeFaces[0].type}
                    hasToken={decorativeFaces[0].hasToken}
                />

                {/* RIGHT */}
                <CubeFace
                    style={{ transform: `rotateY(90deg) translateZ(${halfSize})` }}
                    type={decorativeFaces[1].type}
                    hasToken={decorativeFaces[1].hasToken}
                />

                {/* LEFT */}
                <CubeFace
                    style={{ transform: `rotateY(-90deg) translateZ(${halfSize})` }}
                    type={decorativeFaces[2].type}
                    hasToken={decorativeFaces[2].hasToken}
                />

                {/* TOP */}
                <CubeFace
                    style={{ transform: `rotateX(90deg) translateZ(${halfSize})` }}
                    type={decorativeFaces[3].type}
                    hasToken={decorativeFaces[3].hasToken}
                />

                {/* BOTTOM */}
                <CubeFace
                    style={{ transform: `rotateX(-90deg) translateZ(${halfSize})` }}
                    type={decorativeFaces[4].type}
                    hasToken={decorativeFaces[4].hasToken}
                />

                {locked && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center perspective-[100px] z-50 pointer-events-none"
                    >
                        <div className="px-2 py-0.5 bg-black/80 text-[10px] font-serif text-amber-500 border border-amber-900/50 rounded shadow-lg uppercase tracking-widest backdrop-blur-sm whitespace-nowrap">
                            {t('game.kept')}
                        </div>
                    </motion.div>
                )}

            </motion.div>

            {/* Shadow */}
            {!locked && !rolling && (
                <div className="absolute top-20 w-16 h-4 bg-black/30 blur-md rounded-[50%] transition-opacity duration-300 group-hover:scale-110 group-hover:bg-black/20" />
            )}
        </div>
    );
};
