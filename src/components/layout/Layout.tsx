import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
    </div>
  );
};

export default Layout;
