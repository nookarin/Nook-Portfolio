'use client';

import { KeyboardEvent, MouseEvent, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { GithubPanel } from './github-panel';
import { SudokuGame } from './sudoku-game';
import { MidiPlayer } from './midi-player';
type Line = { command?: string; output: string; tone?: 'accent' | 'error' | 'muted'; github?: boolean; detail?: string };
type CliWindow = { id: number; x: number; y: number; command?: string; lines: Line[]; input?: string; sudoku?: boolean; midi?: boolean; minimized?: boolean; resized?: boolean };
const COMMANDS = ['about', 'skills', 'work', 'contact', 'status', 'github', 'date', 'clear'];
const responses: Record<string, string> = {
  about: 'Early-career full-stack developer building clear, resilient digital products from Thailand — experienced in operations, data management, and market research.',
  skills: 'JavaScript  React  Node.js  Express  PostgreSQL  SQL  MongoDB  Git',
  work: '01 VinylVault  /  02 SteamRec  /  03 Uma Clicker',
  contact: 'arin.nky@outlook.com  ·  061-491-7664  ·  Pathum Thani, Thailand\nlinkedin.com/in/arinchai-charoenrak-08370941a  ·  github.com/nookarin',
  status: '● open to new opportunities',
};
const details: Record<string, string> = {
  about: 'EDUCATION\n· Thammasat University (BEC Program) — Bachelor of Liberal Arts (2019–2023)\n· Harrisburg High School, Arkansas, US — Exchange Student (2017–2018)\n\nPROFESSIONAL DEVELOPMENT\n· Generation — Junior Software Developer Program (2026)\n  MERN-stack training: React, Node.js, Express, PostgreSQL, SQL, MongoDB, Git.',
  skills: 'ADMINISTRATIVE & OPERATIONS\nAdministrative Support · Data Management · Spreadsheet Management · Document & Record Management · Business Operations · Team Coordination\n\nCUSTOMER & COMMUNICATION\nCustomer Service · Customer Support · Professional Communication · Inquiry Handling · Cross-Team Collaboration · Issue Escalation\n\nANALYSIS & COMPLIANCE\nContent Review & Moderation · Trend & Pattern Identification · Case Investigation · Policy Compliance · Data Privacy & Confidentiality · Attention to Detail\n\nTECHNICAL\nJavaScript · React.js · Node.js · Express.js · HTML5 · CSS3 · PostgreSQL · SQL · MongoDB · Git · GitHub · APIs · npm',
  work: 'PROFESSIONAL EXPERIENCE\n· TDCX — Support Specialist (2025–2026)\n  Reviewed reported content, handled inquiries, investigated trends, escalated complex cases, and applied strict privacy & security standards.\n\n· Touch Innovative Research and Technology — Administrator (2024)\n  Managed documentation, coordination, customer data in spreadsheets, and marketing research.\n\n· Smartwise — Assistant Hotel Manager (2023)\n  Coordinated with the team and attended business meetings.\n\n· Thai-Star Food and Beverage — Intern (2022)\n  Coordinated with the team to finish workplace tasks.\n\nPROJECTS\n· VinylVault — Discogs-inspired music database & marketplace\n· SteamRec — Steam Web API app for library + recommendations\n· Uma Clicker — idle/clicker game',
};
const detailFor = (command: string) => details[command];
const dateNow = () => new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
const outputFor = (command: string) => (command === 'date' ? dateNow() : responses[command]);
const toneFor = (command: string) => (command === 'status' ? 'accent' : undefined);
const KNOWN = new Set(['date', 'github', ...Object.keys(responses)]);

function ShowMore({ detail }: { detail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="showmore">
      <button type="button" className="showmore-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? 'show less ▾' : 'show more ▸'}
      </button>
      {open && <pre className="showmore-body">{detail}</pre>}
    </div>
  );
}

function WindowControls({ onMinimize, onMaximize, onClose }: { onMinimize: () => void; onMaximize: () => void; onClose: () => void }) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  return (
    <div className="kde-controls">
      <button type="button" className="kde-btn kde-btn-min" aria-label="Minimize" onMouseDown={stop} onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" /></svg>
      </button>
      <button type="button" className="kde-btn kde-btn-max" aria-label="Maximize" onMouseDown={stop} onClick={(e) => { e.stopPropagation(); onMaximize(); }}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" /></svg>
      </button>
      <button type="button" className="kde-btn kde-btn-close" aria-label="Close" onMouseDown={stop} onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
      </button>
    </div>
  );
}

