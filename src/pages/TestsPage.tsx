import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/ApiService";
import { extractTests, formatTestCreatedAt, type Test } from "@/types/test";
import CategoriesSection from "@/components/tests/CategoriesSection";

const TestsPage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ApiService.getAllTests();
        setTests(extractTests(res));
      } catch (err) {
        setError(ApiService.getErrorMessage(err, "Failed to load tests"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-rise">
        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-48 md:h-56">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Admin
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">Tests</h1>
              <p className="mt-2 max-w-xl text-sm text-cream/85">
                Create and tend the assessments members will take.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{tests.length === 1 ? "1 test" : `${tests.length} tests`}</p>
          <Button asChild>
            <Link to="/tests/new">New test</Link>
          </Button>
        </div>

        {error ? <p className="error-banner mt-6">{error}</p> : null}

        {tests.length === 0 && !error ? (
          <section className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">No tests yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Start with a name and a short description. Questions can be added later.
            </p>
            <Button asChild className="mt-6">
              <Link to="/tests/new">Create a test</Link>
            </Button>
          </section>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {tests.map((test) => {
              const created = formatTestCreatedAt(test.createdAt);
              return (
                <li key={test.id}>
                  <Link
                    to={`/tests/${test.id}`}
                    className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-sand/60"
                  >
                    <h2 className="font-serif text-2xl font-semibold text-ink">{test.name}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {test.description || "No description yet."}
                    </p>
                    {created ? (
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Created {created}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <CategoriesSection />
      </div>
    </Layout>
  );
};

export default TestsPage;
