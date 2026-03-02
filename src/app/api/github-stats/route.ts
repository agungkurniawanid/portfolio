/**
 * GET /api/github-stats
 *
 * Proxies the GitHub REST API to retrieve the public repository count
 * for the portfolio owner's GitHub account.
 *
 * Response:
 *   { public_repos: number }
 *
 * Cached for 10 minutes via Next.js Route Segment Config so it doesn't hit
 * GitHub's unauthenticated rate limit (60 req/h per IP) on every visitor.
 */

import { NextResponse } from "next/server";

const GITHUB_USERNAME = "agungkurniawanid";
const GITHUB_API_URL  = `https://api.github.com/users/${GITHUB_USERNAME}`;

// Re-validate at most once per 10 minutes
export const revalidate = 600;

export async function GET() {
  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "portfolio-site",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.error(`[github-stats] GitHub API responded ${res.status}`);
      return NextResponse.json({ public_repos: 0 }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(
      { public_repos: (data.public_repos as number) ?? 0 },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[github-stats] fetch error:", err);
    return NextResponse.json({ public_repos: 0 }, { status: 200 });
  }
}
