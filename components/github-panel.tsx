'use client';

import { useEffect, useState } from 'react';

type GithubData = {
  user?: { login: string; name?: string | null; avatar_url: string; bio?: string | null; public_repos: number; followers: number; following: number };
  repos?: { name: string; description?: string | null; language?: string | null; html_url: string; stargazers_count: number; fork: boolean; updated_at: string }[];
  activity?: { type: string; repo: string; created_at: string }[];
  calendar?: { totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number; color: string }[] }[] };
  needsToken?: boolean;
  error?: string;
};

const SHORT = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function timeAgo(date: string, now: number) {
  const diff = now - new Date(date).getTime();
  const secs = Math.round(diff / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) if (Math.abs(secs) >= size) return SHORT.format(-Math.round(secs / size), unit);
  return 'just now';
}
function describeEvent(type: string, repo: string) {
  const map: Record<string, string> = {
    PushEvent: `pushed to`,
    CreateEvent: `created in`,
    PullRequestEvent: `opened a PR in`,
    IssuesEvent: `opened an issue in`,
    IssueCommentEvent: `commented in`,
    ForkEvent: `forked`,
    WatchEvent: `starred`,
    ReleaseEvent: `released in`,
    PublicEvent: `made public`,
  };
  return `${map[type] ?? type.replace('Event', '').toLowerCase()} ${repo}`;
}

export function GithubPanel() {
  const [data, setData] = useState<GithubData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/github')
      .then((r) => r.json() as Promise<GithubData>)
      .then((json) => { if (alive) setData(json); })
      .catch(() => { if (alive) setError('Failed to reach GitHub.'); });
    return () => { alive = false; };
  }, []);

  if (error) return <p className="response error">{error}</p>;
  if (!data) return <p className="response muted">Loading GitHub data…</p>;
  if (data.error) return <p className="response error">GitHub: {data.error}</p>;
  if (data.needsToken) {
    return <p className="response muted">Set a <code className="gh-code">GITHUB_TOKEN</code> (with <em>repo</em> scope) to see the contribution graph, repos and activity.</p>;
  }

  const now = Date.now();
  const days = data.calendar?.weeks ?? [];
  const columns = days.map((w) => w.contributionDays);

  return (
    <div className="github-panel">
      <div className="gh-head">
        <img className="gh-avatar" src={data.user?.avatar_url ?? ''} alt={data.user?.login ?? ''} />
        <div>
          <p className="gh-name">{data.user?.name ?? data.user?.login}</p>
          <a className="gh-login" href={`https://github.com/${data.user?.login}`} target="_blank" rel="noopener noreferrer">@{data.user?.login}</a>
          <p className="gh-bio">{data.user?.bio}</p>
        </div>
      </div>
      <div className="gh-stats">
        <span><b>{data.user?.public_repos}</b> repos</span>
        <span><b>{data.user?.followers}</b> followers</span>
        <span><b>{data.user?.following}</b> following</span>
        {typeof data.calendar?.totalContributions === 'number' && <span><b>{data.calendar.totalContributions}</b> contributions</span>}
      </div>

      {columns.length > 0 && (
        <div className="gh-section">
          <p className="gh-title">contribution graph</p>
          <div className="gh-grid" role="img" aria-label={`${data.calendar!.totalContributions} contributions in the last year`}>
            {columns.map((week, i) => (
              <div className="gh-week" key={i}>
                {week.map((d) => (
                  <span key={d.date} className="gh-cell" style={{ background: d.contributionCount === 0 ? '#241a2c' : d.color }} title={`${d.date}: ${d.contributionCount} contribution${d.contributionCount === 1 ? '' : 's'}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.activity && data.activity.length > 0 && (
        <div className="gh-section">
          <p className="gh-title">recent activity</p>
          <ul className="gh-list">
            {data.activity.slice(0, 8).map((a, i) => (
              <li key={i}><span className="gh-event">{describeEvent(a.type, a.repo)}</span><span className="gh-when">{timeAgo(a.created_at, now)}</span></li>
            ))}
          </ul>
        </div>
      )}

      {data.repos && data.repos.length > 0 && (
        <div className="gh-section">
          <p className="gh-title">repositories</p>
          <ul className="gh-list">
            {data.repos.slice(0, 6).map((r) => (
              <li key={r.name} className="gh-repo">
                <a className="gh-repo-name" href={r.html_url} target="_blank" rel="noopener noreferrer">{r.name}</a>
                <span className="gh-repo-meta">{r.language ?? '—'}{r.stargazers_count > 0 ? `  ·  ★ ${r.stargazers_count}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