let nextId = 1;

export function PortfolioTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<Line[]>([]);
  const [windows, setWindows] = useState<CliWindow[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showPic, setShowPic] = useState(false);
  const [resized, setResized] = useState(false);
  const [mainMinimized, setMainMinimized] = useState(false);
  const mainDragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  useEffect(() => { outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }); }, [lines]);
  useEffect(() => {
    const handler = (e: Event) => {
      const cmd = (e as CustomEvent).detail;
      if (cmd) {
        openWindow(cmd, cmd);
      }
    };
    window.addEventListener('terminal:open', handler);
    return () => window.removeEventListener('terminal:open', handler);
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('desktop:windows', {
      detail: [
        { id: 0, title: 'Terminal — zsh', minimized: mainMinimized },
        ...windows.map((w) => ({ id: w.id, title: w.command ? `nook@portfolio — ${w.command}` : 'nook@portfolio', minimized: !!w.minimized })),
      ],
    }));
  }, [windows, mainMinimized]);
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id === 0) setMainMinimized((m) => !m);
      else setWindows((items) => items.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
    };
    window.addEventListener('terminal:toggle-min', handler);
    return () => window.removeEventListener('terminal:toggle-min', handler);
  }, []);

  function mainDragStart(e: MouseEvent) {
    e.preventDefault();
    mainDragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
    window.addEventListener('mousemove', mainDragMove);
    window.addEventListener('mouseup', mainDragEnd);
  }
  function mainDragMove(e: globalThis.MouseEvent) {
    if (!mainDragRef.current) return;
    const dx = e.clientX - mainDragRef.current.startX;
    const dy = e.clientY - mainDragRef.current.startY;
    setOffset({ x: mainDragRef.current.baseX + dx, y: mainDragRef.current.baseY + dy });
  }
  function mainDragEnd() {
    mainDragRef.current = null;
    window.removeEventListener('mousemove', mainDragMove);
    window.removeEventListener('mouseup', mainDragEnd);
  }

  function openWindow(command: string, raw?: string) {
    const d = detailFor(command);
    const lines: Line[] = command === 'github'
      ? [{ command: raw ?? command, output: '', github: true }]
      : command === 'terminal' || command === 'sudoku' || command === 'midi'
        ? []
        : [{ command: raw ?? command, output: outputFor(command), tone: toneFor(command), detail: d }];
    const id = nextId++;
    const w = command === 'sudoku' || command === 'midi' ? Math.min(380, window.innerWidth - 40) : Math.min(460, window.innerWidth - 40);
    setWindows((items) => [...items, {
      id,
      x: Math.min(Math.max(30, window.innerWidth / 2 - w / 2 + (items.length % 4) * 26), window.innerWidth - w - 20),
      y: 70 + (items.length % 4) * 34,
      command,
      lines,
      input: command === 'terminal' ? '' : undefined,
      sudoku: command === 'sudoku',
      midi: command === 'midi',
    }]);
  }
  function closeWindow(id: number) { setWindows((items) => items.filter((w) => w.id !== id)); }
  function dragWindowStart(e: MouseEvent, id: number, x: number, y: number) {
    e.preventDefault();
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, baseX: x, baseY: y };
    window.addEventListener('mousemove', dragWindowMove);
    window.addEventListener('mouseup', dragWindowEnd);
  }
  function dragWindowMove(e: globalThis.MouseEvent) {
    if (!dragRef.current) return;
    const { id, startX, startY, baseX, baseY } = dragRef.current;
    const x = baseX + (e.clientX - startX);
    const y = baseY + (e.clientY - startY);
    setWindows((items) => items.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }
  function dragWindowEnd() {
    dragRef.current = null;
    window.removeEventListener('mousemove', dragWindowMove);
    window.removeEventListener('mouseup', dragWindowEnd);
  }

  function run(raw: string) {
    const command = raw.trim().toLowerCase().replace(/^\//, '');
    if (!command) return;
    setInput('');
    setHistory((items) => (items[items.length - 1] === command ? items : [...items, command]));
    setHistoryIndex(-1);
    if (command === 'clear') { setLines([]); return; }
    if (!KNOWN.has(command)) {
      setLines((items) => [...items, { command, output: `zsh: command not found: ${command}`, tone: 'error' }]);
      return;
    }
    if (command === 'github') {
      setLines((items) => [...items, { command, output: '', github: true }]);
      return;
    }
    setLines((items) => [...items, { command, output: outputFor(command), tone: toneFor(command), detail: detailFor(command) }]);
  }
  function runInWindow(id: number, raw: string) {
    const command = raw.trim().toLowerCase().replace(/^\//, '');
    setWindows((items) => items.map((w) => {
      if (w.id !== id) return { ...w, input: '' };
      if (!command) return w;
      if (command === 'clear') return { ...w, lines: [], input: '' };
      const newLine: Line = KNOWN.has(command)
        ? command === 'github'
          ? { command, output: '', github: true }
          : { command, output: outputFor(command), tone: toneFor(command), detail: detailFor(command) }
        : { command, output: `zsh: command not found: ${command}`, tone: 'error' };
      return { ...w, lines: [...w.lines, newLine], input: '' };
    }));
  }
  function submit(event: SyntheticEvent<HTMLFormElement>) { event.preventDefault(); run(input); }
  function browseHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'ArrowUp' ? Math.min(history.length - 1, historyIndex + 1) : Math.max(-1, historyIndex - 1);
    setHistoryIndex(next);
    setInput(next < 0 ? '' : history[history.length - 1 - next]);
  }

  return <>
    <section className={`terminal-window${resized ? ' resized' : ''}${mainMinimized ? ' minimized' : ''}`} aria-label="Interactive portfolio terminal" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      <header className="terminal-titlebar" onMouseDown={mainDragStart}>
        <span className="terminal-title-left" aria-hidden="true" />
        <span className="terminal-title-text">nook@portfolio — zsh</span>
        <WindowControls onMinimize={() => setMainMinimized(true)} onMaximize={() => setResized((r) => !r)} onClose={() => setMainMinimized(true)} />
      </header>
      <div className="terminal-output" ref={outputRef} onClick={() => inputRef.current?.focus()}>
        <div className="intro-pic-bar">
          <button type="button" className="pic-toggle" onClick={() => setShowPic((s) => !s)} aria-expanded={showPic}>{showPic ? 'Hide photo' : 'Show photo'}</button>
        </div>
        <div className={`intro${showPic ? ' with-pic' : ''}`}>
          {showPic && <div className="intro-pic"><img src="/photo.jpg" alt="Arinchai Charoenrak" /></div>}
          <div className="intro-info">
            <h1>Arinchai Charoenrak</h1>
            <p className="intro-title">Full-Stack Developer</p>
            <ul>
              <li><span>location</span> Pathum Thani, Thailand</li>
              <li><span>stack</span> React · Node.js · Express · PostgreSQL</li>
              <li><span>email</span> arin.nky@outlook.com</li>
              <li><span>phone</span> 061-491-7664</li>
            </ul>
            <div className="connect-row">
              <button type="button" className="connect-btn" onClick={() => window.open('https://github.com/nookarin', '_blank', 'noopener')}>GitHub ›</button>
              <button type="button" className="connect-btn" onClick={() => window.open('https://www.linkedin.com/in/arinchai-charoenrak-08370941a', '_blank', 'noopener')}>LinkedIn ›</button>
            </div>
          </div>
        </div>
        <p className="response muted">Available commands — click to open:</p>
        <div className="command-grid">
          {COMMANDS.filter((c) => c !== 'clear').map((c) =>
            <button key={c} type="button" className="command-chip" onClick={() => openWindow(c, c)}>{c}</button>)}
        </div>
        {lines.map((line, index) => <div className="terminal-line" key={`${line.command}-${index}`}>
          {line.command && <p><span className="prompt">nook@dev</span><span className="path">:~$</span> {line.command}</p>}
          {line.github
            ? <GithubPanel />
            : <div>{line.output && <p className={line.tone ? `response ${line.tone}` : 'response'}>{line.output}</p>}{line.detail && <ShowMore detail={line.detail} />}</div>}
        </div>)}
        <form onSubmit={submit} className="command-line">
          <label htmlFor="command"><span className="prompt">nook@dev</span><span className="path">:~$</span></label>
          <span className="cmd-host">
            <span className="cmd-text">{input}</span><span className="block-cursor" aria-hidden="true" />
            <input id="command" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={browseHistory} autoFocus autoComplete="off" spellCheck={false} aria-label="Enter a terminal command" />
          </span>
        </form>
      </div>
      <footer className="terminal-statusbar"><span>● ONLINE</span><span>UTF-8</span></footer>
    </section>
    {windows.map((w) => <div key={w.id} className={`cli-window${w.minimized ? ' minimized' : ''}`} style={{ width: w.sudoku || w.midi ? (w.resized ? 'min(760px,94vw)' : 'min(380px, calc(100vw - 40px))') : (w.resized ? 'min(860px,94vw)' : 'min(460px, calc(100vw - 40px))'), height: w.resized ? 'min(680px,88vh)' : undefined, left: w.x, top: w.y }}>
      <header className="cli-titlebar" onMouseDown={(e) => dragWindowStart(e, w.id, w.x, w.y)}>
        <span className="cli-title">{w.command ? `nook@portfolio: ~ — ${w.command}` : 'nook@portfolio: ~'}</span>
        <WindowControls
          onMinimize={() => setWindows((items) => items.map((x) => (x.id === w.id ? { ...x, minimized: !x.minimized } : x)))}
          onMaximize={() => setWindows((items) => items.map((x) => (x.id === w.id ? { ...x, resized: !x.resized } : x)))}
          onClose={() => closeWindow(w.id)}
        />
      </header>
      <div className="cli-body">
        {w.sudoku
          ? <SudokuGame />
          : w.midi
            ? <MidiPlayer />
            : w.lines.length === 0 && w.command !== 'terminal'
            ? <p className="response muted">cleared</p>
            : <>{w.lines.map((line, i) => <div className="cli-line" key={i}>
              <p><span className="prompt">nook@dev</span><span className="path">:~$</span> {line.command}</p>
              {line.github
                ? <GithubPanel />
                : <div>{line.output && <p className={line.tone ? `response ${line.tone}` : 'response'}>{line.output}</p>}{line.detail && <ShowMore detail={line.detail} />}</div>}
            </div>)}
            {w.command === 'terminal' && (
              <form className="command-line" onSubmit={(event) => { event.preventDefault(); runInWindow(w.id, w.input ?? ''); }}>
                <span className="prompt">nook@dev</span><span className="path">:~$</span>
                <span className="cmd-host">
                  <span className="cmd-text">{w.input ?? ''}</span><span className="block-cursor" aria-hidden="true" />
                  <input
                    value={w.input ?? ''}
                    onChange={(event) => setWindows((items) => items.map((x) => (x.id === w.id ? { ...x, input: event.target.value } : x)))}
                    autoFocus autoComplete="off" spellCheck={false} aria-label="Enter a terminal command"
                  />
                </span>
              </form>
            )}
          </>}
      </div>
    </div>)}
  </>;
}
