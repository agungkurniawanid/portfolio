/**
 * projectsApi.ts
 * Supabase query functions for the projects feature.
 *
 * Currently exposes:
 *   fetchPopularProjects()  — used by the Home page "Popular Projects" section.
 *
 * Schema reference:
 *   supabase/migrations/20260302000000_create_projects_tables.sql
 */

import { supabase } from "@/lib/supabase";
import type { PopularProjectRow, ProjectCardItem } from "@/types/project";
import { toProjectCardItem } from "@/types/project";

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
