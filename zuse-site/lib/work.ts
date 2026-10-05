export type WorkCategory = {
  Name?: string;
  name?: string;
  slug?: string;
  /** Lower shows first. */
  rank?: number | null;
};

export type WorkSlide = {
  Videomp4?: { url?: string } | null;
  select_media?: { url?: string } | null;
};

export type WorkProject = {
  id?: number | string;
  Title?: string;
  title?: string;
  sub_title?: string;
  slug?: string;
  GirdStyle?: string;
  is_coming_soon?: boolean;
  select_type?: string;
  project_details_path?: string;
  project_categories?: WorkCategory[];
  Slider?: WorkSlide[];
};

export function projectTitle(project: WorkProject) {
  return project.Title || project.title || "Project";
}

export function projectHref(project: WorkProject) {
  if (project.is_coming_soon) return null;
  const path = project.project_details_path;
  if (!path) return null;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function projectPoster(project: WorkProject) {
  return project.Slider?.[0]?.select_media?.url || null;
}

export function projectVideo(project: WorkProject) {
  return project.Slider?.[0]?.Videomp4?.url || null;
}

export function categoryLabel(category: WorkCategory) {
  return category.Name || category.name || category.slug || "";
}

/**
 * The "other categories" sections under a category page: every other
 * category, in rank order (set per category in the CMS).
 */
export function otherCategories(categories: WorkCategory[], activeSlug: string) {
  const rank = (category: WorkCategory) => (typeof category.rank === "number" ? category.rank : Number.MAX_SAFE_INTEGER);
  return categories.filter((cat) => cat.slug && cat.slug !== activeSlug).sort((a, b) => rank(a) - rank(b));
}

/** Label under a Work tile: the project's sub title, else its category names. */
export function projectLabel(project: WorkProject) {
  const subTitle = project.sub_title?.trim();
  if (subTitle) return subTitle;
  return (project.project_categories ?? []).map(categoryLabel).filter(Boolean).join(", ");
}

export function filterProjectsByCategory(
  projects: WorkProject[],
  categorySlug?: string | null
) {
  if (!categorySlug) return projects;
  return projects.filter((project) =>
    (project.project_categories || []).some(
      (cat) => (cat.slug || "").toLowerCase() === categorySlug.toLowerCase()
    )
  );
}
