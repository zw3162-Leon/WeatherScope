'use client';

import { useMemo } from 'react';

type Theme = 'clear-day' | 'clear-night' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'storm' | 'snowy' | 'misty' | 'default';

export function getWeatherTheme(icon?: string | null): Theme {
  if (!icon) return 'default';
  const code = icon.slice(0, 2);
  const night = icon.endsWith('n');
  if (code === '01') return night ? 'clear-night' : 'clear-day';
  if (code === '02' || code === '03') return 'partly-cloudy';
  if (code === '04') return 'cloudy';
  if (code === '09' || code === '10') return 'rainy';
  if (code === '11') return 'storm';
  if (code === '13') return 'snowy';
  if (code === '50') return 'misty';
  return 'default';
}

// Deterministic pseudo-random — avoids hydration mismatch
function sr(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const BG: Record<Theme, string> = {
  'clear-day':    'linear-gradient(180deg,#0ea5e9 0%,#38bdf8 40%,#bae6fd 75%,#fef9c3 100%)',
  'clear-night':  'linear-gradient(180deg,#020617 0%,#0f172a 55%,#1e1b4b 100%)',
  'partly-cloudy':'linear-gradient(180deg,#38bdf8 0%,#7dd3fc 50%,#e2e8f0 100%)',
  'cloudy':       'linear-gradient(180deg,#64748b 0%,#94a3b8 55%,#cbd5e1 100%)',
  'rainy':        'linear-gradient(180deg,#1e293b 0%,#334155 60%,#475569 100%)',
  'storm':        'linear-gradient(180deg,#09090b 0%,#1e1b4b 50%,#1e293b 100%)',
  'snowy':        'linear-gradient(180deg,#dbeafe 0%,#eff6ff 55%,#f0f9ff 100%)',
  'misty':        'linear-gradient(180deg,#94a3b8 0%,#cbd5e1 55%,#e2e8f0 100%)',
  'default':      'linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)',
};

// ── Particle effects ──────────────────────────────────────────

function SunEffect() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '7%', right: '14%',
        width: 110, height: 110, borderRadius: '50%',
        background: 'radial-gradient(circle,#fbbf24 0%,#f59e0b 45%,transparent 72%)',
        boxShadow: '0 0 70px 25px rgba(251,191,36,0.45)',
        animation: 'sun-pulse 3.5s ease-in-out infinite',
      }} />
      {/* Rotating rays */}
      <div style={{
        position: 'absolute', top: 'calc(7% - 35px)', right: 'calc(14% - 35px)',
        width: 180, height: 180,
        animation: 'sun-rotate 14s linear infinite',
        opacity: 0.55,
      }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 75, height: 2.5, marginTop: -1.25,
            background: 'linear-gradient(to right,#fbbf24,transparent)',
            transformOrigin: 'left center',
            transform: `rotate(${i * 45}deg)`,
          }} />
        ))}
      </div>
    </div>
  );
}

function StarEffect() {
  const stars = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      left: `${sr(i) * 100}%`,
      top: `${sr(i + 100) * 78}%`,
      size: 1 + sr(i + 200) * 2.5,
      dur: 1.5 + sr(i + 300) * 3,
      delay: sr(i + 400) * 5,
    }))
  , []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'white',
          animation: `star-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
      {/* Moon */}
      <div style={{
        position: 'absolute', top: '9%', right: '17%',
        width: 58, height: 58, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%,#f1f5f9,#e2e8f0)',
        boxShadow: '0 0 25px rgba(241,245,249,0.5)',
        animation: 'sun-pulse 5s ease-in-out infinite',
      }} />
    </div>
  );
}

function CloudEffect({ count = 3 }: { count?: number }) {
  const clouds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      top: `${8 + i * 18}%`,
      left: `${sr(i) * 60}%`,
      width: 100 + sr(i + 10) * 120,
      height: 40 + sr(i + 20) * 30,
      opacity: 0.25 + sr(i + 30) * 0.2,
      dur: 12 + i * 4,
    }))
  , [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {clouds.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.top, left: c.left,
          width: c.width, height: c.height,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 60,
          filter: 'blur(12px)',
          opacity: c.opacity,
          animation: `cloud-drift ${c.dur}s ${i * 2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function RainEffect({ count = 50 }: { count?: number }) {
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: `${sr(i) * 100}%`,
      height: 12 + sr(i + 50) * 16,
      dur: 0.45 + sr(i + 100) * 0.45,
      delay: sr(i + 150) * 2.5,
      opacity: 0.35 + sr(i + 200) * 0.35,
    }))
  , [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {drops.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, top: -30,
          width: 1.5, height: d.height,
          background: 'rgba(147,197,253,0.65)',
          borderRadius: 2,
          opacity: d.opacity,
          animation: `rain-fall ${d.dur}s ${d.delay}s linear infinite`,
        }} />
      ))}
    </div>
  );
}

function StormEffect() {
  return (
    <>
      <RainEffect count={80} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(199,210,254,0.3)',
        animation: 'lightning-flash 7s 1.2s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(199,210,254,0.25)',
        animation: 'lightning-flash 9s 4.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
    </>
  );
}

function SnowEffect() {
  const flakes = useMemo(() =>
    Array.from({ length: 45 }, (_, i) => ({
      left: `${sr(i) * 100}%`,
      size: 3 + sr(i + 50) * 7,
      dur: 4 + sr(i + 100) * 6,
      delay: sr(i + 150) * 5,
      opacity: 0.55 + sr(i + 200) * 0.4,
    }))
  , []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {flakes.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', left: f.left, top: -20,
          width: f.size, height: f.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          boxShadow: '0 0 5px rgba(255,255,255,0.6)',
          opacity: f.opacity,
          animation: `snow-sway ${f.dur}s ${f.delay}s linear infinite`,
        }} />
      ))}
    </div>
  );
}

function MistEffect() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: '-10%', right: '-10%',
          top: `${18 + i * 26}%`, height: '28%',
          background: 'rgba(255,255,255,0.28)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: `mist-float ${7 + i * 2.5}s ${i * 2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

interface Props { icon?: string | null }

export default function WeatherBackground({ icon }: Props) {
  const theme = getWeatherTheme(icon);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1,
      background: BG[theme],
      transition: 'background 1.5s ease',
    }}>
      {theme === 'clear-day'    && <SunEffect />}
      {theme === 'clear-night'  && <StarEffect />}
      {theme === 'partly-cloudy'&& <CloudEffect count={3} />}
      {theme === 'cloudy'       && <CloudEffect count={5} />}
      {theme === 'rainy'        && <RainEffect />}
      {theme === 'storm'        && <StormEffect />}
      {theme === 'snowy'        && <SnowEffect />}
      {theme === 'misty'        && <MistEffect />}
    </div>
  );
}
