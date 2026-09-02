'use client';

import { useEffect, useState } from 'react';

type PanelWindow = { id: number; title: string; minimized: boolean };

const LAUNCHER_ITEMS = [
  { label: 'Terminal', cmd: 'terminal', icon: '>_' },
  { label: 'About', cmd: 'about', icon: '👤' },
  { label: 'Skills', cmd: 'skills', icon: '⚡' },
  { label: 'Work', cmd: 'work', icon: '💼' },
  { label: 'Contact', cmd: 'contact', icon: '✉' },
  { label: 'GitHub', cmd: 'github', icon: '🐙' },
  { label: 'Sudoku', cmd: 'sudoku', icon: '▦' },
  { label: 'MIDI Player', cmd: 'midi', icon: '♪' },
];

export function KdePanel() {
  const [time, setTime] = useState('');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [windows, setWindows] = useState<PanelWindow[]>([]);

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function sync(e: Event) {
      setWindows((e as CustomEvent<PanelWindow[]>).detail ?? []);
    }
    function toggleMin(e: Event) {
      const id = (e as CustomEvent<number>).detail;
      setWindows((items) => items.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
    }
    window.addEventListener('desktop:windows', sync);
    window.addEventListener('terminal:toggle-min', toggleMin);
    return () => {
      window.removeEventListener('desktop:windows', sync);
      window.removeEventListener('terminal:toggle-min', toggleMin);
    };
  }, []);

  useEffect(() => {
    if (!launcherOpen) return;
    function close(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest('.kde-launcher-wrap')) setLauncherOpen(false);
    }
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [launcherOpen]);

  function launch(cmd: string) {
    setLauncherOpen(false);
    window.dispatchEvent(new CustomEvent('terminal:open', { detail: cmd }));
  }

  return (
    <nav className="kde-panel">
      <div className="kde-panel-section">
        <div className="kde-launcher-wrap">
          <button type="button" className="kde-launcher-btn" onClick={() => setLauncherOpen((o) => !o)} aria-label="Application launcher" aria-expanded={launcherOpen}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="5" r="3" />
              <circle cx="12" cy="5" r="3" />
              <circle cx="19" cy="5" r="3" />
              <circle cx="5" cy="12" r="3" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="12" r="3" />
              <circle cx="5" cy="19" r="3" />
              <circle cx="12" cy="19" r="3" />
              <circle cx="19" cy="19" r="3" />
            </svg>
          </button>
          {launcherOpen && (
            <div className="kde-launcher-menu">
              <div className="kde-launcher-header">Nook Desktop</div>
              {LAUNCHER_ITEMS.map((item) => (
                <button key={item.cmd} type="button" className="kde-launcher-item" onClick={() => launch(item.cmd)}>
                  <span className="kde-launcher-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="kde-panel-section kde-panel-center">
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`kde-task-btn${w.minimized ? '' : ' active'}`}
            onClick={() => window.dispatchEvent(new CustomEvent('terminal:toggle-min', { detail: w.id }))}
            title={w.title}
          >
            <span className="kde-task-label">{w.title}</span>
          </button>
        ))}
      </div>

      <div className="kde-panel-section kde-panel-right">
        <div className="kde-tray">
          <span className="kde-tray-dot" title="Online">●</span>
          <span className="kde-clock">{time}</span>
        </div>
      </div>
    </nav>
  );
}