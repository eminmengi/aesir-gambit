import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Type for visual effects
type VisualEffect = 'shake' | 'flash' | 'lightning' | 'sparkles' | 'none';

export const AnimationController: React.FC = () => {
    const { logs } = useGameStore();
    const [effect, setEffect] = useState<VisualEffect>('none');
    const [message, setMessage] = useState<string | null>(null);
    const lastProcessedLogLength = React.useRef(0);

    const { t } = useTranslation();

    // Watch for new logs
    useEffect(() => {
        if (logs.length > lastProcessedLogLength.current) {
            const newLogIndex = logs.length - 1;
            const lastLog = logs[newLogIndex];
            const logKey = lastLog.key;

            // Effect Logic
            if (logKey.includes('damage_dealt') && lastLog.params?.source === 'Thor') {
                triggerEffect('lightning');
            }
            else if (logKey.includes('healed')) {
                triggerEffect('sparkles');
            }
            else if (logKey.includes('damage') || logKey.includes('strike')) {
                triggerEffect('shake'); // Generic damage
            }
            else if (logKey.includes('gain') || logKey.includes('rejuvenation')) {
                triggerEffect('flash'); // Generic good thing
            }

            setMessage(t(lastLog.key, lastLog.params));
            const timer = setTimeout(() => setMessage(null), 3000);

            lastProcessedLogLength.current = logs.length;
            return () => clearTimeout(timer);
        }
    }, [logs, t]);

    const triggerEffect = (type: VisualEffect) => {
        setEffect(type);
        setTimeout(() => setEffect('none'), 800);
    };

    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">

            {/* Shake Effect */}
            {effect === 'shake' && (
                <motion.div
                    className="absolute inset-0 border-4 border-red-500/50"
                    initial={{ x: 0 }}
                    animate={{ x: [-10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                />
            )}

            {/* Flash Effect */}
            {effect === 'flash' && (
                <motion.div
                    className="absolute inset-0 bg-yellow-400/30 mix-blend-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                />
            )}

            {/* Lightning Effect (Thor) */}
            {effect === 'lightning' && (
                <>
                    <motion.div
                        className="absolute inset-0 bg-blue-100/40 mix-blend-hard-light"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 0] }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.svg
                        viewBox="0 0 100 100"
                        className="absolute w-full h-full text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 0.4 }}
                    >
                        <path d="M50 0 L30 40 L50 40 L20 100 L60 50 L40 50 L70 0 Z" fill="currentColor" />
                    </motion.svg>
                </>
            )}

            {/* Sparkles Effect (Idun/Heal) */}
            {effect === 'sparkles' && (
                <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-yellow-300 rounded-full shadow-[0_0_10px_gold]"
                            style={{
                                width: Math.random() * 8 + 4 + 'px',
                                height: Math.random() * 8 + 4 + 'px',
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%'
                            }}
                            initial={{ scale: 0, y: 0, opacity: 0 }}
                            animate={{ scale: [0, 1, 0], y: -100, opacity: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                        />
                    ))}
                </div>
            )}

            {/* Floating Combat Text / Notifications */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={clsx(
                            "px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md text-lg font-serif tracking-wide border",
                            "bg-black/80 border-viking-gold/30 text-viking-gold",
                            (effect === 'shake' || effect === 'lightning') && "border-red-500/50 text-red-100",
                            effect === 'sparkles' && "border-emerald-500/50 text-emerald-100"
                        )}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
