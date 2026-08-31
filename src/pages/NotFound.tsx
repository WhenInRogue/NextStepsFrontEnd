import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/brand/BrandMark";
import CoastalScene from "@/components/brand/CoastalScene";
import ApiService from "@/services/ApiService";

const NotFound = () => {
  const location = useLocation();
  const home = ApiService.isAuthenticated() ? "/profile" : "/login";

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <CoastalScene className="absolute inset-0 h-full w-full" />
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md animate-rise">
          <BrandMark to={home} />
          <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.2em] text-terra">Lost at sea</p>
          <h1 className="mt-3 font-serif text-6xl font-semibold text-ink">404</h1>
          <p className="mt-4 text-ink/70">This page drifted off the map.</p>
          <Button asChild className="mt-8 h-12 px-8 text-lg">
            <Link to={home}>Return</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
