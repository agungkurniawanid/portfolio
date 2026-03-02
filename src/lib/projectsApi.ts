/**
 * projectsApi.ts
 * Supabase query functions for the projects feature.
 *
 * Exports:
 *   fetchPopularProjects()  — Home page "Popular Projects" section.
 *   fetchAboutStats()       — Home page About section dynamic stats
 *                             (years_experience, contributions, total_projects).
 *
 *   Data sources:
 *     • years_experience  → Supabase `portfolio_stats` table
 *     • contributions     → GitHub GraphQL API (via /api/github-stats, cached 6 h)
 *     • total_projects    → count(projects WHERE is_published = false) + public_repos
 *
 * Schema references:
 *   supabase/migrations/20260302000000_create_projects_tables.sql
 *   supabase/migrations/20260303000000_create_portfolio_stats.sql
 *   supabase/migrations/20260304000000_refactor_portfolio_stats.sql
 */

import { supabase } from "@/lib/supabase";
import type { PopularProjectRow, ProjectCardItem } from "@/types/project";
import { toProjectCardItem } from "@/types/project";

// ─────────────────────────────────────────────────────────────────────────────
// About-section stats
// ─────────────────────────────────────────────────────────────────────────────

/** Shape returned by fetchAboutStats() */
export interface AboutStats {
  /** "Tahun Pengalaman" — years of professional/active coding experience */
  yearsExperience: number;
  /** "Kontribusi" — open-source contributions, collaborations, etc. */
  contributions: number;
  /**
   * "Project Selesai" — total completed projects.
   * Computed as:  count(projects WHERE is_published = false)  (Supabase)
   *             + (public_repos - IGNORED_GITHUB_REPOS)       (GitHub API, via /api/github-stats)
   *
   * IGNORED_GITHUB_REPOS = 2 → "agungkurniawanid" (profile README) + "portfolio"
   * These are filtered out on the /projects page so the count must match.
   */
  totalProjects: number;
}

/**
 * Repos excluded from the public-repo count (profile README + this portfolio).
 * Must stay in sync with IGNORE_NAMES in src/app/projects/page.tsx.
 */
const IGNORED_GITHUB_REPOS = 2; // "agungkurniawanid" + "portfolio"

/** Fallback values used when Supabase or GitHub is unreachable */
const STATS_FALLBACK = {
  yearsExperience: 5,
} as const;

/**
 * Fetches all About-section stats in parallel:
 *   1. `portfolio_stats` row from Supabase (years_experience only)
 *   2. Count of `projects` rows where `is_published = false`
 *   3. GitHub stats from /api/github-stats (GraphQL contributions + REST public_repos,
 *      cached server-side for 6 hours — max 4 GitHub calls per day)
 *
 * Falls back gracefully to hardcoded defaults if any source fails.
 */
export async function fetchAboutStats(): Promise<AboutStats> {
  type GitHubStats = { contributions: number; public_repos: number };

  const [supabaseResult, unpublishedResult, githubResult] = await Promise.allSettled([
    supabase
      .from("portfolio_stats")
      .select("years_experience")
      .limit(1)
      .single(),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    fetch("/api/github-stats").then((r) => r.json() as Promise<GitHubStats>),
  ]);

  // ── Supabase portfolio_stats (years_experience only) ─────────────────────
  let yearsExperience = STATS_FALLBACK.yearsExperience;

  if (
    supabaseResult.status === "fulfilled" &&
    !supabaseResult.value.error &&
    supabaseResult.value.data
  ) {
    yearsExperience = supabaseResult.value.data.years_experience ?? yearsExperience;
  } else {
    console.error(
      "[projectsApi] fetchAboutStats — Supabase portfolio_stats error:",
      supabaseResult.status === "fulfilled"
        ? supabaseResult.value.error?.message
        : supabaseResult.reason
    );
  }

  // ── Supabase unpublished projects count ───────────────────────────────────
  let unpublishedCount = 0;

  if (
    unpublishedResult.status === "fulfilled" &&
    !unpublishedResult.value.error &&
    typeof unpublishedResult.value.count === "number"
  ) {
    unpublishedCount = unpublishedResult.value.count;
  } else {
    console.error(
      "[projectsApi] fetchAboutStats — Supabase projects count error:",
      unpublishedResult.status === "fulfilled"
        ? unpublishedResult.value.error?.message
        : unpublishedResult.reason
    );
  }

  // ── GitHub (contributions + public repos) ────────────────────────────────
  let contributions = 0;
  let publicRepos   = 0;

  if (
    githubResult.status === "fulfilled" &&
    githubResult.value !== null &&
    typeof githubResult.value === "object"
  ) {
    const gh = githubResult.value;
    contributions = typeof gh.contributions === "number" ? gh.contributions : 0;
    // Subtract ignored repos so count matches the /projects page (same as IGNORE_NAMES there)
    publicRepos = typeof gh.public_repos === "number"
      ? Math.max(0, gh.public_repos - IGNORED_GITHUB_REPOS)
      : 0;
  } else {
    console.error(
      "[projectsApi] fetchAboutStats — GitHub API error:",
      githubResult.status === "rejected" ? githubResult.reason : "unknown"
    );
  }

  return {
    yearsExperience,
    contributions,
    totalProjects: unpublishedCount + publicRepos,
  };
}

// Number of slots in the Home page Popular Projects grid
const POPULAR_PROJECTS_LIMIT = 9;

/**
 * Fetches the 9 popular projects for the Home page in display_order.
 *
 * Supabase JS equivalent of:
 *
 *   SELECT p.*, gu.label, gu.url
 *   FROM popular_projects pp
 *   JOIN projects p ON p.id = pp.project_id AND p.is_published = true
 *   LEFT JOIN project_github_urls gu ON gu.project_id = p.id
 *   ORDER BY pp.display_order ASC
 *   LIMIT 9;
 *
 * @returns Array of ProjectCardItem ready for the ProjectCard component.
 *          Returns an empty array on error so the UI can fall back gracefully.
 */
export async function fetchPopularProjects(): Promise<ProjectCardItem[]> {
  const { data, error } = await supabase
    .from("popular_projects")
    .select(
      `
      display_order,
      projects (
        id,
        title,
        description,
        thumbnail_url,
        platform_apps,
        tech_stack,
        live_url,
        github_api,
        category,
        year,
        is_published,
        display_order,
        created_at,
        updated_at,
        project_github_urls (
          label,
          url,
          display_order
        )
      )
    `
    )
    .eq("projects.is_published", true)
    .order("display_order", { ascending: true })
    .limit(POPULAR_PROJECTS_LIMIT);

  if (error) {
    console.error("[projectsApi] fetchPopularProjects error:", error.message);
    return [];
  }

  if (!data) return [];

  // Flatten the nested join into PopularProjectRow objects
  const rows: PopularProjectRow[] = (data as any[])
    .filter((row) => row.projects !== null)
    .map((row) => ({
      ...(row.projects as any),
      project_github_urls: (row.projects as any).project_github_urls ?? [],
      popular_display_order: row.display_order as number,
    }));

  return rows.map(toProjectCardItem);
}
