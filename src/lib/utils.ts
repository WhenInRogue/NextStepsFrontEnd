import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rewrites entity wording so users see Assessment instead of Test. */
export function toUserFacingCopy(text: string): string {
  return text
    .replace(/\bTests\b/g, "Assessments")
    .replace(/\btests\b/g, "assessments")
    .replace(/\bTest\b/g, "Assessment")
    .replace(/\btest\b/g, "assessment")
    .replace(/\ba assessment\b/g, "an assessment")
    .replace(/\bA assessment\b/g, "An assessment");
}
