/**
 * GET /api/github-repos-sorted
 *
 * Fetches all GitHub repositories owned by the portfolio owner via the
 * TypeScript helper `src/lib/fetchReposSorted.ts`, sorted from OLDEST
 * created to NEWEST created.
 *
 * After fetching, the list is written to `public/repos-sorted.txt` as a
 * human-readable plain-text file (also accessible at /repos-sorted.txt).
 *
 * Response:
 *   { success: true, count: number, file: "/repos-sorted.txt" }
 *   { error: string }  on failure
 *
 * GITHUB_TOKEN env var → includes private repos; absent → public only.
 */

import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";
import { fetchReposSortedByCreated, type RepoRecord } from "@/lib/fetchReposSorted";

function formatReposTxt(repos: RepoRecord[]): string {
  const header = [
    "GitHub Repositories — Sorted by Created Date (Oldest → Newest)",
    `Generated  : ${new Date().toISOString()}`,
    `Total      : ${repos.length} repositories`,
    "=".repeat(64),
    "",
  ].join("\n");

  const lines = repos.map((repo, index) => {
    const num = String(index + 1).padStart(3, " ");
    const createdDate = repo.created_at
      ? new Date(repo.created_at).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })
      : "N/A";
    const updatedDate = repo.updated_at
      ? new Date(repo.updated_at).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })
      : "N/A";
    const topics =
      repo.topics && repo.topics.length > 0 ? repo.topics.join(", ") : "-";

    return (
      [
        `${num}. ${repo.full_name}`,
        `      Created   : ${createdDate}`,
        `      Updated   : ${updatedDate}`,
        `      Visibility: ${repo.visibility}`,
        `      Language  : ${repo.language ?? "-"}`,
        `      Stars     : ${repo.stargazers_count} | Forks: ${repo.forks_count}`,
        `      Topics    : ${topics}`,
        `      URL       : ${repo.html_url}`,
        `      Desc      : ${repo.description ?? "-"}`,
      ].join("\n") + "\n"
    );
  });

  return header + lines.join("\n");
}

export async function GET() {
  try {
    const repos = await fetchReposSortedByCreated();

    const txtPath = path.join(process.cwd(), "public", "repos-sorted.txt");
    const content = formatReposTxt(repos);
    await fsPromises.writeFile(txtPath, content, "utf-8");

    return NextResponse.json(
      {
        success: true,
        count: repos.length,
        file: "/repos-sorted.txt",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[github-repos-sorted] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch or write repository list" },
      { status: 500 }
    );
  }
}
