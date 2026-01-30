import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, X, Check, Swords, Coins, Sparkles } from 'lucide-react';
import { Dice3D } from '../Dice/Dice3D';


// Slide Components (Refined)
const Slide1_Goal: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full gap-10 text-center relative z-10">
            <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative"
            >
                <div className="absolute inset-0 bg-viking-gold/20 blur-[60px] rounded-full" />
                <Swords size={120} className="text-viking-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] relative z-10" />
            </motion.div>

            <div className="max-w-xl space-y-6">
                <h3 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-viking-gold via-amber-200 to-viking-gold tracking-[0.2em] uppercase drop-shadow-sm">
                    {t('tutorial.slide1.title')}
                </h3>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-viking-gold to-transparent mx-auto" />
                <p className="text-stone-300 text-xl leading-relaxed font-serif italic opacity-90">
                    "{t('tutorial.slide1.desc')}"
                </p>
            </div>
        </div>
    );
};

const Slide2_Dice: React.FC = () => {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState<string | null>(null);
    const diceTypes = ['axe', 'arrow', 'helmet', 'shield', 'hand'] as const;

    return (
        <div className="flex flex-col h-full items-center justify-center gap-12">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-serif font-bold text-viking-gold tracking-[0.15em] border-b-2 border-viking-gold/20 pb-2 inline-block">
                    {t('tutorial.slide2.title')}
                </h3>
            </div>

            <div className="flex gap-8 items-center justify-center perspective-[1200px] min-h-[160px]">
                {diceTypes.map((type, i) => (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                        onMouseEnter={() => setHovered(type)}
                        onMouseLeave={() => setHovered(null)}
                        className="relative group flex flex-col items-center"
                    >
                        <div className="relative z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4 cursor-help">
                            {/* Glow Effect behind die */}
                            <div className={`absolute inset-0 bg-viking-gold/0 group-hover:bg-viking-gold/20 blur-xl transition-all duration-500 rounded-full`} />

                            <div className="scale-90">
                                <Dice3D
                                    face={{ type, value: 1, hasToken: false }}
                                    locked={false}
                                    rolling={false}
                                    id={`tutorial-die-${type}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Dedicated Description Area (Prevents Overlap) */}
            <div className="w-full max-w-xl h-32 flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    {hovered ? (
                        <motion.div
                            key={hovered}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#0c0c0c]/95 border border-viking-gold/30 p-6 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.1)] text-center w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-viking-gold/50 to-transparent" />
                            <div className="font-serif font-bold text-viking-gold text-xl mb-2 uppercase tracking-wide">
                                {t(`tutorial.slide2.${hovered}`)}
                            </div>
                            <div className="text-stone-300 leading-snug">
                                {t(`tutorial.slide2.${hovered}_desc`)}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-stone-500 italic"
                        >
                            <p className="animate-pulse">{t('tutorial.slide2.desc')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Slide3_Favors: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center h-full gap-16 px-12">
            {/* Visual Composition */}
            <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/20 blur-[80px] rounded-full group-hover:bg-amber-500/30 transition-all duration-1000" />

                <div className="relative z-10 flex items-center gap-8">
                    <div className="bg-black/50 p-6 rounded-full border-2 border-viking-gold/30 shadow-2xl backdrop-blur-sm">
                        <div className="scale-110">
                            <Dice3D
                                face={{ type: 'axe', value: 1, hasToken: true }}
                                locked={true}
                                rolling={false}
                                id="tutorial-gold-die"
                            />
                        </div>
                    </div>

                    <Sparkles className="text-viking-gold w-12 h-12 animate-pulse" />

                    <div className="w-48 bg-gradient-to-b from-[#1a1c20] to-black rounded-lg border border-viking-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.2)] p-4 flex flex-col items-center gap-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay" />
                        <div className="w-16 h-16 rounded-full bg-viking-gold/20 flex items-center justify-center border border-viking-gold text-viking-gold mb-2">
                            <Coins size={32} />
                        </div>
                        <div className="text-center">
                            <div className="text-viking-gold font-serif font-bold text-sm tracking-widest">THOR</div>
                            <div className="w-full h-px bg-white/10 my-2" />
                            <div className="text-stone-400 text-xs">Deal 8 Damage</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="max-w-lg space-y-6 text-left">
                <h3 className="text-4xl font-serif font-bold text-viking-gold tracking-wider leading-tight">
                    {t('tutorial.slide3.title')}
                </h3>
                <p className="text-stone-300 text-lg leading-loose">
                    {t('tutorial.slide3.desc').split('**').map((part, i) =>
                        i % 2 === 1
                            ? <span key={i} className="text-viking-gold font-bold bg-viking-gold/10 px-2 py-0.5 rounded border border-viking-gold/20">{part}</span>
                            : part
                    )}
                </p>
            </div>
        </div>
    );
};

const Slide4_Flow: React.FC = () => {
    const { t } = useTranslation();
    const steps = [
        { icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-900/20', border: 'border-indigo-500/30' },
        { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-500/30' },
        { icon: Swords, color: 'text-rose-500', bg: 'bg-rose-900/20', border: 'border-rose-500/30' },
    ];

    return (
        <div className="flex flex-col h-full gap-8 items-center justify-center">
            <div className="text-center">
                <h3 className="text-4xl font-serif font-bold text-viking-gold tracking-[0.2em] mb-2">{t('tutorial.slide4.title')}</h3>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className={`
                            relative overflow-hidden rounded-2xl p-6 
                            ${steps[i].bg} border ${steps[i].border}
                            hover:scale-105 transition-transform duration-300 group
                        `}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                        <div className="flex flex-col gap-4 relative z-10 h-full">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center ${steps[i].color} border border-white/5 shadow-lg`}>
                                    <span className="font-serif font-bold text-xl">{i + 1}</span>
                                </div>
                                {React.createElement(steps[i].icon, { className: `${steps[i].color} opacity-60`, size: 32 })}
                            </div>

                            <div className="flex-1 flex items-center">
                                <p className="text-stone-300 text-sm leading-relaxed font-medium">
                                    {t('tutorial.slide4.desc').split('\n')[i]?.split(': ')[1] || t('tutorial.slide4.desc').split('\n')[i]}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export const TutorialModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const slides = [Slide1_Goal, Slide2_Dice, Slide3_Favors, Slide4_Flow];
    const CurrentSlideComponent = slides[currentSlide];

    const handleNext = () => currentSlide < slides.length - 1 ? setCurrentSlide(p => p + 1) : handleClose();
    const handlePrev = () => currentSlide > 0 && setCurrentSlide(p => p - 1);

    const handleClose = () => {
        if (dontShowAgain) localStorage.setItem('aesir_tutorial_seen', 'true');
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, dontShowAgain]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
        >
            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black pointer-events-none" />

            <div className="w-full max-w-6xl aspect-video bg-[#0a0a0a] relative flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-y border-white/10">

                {/* Decorative Rune Borders */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-viking-gold/50 to-transparent z-20" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-viking-gold/30 to-transparent z-20" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-8 right-8 z-50 text-stone-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                    <X size={32} strokeWidth={1.5} />
                </button>

                {/* Content Area */}
                <div className="flex-1 relative z-10 flex items-center justify-center p-12">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full h-full"
                        >
                            <CurrentSlideComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Cinematic Footer Controls */}
                <div className="h-24 px-12 flex items-center justify-between bg-gradient-to-t from-black to-transparent z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setDontShowAgain(!dontShowAgain)}
                            className="flex items-center gap-3 text-stone-500 hover:text-viking-gold transition-colors cursor-pointer group select-none"
                        >
                            <div className={`w-5 h-5 rounded border border-current flex items-center justify-center transition-all ${dontShowAgain ? 'bg-viking-gold text-black border-viking-gold' : ''}`}>
                                {dontShowAgain && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span className="text-sm font-serif tracking-wide uppercase">{t('tutorial.dont_show')}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Pagination Dots */}
                        <div className="flex gap-2">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-viking-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'w-1.5 bg-stone-700'}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentSlide === 0}
                                className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:border-viking-gold/50 hover:bg-viking-gold/10 transition-all ${currentSlide === 0 ? 'opacity-20 pointer-events-none' : ''}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                onClick={handleNext}
                                className="h-12 px-8 rounded-full bg-viking-gold text-black font-bold font-serif uppercase tracking-widest hover:bg-amber-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
                            >
                                <span>{currentSlide === slides.length - 1 ? t('tutorial.finish') : t('tutorial.next')}</span>
                                {currentSlide === slides.length - 1 ? <Swords size={18} /> : <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
