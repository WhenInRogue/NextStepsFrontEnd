import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  averagePercentage,
  giftPresence,
  giftPresenceLabel,
  roundedPercentage,
  scoreOnTen,
  scorePercentage,
  scoresOfType,
  sortScores,
  type CategoryScore,
  type GiftPresence,
} from "@/types/category-score";

type CategoryScoresSectionProps = {
  scores: CategoryScore[];
  emptyMessage?: string;
  isOwn?: boolean;
  subjectName?: string;
};

const GIFT_BAR_COLORS = [
  "var(--color-azure)",
  "var(--color-azure)",
  "var(--color-ochre)",
  "var(--color-terra)",
  "var(--color-ink)",
  "var(--color-azure2)",
  "var(--color-azure)",
];

const panelClass = "min-w-0 overflow-hidden rounded-3xl bg-card p-6 md:p-8";

const SCRIPTURE_AT_END =
  /^(.*?)\s*(?:[·•]|[–—-])\s*((?:[1-3]\s+)?[A-Z][A-Za-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:\s*[-–]\s*\d+)?)\s*$/;
const SCRIPTURE_LOOSE =
  /^(.*?[.!?])\s+((?:[1-3]\s+)?[A-Z][A-Za-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:\s*[-–]\s*\d+)?)\s*$/;

