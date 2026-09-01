'use client';

import { useRef, useState } from 'react';
import { PortfolioTerminal } from '@/components/portfolio-terminal';

const WALLPAPERS = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5'];
const ACCENTS: Record<string, string> = {
  bg1: '#e07ab5',
  bg2: '#6fa8ff',
  bg3: '#b06bff',
  bg4: '#2fd4c0',
  bg5: '#ff6b9d',
};

export default function Home() {
  const [wallpaper, setWallpaper] = useState('bg1');
  const [wpOpen, setWpOpen] = useState(false);
  const wpRef = useRef<HTMLDivElement>(null);

  return (
    <main className="desktop" style={{ backgroundImage: `url("/${wallpaper}.jpg")`, ['--accent' as string]: ACCENTS[wallpaper] }}>
      <div className="wallpaper-grain" aria-hidden="true" />
      <PortfolioTerminal />

      <div className="desktop-icons">
        <button type="button" className="desktop-icon" onClick={() => window.dispatchEvent(new CustomEvent('terminal:open', { detail: 'terminal' }))}>
          <span className="desktop-icon-img">&gt;_</span>
          <span className="desktop-icon-label">Terminal</span>
        </button>
        <button type="button" className="desktop-icon" onClick={() => window.dispatchEvent(new CustomEvent('terminal:open', { detail: 'contact' }))}>
          <span className="desktop-icon-img">✉</span>
          <span className="desktop-icon-label">Hire Me</span>
        </button>
      </div>

      <div className="wp-picker-wrap" ref={wpRef}>
        <button type="button" className="wp-toggle" onClick={() => setWpOpen((o) => !o)} aria-label="Change wallpaper">
          <span className="wp-toggle-icon">◆</span>
        </button>
        {wpOpen && (
          <div className="wp-panel">
            <p className="wp-label">Wallpaper</p>
            <div className="wp-grid">
              {WALLPAPERS.map((w) => (
                <button key={w} type="button" className={`wp-thumb${wallpaper === w ? ' active' : ''}`} onClick={() => { setWallpaper(w); setWpOpen(false); }}>
                  <img src={`/${w}.jpg`} alt={w} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
