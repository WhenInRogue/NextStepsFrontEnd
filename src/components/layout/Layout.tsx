import { ReactNode } from "react";
import Header from "./Header";
import HelpButton from "@/components/common/HelpButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      <HelpButton />
    </div>
  );
};

export default Layout;
