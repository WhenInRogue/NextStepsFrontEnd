import { cn } from "@/lib/utils";

interface BrandHeroProps {
  className?: string;
  /** poster favors the wordmark; architecture crops to the church and cross */
  crop?: "poster" | "architecture";
  priority?: boolean;
}

const cropClass = {
  poster: "object-top",
  architecture: "object-[center_58%]",
};

const BrandHero = ({ className, crop = "architecture", priority = false }: BrandHeroProps) => (
  <img
    src="/next-steps-main.jpg"
    alt=""
    aria-hidden
    decoding={priority ? "sync" : "async"}
    fetchPriority={priority ? "high" : "auto"}
    className={cn("h-full w-full object-cover", cropClass[crop], className)}
  />
);

export default BrandHero;