const CategoryScoresSection = ({
  scores,
  emptyMessage = "No scores were returned for this attempt.",
  isOwn = true,
  subjectName,
}: CategoryScoresSectionProps) => {
  const gifts = sortScores(scoresOfType(scores, "GIFT"));
  const teams = sortScores(scoresOfType(scores, "TEAM"));
  const other = sortScores(scores.filter((score) => score.category?.categoryType !== "GIFT" && score.category?.categoryType !== "TEAM"));

  if (scores.length === 0 || (gifts.length === 0 && teams.length === 0 && other.length === 0)) {
    return <p className="rounded-3xl bg-card px-4 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const overall = averagePercentage(gifts.length > 0 ? gifts : scores);
  const bestTeam = teams[0];
  const guidance = giftGuidance(gifts, isOwn);
  const teamCopy = bestTeam ? teamGuidance(bestTeam, isOwn) : undefined;
  const giftTitle = isOwn ? "Your Spiritual Gifts" : subjectName ? `${subjectName}'s Spiritual Gifts` : "Spiritual Gifts";
  const glanceTitle = isOwn ? "Your Gifts at a Glance" : "Gifts at a Glance";

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden" style={{ contain: "inline-size" }}>
      {gifts.length > 0 ? (
        <div className="grid min-w-0 gap-6 overflow-hidden lg:grid-cols-2">
          <section className={panelClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl md:text-[1.7rem]">{glanceTitle}</h2>
                <p className="mt-1 font-serif italic text-muted-foreground">
                  Across {gifts.length} spiritual gift{gifts.length === 1 ? "" : "s"}
                </p>
              </div>
              <p className="font-serif leading-none text-terra">
                <span className="text-3xl font-semibold sm:text-4xl">{overall}</span>
                <span className="text-base text-terra/70 sm:text-lg">/100</span>
              </p>
            </div>
            <GiftRadar gifts={gifts} />
          </section>

          <section className={cn(panelClass, "flex flex-col")}>
            <h2 className="font-serif text-2xl font-semibold text-ink md:text-[1.7rem]">{giftTitle}</h2>
            <p className="mt-1 font-serif italic text-muted-foreground">
              {isOwn ? "Your strength in each gift" : "Strength in each gift"}
            </p>
            <ul className="mt-6 space-y-4">
              {gifts.map((score, index) => (
                <ScoreRow
                  key={scoreKey(score, index)}
                  name={score.category?.categoryName || "Gift"}
                  value={roundedPercentage(score)}
                  color={GIFT_BAR_COLORS[index % GIFT_BAR_COLORS.length]}
                />
              ))}
            </ul>
            {guidance ? (
              <div className="mt-auto pt-8">
                <div className="rounded-2xl bg-sand/80 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-terra">Guidance</p>
                  <p className="mt-1.5 font-serif italic leading-snug text-ink [overflow-wrap:anywhere]">{guidance}</p>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {teams.length > 0 ? (
        <section className={panelClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink md:text-[1.7rem]">Team Alignment</h2>
              <p className="mt-1 font-serif italic text-muted-foreground">
                {isOwn ? "The church teams where your gifts fit best" : "The church teams where these gifts fit best"}
              </p>
            </div>
            {bestTeam?.category?.categoryName ? (
              <span className="rounded-full bg-terra px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-cream">
                Best fit: {bestTeam.category.categoryName}
              </span>
            ) : null}
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
            {teams.map((score, index) => (
              <ScoreRow
                key={scoreKey(score, index)}
                name={score.category?.categoryName || "Team"}
                value={roundedPercentage(score)}
                color={index === 0 ? "var(--color-terra)" : "var(--color-azure)"}
                leading={index === 0}
                suffix="%"
              />
            ))}
          </ul>
          {teamCopy ? (
            <p className="mt-6 font-serif italic leading-snug text-ink/80 [overflow-wrap:anywhere]">{teamCopy}</p>
          ) : null}
        </section>
      ) : null}

      {gifts.length > 0 ? (
        <ul className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          {gifts.map((score, index) => {
            const name = score.category?.categoryName || "Gift";
            const presence = giftPresence(score, gifts);
            const { summary, scripture } = splitCategoryCopy(score.category?.description);
            return (
              <li key={scoreKey(score, index)} className="w-full min-w-0 overflow-hidden rounded-3xl bg-card px-4 py-5 sm:px-5 md:px-6 md:py-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em]">
                  <span className="text-ink/55">{name}</span>
                  {presence !== "present" ? (
                    <>
                      <span className="text-ink/35"> · </span>
                      <span className={presenceClass(presence)}>{giftPresenceLabel(presence)}</span>
                    </>
                  ) : null}
                </p>
                {summary ? (
                  <p className="mt-2 font-serif text-[15px] leading-snug text-ink [overflow-wrap:anywhere]">{summary}</p>
                ) : null}
                <p className="mt-3 text-sm text-ink/55">
                  {scoreOnTen(score)} of 10 points
                  {scripture ? ` · ${scripture}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}

      {other.length > 0 ? (
        <section className={panelClass}>
          <h2 className="font-serif text-2xl font-semibold text-ink">Other scores</h2>
          <ul className="mt-5 space-y-4">
            {other.map((score, index) => (
              <ScoreRow
                key={scoreKey(score, index)}
                name={score.category?.categoryName || "Score"}
                value={roundedPercentage(score)}
                color="var(--color-azure)"
                suffix="%"
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

function GiftRadar({ gifts }: { gifts: CategoryScore[] }) {
  const isMobile = useIsMobile();

  if (gifts.length < 3) {
    const lead = gifts[0]?.category?.categoryName;
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="max-w-xs text-center font-serif italic text-ink/70">
          {lead ? `${lead} stands out on this profile.` : "A full radar appears with three or more gifts."}
        </p>
      </div>
    );
  }

  const data = gifts.map((score) => ({
    name: score.category?.categoryName || "Gift",
    value: Math.min(100, Math.max(0, scorePercentage(score))),
  }));

  return (
    <div className="relative mx-auto mt-2 h-[280px] w-full min-w-0 max-w-full overflow-hidden sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RadarChart data={data} cx="50%" cy="54%" outerRadius={isMobile ? "46%" : "58%"}>
          <PolarGrid gridType="polygon" stroke="var(--color-ink)" strokeOpacity={0.14} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "var(--color-ink)", fontSize: isMobile ? 10 : 12, fontFamily: "Work Sans, ui-sans-serif, sans-serif" }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value))}`, "Strength"]}
            contentStyle={{
              background: "var(--color-cream)",
              border: "1px solid color-mix(in oklab, var(--color-ink) 12%, transparent)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Radar
            name="Strength"
            dataKey="value"
            stroke="var(--color-terra)"
            fill="var(--color-terra)"
            fillOpacity={0.34}
            strokeWidth={2.4}
            dot={{ r: 3.5, fill: "var(--color-terra)", stroke: "var(--color-cream)", strokeWidth: 1 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <span className="pointer-events-none absolute left-1/2 top-[54%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ochre" />
    </div>
  );
}

function ScoreRow({
  name,
  value,
  color,
  leading = false,
  suffix = "",
}: {
  name: string;
  value: number;
  color: string;
  leading?: boolean;
  suffix?: string;
}) {
  return (
    <li className="min-w-0 space-y-1.5 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
      <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink sm:w-[8.5rem] sm:shrink-0">
        {leading ? <Star className="h-3.5 w-3.5 shrink-0 fill-terra text-terra" aria-hidden /> : null}
        <span className="min-w-0 truncate">{name}</span>
        <span className="shrink-0 tabular-nums sm:hidden">
          {value}
          {suffix}
        </span>
      </span>
      <ScoreBar value={value} color={color} />
      <span className="hidden w-10 shrink-0 text-right text-sm tabular-nums text-ink sm:block">
        {value}
        {suffix}
      </span>
    </li>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-sand/90">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function scoreKey(score: CategoryScore, index: number) {
  return String(score.categoryScoreId || score.category?.categoryId || `${score.category?.categoryName ?? "score"}-${index}`);
}

function presenceClass(presence: GiftPresence) {
  if (presence === "leading") return "text-terra";
  if (presence === "growing") return "text-azure";
  return "text-muted-foreground";
}

function splitCategoryCopy(description?: string): { summary?: string; scripture?: string } {
  if (!description?.trim()) return {};
  const trimmed = description.trim();
  const match = trimmed.match(SCRIPTURE_AT_END) || trimmed.match(SCRIPTURE_LOOSE);
  if (!match) return { summary: trimmed };
  const summary = match[1].trim();
  const scripture = match[2].trim();
  return { summary: summary || undefined, scripture };
}

function giftGuidance(gifts: CategoryScore[], isOwn: boolean): string | undefined {
  const strongest = gifts[0]?.category?.categoryName?.trim();
  if (!strongest) return undefined;
  const weakest = gifts[gifts.length - 1]?.category?.categoryName?.trim();
  const lead = strongest.toLowerCase();
  if (!weakest || weakest === strongest) {
    return isOwn ? `Your gift of ${lead} leads.` : `The gift of ${lead} leads.`;
  }
  const grow = weakest.toLowerCase();
  return isOwn
    ? `Your gift of ${lead} leads — ask God to grow ${grow} as you serve.`
    : `The gift of ${lead} leads — with room to grow in ${grow}.`;
}

function teamGuidance(team: CategoryScore, isOwn: boolean): string | undefined {
  const name = team.category?.categoryName?.trim();
  if (!name) return undefined;
  const { summary } = splitCategoryCopy(team.category?.description);
  const lead = isOwn ? "You'd thrive" : "They'd thrive";
  if (summary) {
    const clause = summary.charAt(0).toLowerCase() + summary.slice(1);
    const trimmed = clause.replace(/[.]+$/, "");
    return `${lead} on the ${name.toLowerCase()} — ${trimmed}.`;
  }
  return `${lead} on the ${name.toLowerCase()}.`;
}

export default CategoryScoresSection;
