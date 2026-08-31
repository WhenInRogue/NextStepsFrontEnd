import { cn } from "@/lib/utils";
import { isGroupActive, type Group } from "@/types/group";

const GroupStatusBadge = ({ group, className }: { group: Pick<Group, "isActive">; className?: string }) => {
  const active = isGroupActive(group);
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

export default GroupStatusBadge;
