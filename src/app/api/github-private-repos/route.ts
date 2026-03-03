/**
 * GET /api/github-private-repos
 *
 * Returns the list of private repositories owned by the portfolio owner,
 * fetched via GitHub GraphQL API using GITHUB_TOKEN (fine-grained PAT).
 *
 * Required fine-grained permission: Repository → Metadata: Read
 * (This is the default mandatory permission when creating any fine-grained token.)
 *
 * Response: GitHubRepo[] (same shape as the public repos list on the projects page)
 *
 * Returns [] when GITHUB_TOKEN is absent so the UI degrades gracefully.
 * Cached for 6 hours — max 4 calls per day.
 */

import { NextResponse } from "next/server";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export const revalidate = 21600;

/** Matches the GitHubRepo interface used in projects/page.tsx */
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  visibility: string;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "portfolio-site",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function GET() {
  // Without a token we cannot access private repos at all
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json([] as GitHubRepo[], { status: 200 });
  }

  try {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        query: `
          query {
            viewer {
              repositories(
                privacy: PRIVATE
                ownerAffiliations: OWNER
                orderBy: { field: UPDATED_AT, direction: DESC }
                first: 100
              ) {
                nodes {
                  databaseId
                  name
                  nameWithOwner
                  url
                  description
                  homepageUrl
                  repositoryTopics(first: 10) {
                    nodes { topic { name } }
                  }
                  primaryLanguage { name }
                  stargazerCount
                  forkCount
                  watchers { totalCount }
                  updatedAt
                  visibility
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      console.error(`[github-private-repos] GraphQL responded ${res.status}`);
      return NextResponse.json([] as GitHubRepo[], { status: 200 });
    }

    const data = (await res.json()) as {
      data?: {
        viewer?: {
          repositories?: {
            nodes?: Array<{
              databaseId: number;
              name: string;
              nameWithOwner: string;
              url: string;
              description: string | null;
              homepageUrl: string | null;
              repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
              primaryLanguage: { name: string } | null;
              stargazerCount: number;
              forkCount: number;
              watchers: { totalCount: number };
              updatedAt: string;
              visibility: string;
            }>;
          };
        };
      };
    };

    const nodes = data?.data?.viewer?.repositories?.nodes ?? [];

    const repos: GitHubRepo[] = nodes.map((node) => ({
      id: node.databaseId,
      name: node.name,
      full_name: node.nameWithOwner,
      html_url: node.url,
      description: node.description,
      homepage: node.homepageUrl,
      topics: node.repositoryTopics.nodes.map((t) => t.topic.name),
      language: node.primaryLanguage?.name ?? null,
      stargazers_count: node.stargazerCount,
      forks_count: node.forkCount,
      watchers_count: node.watchers.totalCount,
      updated_at: node.updatedAt,
      visibility: node.visibility.toLowerCase(),
    }));

    return NextResponse.json(repos, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[github-private-repos] fetch error:", err);
    return NextResponse.json([] as GitHubRepo[], { status: 200 });
  }
}
