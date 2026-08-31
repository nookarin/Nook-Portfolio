'use client';

import { KeyboardEvent, SyntheticEvent, useEffect, useRef, useState } from 'react';
type Line = { command?: string; output: string; tone?: 'accent' | 'error' | 'muted' };
const responses: Record<string, string> = {
  help: 'Commands: about · skills · work · contact · status · date · clear',
  about: 'Nook is a full-stack developer building clear, resilient digital products from Bangkok.',
  skills: 'typescript  react  next.js  node.js  postgres  docker  cloudflare',
  work: '01 MarketFlow  /  02 Pulseboard  /  03 Orbit',
  contact: 'hello@example.com  ·  github  ·  linkedin',
  status: '● available for selected projects',
  date: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
};

export function PortfolioTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<Line[]>([
    { output: 'NOOK_OS [Version 1.0.26]', tone: 'muted' },
    { output: 'Portfolio shell ready. Type “help” to begin.', tone: 'accent' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  useEffect(() => { outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }); }, [lines]);

  function run(raw: string) {
    const command = raw.trim().toLowerCase().replace(/^\//, '');
    if (!command) return;
    setHistory((items) => [...items, command]);
    setHistoryIndex(-1);
    if (command === 'clear') return setLines([]);
    setLines((items) => [...items, responses[command]
      ? { command, output: responses[command], tone: command === 'status' ? 'accent' : undefined }
      : { command, output: `command not found: ${command}. Try “help”.`, tone: 'error' }]);
  }
  function submit(event: SyntheticEvent<HTMLFormElement>) { event.preventDefault(); run(input); setInput(''); }
  function browseHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'ArrowUp' ? Math.min(history.length - 1, historyIndex + 1) : Math.max(-1, historyIndex - 1);
    setHistoryIndex(next);
    setInput(next < 0 ? '' : history[history.length - 1 - next]);
  }

  return <section className="terminal-window" aria-label="Interactive portfolio terminal">
    <header className="terminal-titlebar"><div className="window-controls" aria-hidden="true"><i /><i /><i /></div><span>nook@portfolio — zsh</span><span className="window-state" aria-hidden="true">⌘</span></header>
    <div className="terminal-output" ref={outputRef} onClick={() => inputRef.current?.focus()}>
      {lines.map((line, index) => <div className="terminal-line" key={`${line.command}-${index}`}>
        {line.command && <p><span className="prompt">nook@dev</span><span className="path">:~$</span> {line.command}</p>}
        <p className={line.tone ? `response ${line.tone}` : 'response'}>{line.output}</p>
      </div>)}
      <form onSubmit={submit} className="command-line"><label htmlFor="command"><span className="prompt">nook@dev</span><span className="path">:~$</span></label><input id="command" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={browseHistory} autoFocus autoComplete="off" spellCheck={false} aria-label="Enter a terminal command" /><span className="block-cursor" aria-hidden="true" /></form>
    </div>
    <footer className="terminal-statusbar"><span>● ONLINE</span><span>UTF-8</span></footer>
  </section>;
}
