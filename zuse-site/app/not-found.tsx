import NotFoundContent from "@/components/NotFoundContent";

/**
 * In-app `notFound()` UI (wrapped by root layout).
 * Title for unmatched URLs is owned by `app/global-not-found.tsx` to avoid
 * emitting two <title> tags (layout metadata + not-found metadata/hoist).
 */
export default function NotFound() {
  return (
    <main className="relative py-24 section-padding">
      <div className="section-container">
        <NotFoundContent />
      </div>
    </main>
  );
}
