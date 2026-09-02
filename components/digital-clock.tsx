'use client';

import { useEffect, useState } from 'react';

const SEGMENTS: string[][] = [
  ['a', 'b', 'c', 'd', 'e', 'f'],
  ['b', 'c'],
  ['a', 'b', 'g', 'e', 'd'],
  ['a', 'b', 'g', 'c', 'd'],
  ['f', 'g', 'b', 'c'],
  ['a', 'f', 'g', 'c', 'd'],
  ['a', 'f', 'g', 'e', 'c', 'd'],
  ['a', 'b', 'c'],
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  ['a', 'b', 'c', 'd', 'f', 'g'],
];

function SegmentDigit({ value }: { value: number }) {
  const on = SEGMENTS[value];
  return (
    <svg viewBox="0 0 36 60" className="clock-seg" aria-hidden="true">
      <path className={`seg${on.includes('a') ? ' on' : ''}`} d="M5 4 L31 4 L26 11 L10 11 Z" />
      <path className={`seg${on.includes('b') ? ' on' : ''}`} d="M32 12 L27 12 L27 28 L32 28 Z" />
      <path className={`seg${on.includes('c') ? ' on' : ''}`} d="M32 33 L27 33 L27 49 L32 49 Z" />
      <path className={`seg${on.includes('d') ? ' on' : ''}`} d="M5 56 L31 56 L26 63 L10 63 Z" />
      <path className={`seg${on.includes('e') ? ' on' : ''}`} d="M4 33 L9 33 L9 49 L4 49 Z" />
      <path className={`seg${on.includes('f') ? ' on' : ''}`} d="M4 12 L9 12 L9 28 L4 28 Z" />
      <path className={`seg${on.includes('g') ? ' on' : ''}`} d="M6 29 L30 29 L26 34 L10 34 Z" />
    </svg>
  );
}

function Colon() {
  return (
    <svg viewBox="0 0 10 60" className="clock-colon" aria-hidden="true">
      <circle className="seg dot" cx="5" cy="18" r="4" />
      <circle className="seg dot" cx="5" cy="48" r="4" />
    </svg>
  );
}

export function DigitalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 500);
    return () => clearInterval(id);
  }, []);

  const h24 = now.getHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const hh = String(h12).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <aside className="clock-widget" aria-label="Digital clock">
      <div className="clock-date">{dateStr}</div>
      <div className="clock-display">
        <SegmentDigit value={Number(hh[0])} />
        <SegmentDigit value={Number(hh[1])} />
        <span className={now.getSeconds() % 2 === 0 ? 'clock-colon-box blink' : 'clock-colon-box'}><Colon /></span>
        <SegmentDigit value={Number(mm[0])} />
        <SegmentDigit value={Number(mm[1])} />
      </div>
      <div className="clock-foot">
        <span className="clock-seconds">{ss}</span>
        <span className="clock-ampm">{ampm}</span>
      </div>
    </aside>
  );
}