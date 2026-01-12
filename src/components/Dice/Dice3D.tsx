import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Target, Shield, Anchor, Hand } from 'lucide-react'; // Anchor for Helmet placeholder
import type { DiceFace } from '../../types/game';
import clsx from 'clsx';

interface Dice3DProps {
    face: DiceFace;
    locked: boolean;
    onClick?: () => void;
    rolling: boolean;
    disabled?: boolean;
}

const ICONS = {
    axe: <Sword size={32} className="text-viking-blood rotate-45" />,
    arrow: <Target size={32} className="text-emerald-600" />,
    helmet: <Anchor size={32} className="text-slate-600" />, // Placeholder
    shield: <Shield size={32} className="text-blue-700" />,
    hand: <Hand size={32} className="text-amber-600" />,
};

const COLORS = {
    axe: 'bg-stone-200 border-viking-blood',
    arrow: 'bg-stone-200 border-emerald-600',
    helmet: 'bg-stone-200 border-slate-500',
    shield: 'bg-stone-200 border-blue-600',
    hand: 'bg-stone-200 border-amber-600',
};

export const Dice3D: React.FC<Dice3DProps> = ({ face, locked, onClick, rolling, disabled }) => {
    return (
        <div className="perspective-500 w-24 h-24">
            <motion.div
                className={clsx(
                    "w-full h-full relative preserve-3d cursor-pointer transition-all duration-300",
                    locked ? "translate-y-4" : "hover:-translate-y-2",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
                onClick={() => !disabled && onClick?.()}
                animate={{
                    rotateX: rolling ? 360 * 2 : 0,
                    rotateY: rolling ? 360 * 2 : 0,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Main Face */}
                <div className={clsx(
                    "absolute inset-0 rounded-xl border-4 flex flex-col items-center justify-center shadow-xl backface-hidden",
                    "bg-[#e8e6e1] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]",
                    locked ? "ring-4 ring-viking-gold ring-offset-2 scale-95" : "",
                    COLORS[face.type]
                )}>
                    {/* Gold Token Border */}
                    {face.hasToken && (
                        <div className="absolute inset-1 border-2 border-dashed border-viking-gold rounded-lg opacity-60"></div>
                    )}

                    <div className="transform scale-125 drop-shadow-md">
                        {ICONS[face.type]}
                    </div>

                    {face.hasToken && (
                        <span className="absolute bottom-1 text-[8px] font-serif uppercase tracking-widest text-viking-gold font-bold">
                            God Token
                        </span>
                    )}
                </div>

                {/* 3D Sides (Optional - for simple depth effect we can use shadows, but here is mock depth) */}
                <div className="absolute inset-x-0 bottom-0 h-4 bg-stone-400 opacity-50 translate-y-full rounded-[50%] blur-md scale-x-75"></div>
            </motion.div>
        </div>
    );
};
