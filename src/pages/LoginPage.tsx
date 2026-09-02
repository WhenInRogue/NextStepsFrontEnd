import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrandMark from "@/components/brand/BrandMark";
import CoastalScene from "@/components/brand/CoastalScene";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await ApiService.loginUser({ email, password });
      if (res.status === 200) {
        ApiService.saveToken(res.token);
        ApiService.saveRole(res.role);
        toast({ title: "Welcome back", description: res.message });
        navigate("/profile");
      }
    } catch (err: any) {
      const unreachable = !err?.response;
      const message = unreachable
        ? `Couldn’t reach the NextSteps API at ${ApiService.BASE_URL.replace(/\/api$/, "")}. Make sure the backend is running.`
        : err.response?.data?.message || "Invalid credentials";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative min-h-[38vh] overflow-hidden lg:min-h-screen">
        <CoastalScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cream/80">NextSteps</p>
          <h1 className="mt-3 max-w-md font-serif text-4xl font-semibold leading-tight text-cream drop-shadow-sm md:text-5xl">
            Discover your gifts. Find your place to serve.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-[420px] animate-rise">
          <BrandMark subtitle="New Life St Louis" />

          <h2 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">Welcome back</h2>
          <p className="mt-3 text-sm text-ink/70">Return to your account — your progress is kept for you.</p>

          <form onSubmit={handleLogin} className="mt-10 space-y-5">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? <p className="error-banner">{error}</p> : null}

            <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
              {loading ? "Entering..." : "Enter"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/70">
            Need an account?{" "}
            <Link to="/register" className="font-medium text-ink transition-colors hover:text-terra">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
