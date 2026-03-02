/**
 * GET /api/github-stats
 *
 * Returns GitHub stats for the portfolio owner sourced from two GitHub APIs:
 *   • REST API  — public repository count
 *   • GraphQL   — total contributions (current year)
 *
 * Response:
 *   { contributions: number, public_repos: number }
 *
 * Both calls use GITHUB_TOKEN (server-side only) for authenticated rate limits
 * (5 000 req/h) and are cached for 6 hours via Next.js Route Segment Config,
 * meaning GitHub is called at most 4 times per day.
 */

import { NextResponse } from "next/server";

const GITHUB_USERNAME  = "agungkurniawanid";
const GITHUB_REST_URL  = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// Re-validate at most once every 6 hours — max 4 GitHub calls per day
export const revalidate = 21600;

const FALLBACK = { contributions: 0, public_repos: 0 };

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-site",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function GET() {
  try {
    const headers = buildHeaders();

    const [restRes, graphqlRes] = await Promise.all([
      fetch(GITHUB_REST_URL, {
        headers,
        next: { revalidate: 21600 },
      }),
      fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              user(login: "${GITHUB_USERNAME}") {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                  }
                }
              }
            }
          `,
        }),
        next: { revalidate: 21600 },
      }),
    ]);

    // ── Public repo count ────────────────────────────────────────────────────
    let public_repos = 0;
    if (restRes.ok) {
      const restData = (await restRes.json()) as { public_repos?: number };
      public_repos = restData.public_repos ?? 0;
    } else {
      console.error(`[github-stats] REST API responded ${restRes.status}`);
    }

    // ── Total contributions ──────────────────────────────────────────────────
    let contributions = 0;
    if (graphqlRes.ok) {
      const graphqlData = (await graphqlRes.json()) as {
        data?: {
          user?: {
            contributionsCollection?: {
              contributionCalendar?: { totalContributions?: number };
            };
          };
        };
      };
      contributions =
        graphqlData.data?.user?.contributionsCollection?.contributionCalendar
          ?.totalContributions ?? 0;
    } else {
      console.error(`[github-stats] GraphQL API responded ${graphqlRes.status}`);
    }

    return NextResponse.json(
      { contributions, public_repos },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[github-stats] fetch error:", err);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
