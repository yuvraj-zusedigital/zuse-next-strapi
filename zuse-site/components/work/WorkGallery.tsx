import WorkFilter from "@/components/work/WorkFilter";
import WorkProjectGrid from "@/components/work/WorkProjectGrid";
import {
  categoryLabel,
  filterProjectsByCategory,
  otherCategories,
  type WorkCategory,
  type WorkProject,
} from "@/lib/work";

type WorkGalleryProps = {
  projects: WorkProject[];
  categories: WorkCategory[];
  activeCategory?: string | null;
  /** The category filter row (sections.work-grid showFilter). */
  showFilter?: boolean;
};

export default function WorkGallery({
  projects,
  categories,
  activeCategory,
  showFilter = true,
}: WorkGalleryProps) {
  const filtered = filterProjectsByCategory(projects, activeCategory);
  const sections = activeCategory
    ? otherCategories(categories, activeCategory)
    : [];

  return (
    <>
      {showFilter ? <WorkFilter categories={categories} activeSlug={activeCategory} /> : null}

      <section className="has-video-init anime-grid-parent">
        <div className="section-container">
          <div className="work-projects-grid flex items-start justify-between flex-wrap">
            <WorkProjectGrid projects={filtered} />
          </div>
        </div>
      </section>

      {sections.map((category) => (
        <section key={category.slug} className="has-video-init anime-grid-parent">
          <div className="section-container">
            <h2 className="work-section-title">
              <span>{categoryLabel(category)}</span>
            </h2>
            <div className="work-projects-grid flex items-start justify-between flex-wrap">
              <WorkProjectGrid
                projects={filterProjectsByCategory(projects, category.slug)}
              />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
