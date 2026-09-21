import BrandHero from "@/components/brand/BrandHero";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-screen bg-background lg:grid-cols-2">
    <section className="relative min-h-[38vh] overflow-hidden lg:min-h-screen">
      <BrandHero className="absolute inset-0 h-full w-full" crop="poster" priority />
    </section>
    <section className="flex items-center justify-center px-6 py-12 md:px-12">
      <div className="w-full max-w-[420px] animate-rise">{children}</div>
    </section>
  </div>
);

export default AuthLayout;
