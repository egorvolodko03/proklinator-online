'use client';

import React, { useEffect, useRef } from 'react';
import { KarmaRealm } from '@/types';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  realm?: KarmaRealm;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ realm = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes based on realm
    const darkColors = ['#ff4d28', '#8b5cf6', '#fbbf24', '#f43f5e', '#a78bfa'];
    const lightColors = ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#ffffff'];

    const activeColors = realm === 'dark' ? darkColors : lightColors;

    // Create particles
    const particleCount = 45;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.8,
        speedY: realm === 'dark' ? -(Math.random() * 0.45 + 0.15) : (Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        } else if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [realm]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 transition-opacity duration-700"
    />
  );
};
