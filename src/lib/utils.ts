import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rewrites entity wording so users see Assessment/Team instead of Test/Group. */
export function toUserFacingCopy(text: string): string {
  return text
    .replace(/\bTests\b/g, "Assessments")
    .replace(/\btests\b/g, "assessments")
    .replace(/\bTest\b/g, "Assessment")
    .replace(/\btest\b/g, "assessment")
    .replace(/\ba assessment\b/g, "an assessment")
    .replace(/\bA assessment\b/g, "An assessment")
    .replace(/\bGroups\b/g, "Teams")
    .replace(/\bgroups\b/g, "teams")
    .replace(/\bGroup's\b/g, "Team's")
    .replace(/\bgroup's\b/g, "team's")
    .replace(/\bGroup\b/g, "Team")
    .replace(/\bgroup\b/g, "team");
}
