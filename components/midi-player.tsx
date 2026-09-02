'use client';

import { useEffect, useRef, useState } from 'react';

type Track = { name: string; genre: string; tempo: number; notes: [number, number][] };

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NAME = (n: number) => `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;

const TRACKS: Track[] = [
  {
    name: 'Ode to Joy',
    genre: 'Classical',
    tempo: 110,
    notes: [
      [76, 1], [76, 1], [77, 1], [79, 1], [79, 1], [77, 1], [76, 1], [74, 1],
      [72, 1], [72, 1], [74, 1], [76, 1], [76, 2], [74, 1], [74, 1],
      [76, 1], [76, 1], [77, 1], [79, 1], [79, 1], [77, 1], [76, 1], [74, 1],
      [72, 1], [72, 1], [74, 1], [76, 1], [74, 2], [72, 1], [72, 1],
    ],
  },
  {
    name: 'Twinkle Twinkle',
    genre: 'Nursery',
    tempo: 100,
    notes: [
      [72, 1], [72, 1], [79, 1], [79, 1], [81, 1], [81, 1], [79, 2],
      [77, 1], [77, 1], [76, 1], [76, 1], [74, 1], [74, 1], [72, 2],
      [79, 1], [79, 1], [77, 1], [77, 1], [76, 1], [76, 1], [74, 1],
      [79, 1], [79, 1], [77, 1], [77, 1], [76, 1], [76, 1], [74, 1],
      [72, 1], [72, 1], [79, 1], [79, 1], [81, 1], [81, 1], [79, 2],
      [77, 1], [77, 1], [76, 1], [76, 1], [74, 1], [74, 1], [72, 2],
    ],
  },
  {
    name: 'Für Elise',
    genre: 'Classical',
    tempo: 140,
    notes: [
      [76, 1], [63, 1], [76, 1], [63, 1], [76, 1], [71, 1], [74, 1], [72, 1], [69, 2],
      [60, 1], [64, 1], [69, 1], [71, 2], [64, 1], [68, 1], [71, 1], [72, 2],
      [76, 1], [63, 1], [76, 1], [63, 1], [76, 1], [71, 1], [74, 1], [72, 1], [69, 2],
      [60, 1], [64, 1], [69, 1], [71, 2], [64, 1], [72, 1], [71, 1], [69, 2],
    ],
  },
  {
    name: 'Tetris Theme',
    genre: 'Chiptune',
    tempo: 150,
    notes: [
      [76, 1], [71, 1], [72, 1], [74, 1], [72, 1], [71, 1], [69, 1], [69, 1],
      [72, 1], [76, 1], [69, 1], [74, 2], [72, 1], [71, 1],
      [64, 1], [71, 1], [72, 1], [74, 1], [72, 1], [71, 1], [69, 1], [69, 1],
      [72, 1], [76, 1], [69, 1], [74, 2], [72, 1], [71, 1],
    ],
  },
];

function noteFreq(n: number) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

export function MidiPlayer() {
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState(-1);
  const [duration, setDuration] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const rafRef = useRef<number | null>(null);
  const wallRef = useRef(0);
  const durRef = useRef(0);
  const currentRef = useRef(0);
  const track = TRACKS[trackIdx];

  function ensureCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  function clearScheduled() {
    for (const o of oscsRef.current) {
      try { o.stop(); } catch { /* already stopped */ }
      o.disconnect();
    }
    oscsRef.current = [];
  }

  function schedule(t: Track) {
    const ctx = ensureCtx();
    clearScheduled();
    setNote(-1);
    const beats = t.notes.reduce((sum, [, d]) => sum + d, 0);
    const totalSec = (beats / t.tempo) * 60;
    const dest = ctx.destination;
    let acc = 0.08;
    for (const [n, d] of t.notes) {
      const sec = (d / t.tempo) * 60;
      const start = ctx.currentTime + acc;
      const stop = start + sec * 1.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = noteFreq(n);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.015);
      gain.gain.setValueAtTime(0.15, start + Math.max(0.02, sec * 0.5));
      gain.gain.exponentialRampToValueAtTime(0.001, stop);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(stop);
      oscsRef.current.push(osc);
      acc += sec;
    }
    durRef.current = totalSec + 0.2;
    setDuration(Math.round(totalSec + 0.2));
    wallRef.current = performance.now();
  }

  function onTrackSelect(i: number) {
    if (playing) return;
    setTrackIdx(i);
    setProgress(0);
    setNote(-1);
  }

  function play() {
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') void ctx.resume();
    schedule(track);
    setPlaying(true);
    currentRef.current = 0;
    wallRef.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const elapsed = performance.now() - wallRef.current;
      const p = Math.min(1, elapsed / (durRef.current * 1000) || 0);
      setProgress(p);
      let acc = 0;
      for (let i = 0; i < track.notes.length; i++) {
        acc += track.notes[i][1] / track.tempo;
        if (acc * 60 > elapsed / 1000 * 60) { if (i !== note) setNote(i); break; }
      }
      if (p >= 1) {
        setPlaying(false);
        setNote(-1);
        clearScheduled();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  function stop() {
    clearScheduled();
    setPlaying(false);
    setProgress(0);
    setNote(-1);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  useEffect(() => {
    const oscs = oscsRef;
    const raf = rafRef;
    return () => {
      for (const o of oscs.current) { try { o.stop(); } catch { /* noop */ } o.disconnect(); }
      oscs.current = [];
      if (raf.current) cancelAnimationFrame(raf.current);
      if (ctxRef.current) void ctxRef.current.close();
      ctxRef.current = null;
    };
  }, []);

  return (
    <div className="midi">
      <div className="midi-track-list">
        {TRACKS.map((t, i) => (
          <button key={t.name} type="button" className={`midi-track${i === trackIdx ? ' active' : ''}`} onClick={() => onTrackSelect(i)} title={t.genre}>
            {t.name}
          </button>
        ))}
      </div>
      <div className="midi-display">
        <div className="midi-now">{note >= 0 ? NAME(track.notes[note][0]) : '—'}</div>
        <div className="midi-pos">
          <span className="midi-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="midi-time">{Math.floor(progress * duration)}s</div>
      </div>
      <div className="midi-controls">
        <button type="button" className="midi-btn" onClick={playing ? stop : play}>
          {playing ? '❚❚ Stop' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}