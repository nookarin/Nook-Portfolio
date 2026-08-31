import { NextResponse } from 'next/server';

export const runtime = 'edge';

const GITHUB_USER = 'nookarin';
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const BASE: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'nook-portfolio',
};
const HEADERS: Record<string, string> = TOKEN ? { ...BASE, Authorization: `Bearer ${TOKEN}` } : BASE;

type Repo = { name: string; description: string | null; language: string | null; html_url: string; stargazers_count: number; fork: boolean; updated_at: string };
type Activity = { type: string; repo: string; created_at: string };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text.slice(0, 160)}`);
  }
  return res.json() as Promise<T>;
}

export async function GET() {
  let user: Record<string, unknown> | undefined;
  let repos: Repo[] = [];
  let activity: Activity[] = [];
  let calendar: GithubCalendar | null = null;

  try {
    user = await json<Record<string, unknown>>(await fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: HEADERS }));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'user not found' }, { status: 502 });
  }

  const [repoRes, activityRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, { headers: HEADERS }),
    fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`, { headers: HEADERS }),
  ]);

  if (repoRes.ok) {
    const list = await json<Record<string, unknown>[]>(repoRes);
    repos = list.map((r) => ({
      name: String(r.name ?? ''),
      description: r.description as string | null,
      language: r.language as string | null,
      html_url: String(r.html_url ?? ''),
      stargazers_count: Number(r.stargazers_count ?? 0),
      fork: Boolean(r.fork),
      updated_at: String(r.updated_at ?? ''),
    })).filter((r) => !r.fork);
  }

  if (activityRes.ok) {
    const list = await json<Record<string, unknown>[]>(activityRes);
    activity = list.map((e) => ({
      type: String(e.type ?? ''),
      repo: String((e.repo as Record<string, unknown>)?.name ?? ''),
      created_at: String(e.created_at ?? ''),
    }));
  }

  if (TOKEN) {
    const query = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount color } } } } } }`;
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
      });
      const gql = await json<{ data?: { user?: { contributionsCollection?: { contributionCalendar?: GithubCalendar } } } }>(res);
      calendar = gql.data?.user?.contributionsCollection?.contributionCalendar ?? null;
    } catch {
      calendar = null;
    }
  }

  return NextResponse.json({
    user,
    repos,
    activity,
    calendar,
    needsToken: !TOKEN,
  });
}

type GithubCalendar = {
  totalContributions: number;
  weeks: { contributionDays: { date: string; contributionCount: number; color: string }[] }[];
};
