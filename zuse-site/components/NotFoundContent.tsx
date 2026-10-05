import BackHomeButton from "@/components/BackHomeButton";
import { Button, GradientText } from "@/components/ui";

type NotFoundContentProps = {
  className?: string;
};

export default function NotFoundContent({
  className = "",
}: NotFoundContentProps) {
  return (
    <div className={`max-w-5xl ${className}`.trim()}>
      <GradientText
        as="div"
        immediate
        data-text="404"
        className="zuse-broken-404 zuse-display-gradient mb-6 font-display text-[140px] font-semibold leading-[0.8] tracking-[-0.06em] md:text-[220px] lg:text-[300px]"
      >
        404
      </GradientText>
      <h1 className="mb-6 text-4xl font-bold">Page not found</h1>
      <p className="mb-8 max-w-2xl text-lg opacity-80">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <BackHomeButton />
        <span className="inline-flex flex-wrap items-center gap-x-2 font-sans text-base">
          <span>Have a project in mind?</span>
          <Button
            href="/contact"
            className="zuse-not-found-link"
            font="sans"
            rightIcon={<span aria-hidden="true">→</span>}
            disabled
          >
            Start a project
          </Button>
        </span>
      </div>
    </div>
  );
}
