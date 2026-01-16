import React, { useEffect, useRef } from 'react';

type WeatherType = 'snow' | 'ember' | 'rain' | 'clear';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
}

export const DynamicBackground: React.FC<{ weather?: WeatherType }> = ({ weather = 'snow' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticle = (): Particle => {
            const isSnow = weather === 'snow';
            const isRain = weather === 'rain';
            // isEmber is implicit else

            // Rain falls fast, Snow slow, Embers float up
            let vx = 0;
            let vy = 0;
            let y = 0;

            if (isSnow) {
                vx = (Math.random() - 0.5) * 1;
                vy = Math.random() * 2 + 1;
                y = -10;
            } else if (isRain) {
                vx = (Math.random() - 0.5) * 0.5;
                vy = Math.random() * 15 + 10; // Rain is fast
                y = -20;
            } else { // Ember
                vx = (Math.random() - 0.5) * 0.5;
                vy = -(Math.random() * 1 + 0.5); // Embers float up
                y = canvas.height + 10;
            }

            return {
                x: Math.random() * canvas.width,
                y,
                vx,
                vy,
                size: isRain ? Math.random() * 20 + 10 : Math.random() * 2 + (isSnow ? 1 : 0.5), // Rain is long streak
                opacity: Math.random() * 0.5 + 0.1
            };
        };

        const initParticles = () => {
            if (weather === 'clear') {
                particles = [];
                return;
            }
            particles = Array.from({ length: weather === 'rain' ? 200 : 100 }, createParticle);
            particles.forEach(p => {
                p.y = Math.random() * canvas.height;
            });
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (weather === 'clear') return;

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around logic
                if (weather === 'ember') {
                    if (p.y < -10) particles[i] = createParticle();
                } else {
                    if (p.y > canvas.height) particles[i] = createParticle();
                }

                ctx.beginPath();
                if (weather === 'rain') {
                    // Rain streaks
                    ctx.strokeStyle = `rgba(173, 216, 230, ${p.opacity * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx, p.y + p.vy * 0.5); // Streak length
                    ctx.stroke();
                } else {
                    // Snow & Embers (Circles)
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = weather === 'snow'
                        ? `rgba(255, 255, 255, ${p.opacity})`
                        : `rgba(255, 140, 0, ${p.opacity})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        initParticles();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [weather]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0 opacity-60"
        />
    );
};
