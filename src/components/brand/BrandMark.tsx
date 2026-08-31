import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  to?: string;
  subtitle?: string;
  className?: string;
}

const Mark = ({ subtitle, className }: Omit<BrandMarkProps, "to">) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ochre text-ink">
      <span className="font-serif text-2xl font-semibold leading-none">n</span>
    </div>
    <div className="leading-tight">
      <p className="font-serif text-xl font-semibold text-ink">NextSteps</p>
      {subtitle ? (
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-terra">{subtitle}</p>
      ) : null}
    </div>
  </div>
);

const BrandMark = ({ to, subtitle, className }: BrandMarkProps) => {
  if (to) {
    return (
      <Link to={to} className="inline-flex no-underline">
        <Mark subtitle={subtitle} className={className} />
      </Link>
    );
  }

  return <Mark subtitle={subtitle} className={className} />;
};

export default BrandMark;
