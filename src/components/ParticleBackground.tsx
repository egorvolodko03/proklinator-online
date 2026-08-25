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

    const darkColors = ['#ff4d28', '#f59e0b', '#8b5cf6', '#dc2626', '#fbbf24'];
    const lightColors = ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#e2e8f0'];

    const activeColors = realm === 'dark' ? darkColors : lightColors;

    const particleCount = 55;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: realm === 'dark' ? -(Math.random() * 0.4 + 0.12) : Math.random() * 0.35 + 0.1,
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.55 + 0.2,
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = realm === 'dark' ? 'rgba(255, 77, 40, 0.08)' : 'rgba(251, 191, 36, 0.1)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particle glowing dots
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap boundaries
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
        ctx.shadowBlur = 10;
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
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70 transition-opacity duration-700"
    />
  );
};
