import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ApiService from "@/services/ApiService";
import { useToast } from "@/hooks/use-toast";
import CoastalScene from "@/components/brand/CoastalScene";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUserInfo();
        setUser(userInfo);
      } catch {
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const fields = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phoneNumber },
    { label: "Role", value: user.role },
  ];

  return (
    <Layout>
      <div className="animate-rise">
        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-56 md:h-72">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Your profile
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">
                {user.name}
              </h1>
              <p className="mt-2 font-serif italic text-cream/85">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Account details</h2>
              <p className="mt-1 text-sm text-muted-foreground">The particulars we keep on file for you.</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((item) => (
              <div key={item.label} className="rounded-xl bg-sand/70 px-4 py-4">
                <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-12 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span>NextSteps</span>
          <span>Est. 2025</span>
        </footer>
      </div>
    </Layout>
  );
};

export default ProfilePage;
