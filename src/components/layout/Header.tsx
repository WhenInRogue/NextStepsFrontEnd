import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApiService from "@/services/ApiService";
import BrandMark from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const isAdmin = ApiService.isAdmin();
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const user = await ApiService.getLoggedInUserInfo();
        if (!cancelled) setName(user?.name ?? "");
      } catch {
        if (!cancelled) setName("");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = () => {
    ApiService.logout();
  };

  const links = [
    { path: "/profile", label: "Profile", show: true },
    { path: "/groups", label: "Groups", show: true },
    { path: "/register", label: "Register", show: isAdmin },
  ];

  const isCurrent = (path: string) =>
    path === "/groups"
      ? location.pathname === "/groups" || location.pathname.startsWith("/groups/")
      : location.pathname === path;

  const initial = (name || "N").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <BrandMark to="/profile" />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(
            (item) =>
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm text-ink/70 transition-colors hover:text-ink",
                    isCurrent(item.path) && "font-medium text-ink",
                  )}
                >
                  {item.label}
                </Link>
              ),
          )}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <nav className="flex items-center gap-4 overflow-x-auto md:hidden">
            {links.map(
              (item) =>
                item.show && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "text-sm text-ink/70",
                      isCurrent(item.path) && "font-medium text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                ),
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sand font-serif text-sm text-ink">
              {initial}
            </div>
            {name ? <span className="hidden text-sm text-ink sm:inline">{name.split(" ")[0]}</span> : null}
          </div>
          <Link
            to="/login"
            onClick={logout}
            className="text-sm text-muted-foreground transition-colors hover:text-terra"
          >
            Log out
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
