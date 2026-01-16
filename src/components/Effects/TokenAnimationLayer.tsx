import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '../../store/animationStore';
import { RuneStoneIcon } from '../Icons/VikingIcons';

interface Coords { x: number; y: number }

const FlyingToken = ({ from, to, delay, onComplete }: { from: Coords; to: Coords; delay: number; onComplete: () => void }) => {
    return (
        <motion.div
            initial={{
                x: from.x,
                y: from.y,
                opacity: 0,
                scale: 0.5,
                rotate: 0
            }}
            animate={{
                x: to.x,
                y: to.y,
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 0.8],
                rotate: 360 // Spin while flying
            }}
            transition={{
                duration: 0.8,
                ease: "easeInOut",
                delay: delay
            }}
            onAnimationComplete={onComplete}
            className="absolute top-0 left-0 z-[100] pointer-events-none text-viking-gold"
            style={{ filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.6))' }}
        >
            <RuneStoneIcon size={24} />
        </motion.div>
    );
};

export const TokenAnimationLayer: React.FC = () => {
    const { animations, removeAnimation } = useAnimationStore();
    const [particles, setParticles] = useState<{ id: string; from: Coords; to: Coords; delay: number }[]>([]);

    useEffect(() => {
        // Process new animations
        animations.forEach(anim => {
            const fromEl = document.getElementById(anim.fromId);
            const toEl = document.getElementById(anim.toId);

            if (fromEl && toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                // Generate particles
                const newParticles = Array.from({ length: anim.count }).map((_, i) => ({
                    id: `${anim.id}-${i}`,
                    from: { x: fromRect.left + (fromRect.width / 2) - 12, y: fromRect.top + (fromRect.height / 2) - 12 },
                    to: { x: toRect.left + (toRect.width / 2) - 12, y: toRect.top + (toRect.height / 2) - 12 },
                    delay: i * 0.1
                }));

                setParticles(prev => [...prev, ...newParticles]);
                removeAnimation(anim.id);
            } else {
                console.warn("Animation target not found:", anim.fromId, anim.toId);
                removeAnimation(anim.id);
            }
        });
    }, [animations, removeAnimation]);

    const removeParticle = (id: string) => {
        setParticles(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {particles.map(p => (
                    <FlyingToken
                        key={p.id}
                        from={p.from}
                        to={p.to}
                        delay={p.delay}
                        onComplete={() => removeParticle(p.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
