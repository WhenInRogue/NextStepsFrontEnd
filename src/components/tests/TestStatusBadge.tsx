import { cn } from "@/lib/utils";
import { isTestActive, type Test } from "@/types/test";

const TestStatusBadge = ({ test, className }: { test: Pick<Test, "isActive">; className?: string }) => {
  const active = isTestActive(test);
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
        active ? "bg-azure/15 text-azure" : "bg-ink/10 text-ink/55",
        className,
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

export default TestStatusBadge;
