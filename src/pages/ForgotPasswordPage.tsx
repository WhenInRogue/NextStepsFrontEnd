import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrandMark from "@/components/brand/BrandMark";
import AuthLayout from "@/components/auth/AuthLayout";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await ApiService.forgotPassword(email.trim());
      setSent(true);
      toast({
        title: "Check your email",
        description: res.message || "If an account exists for that email, we sent a message with next steps.",
      });
    } catch (err: unknown) {
      setError(ApiService.getErrorMessage(err, "Couldn’t send a reset email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <BrandMark to="/login" subtitle="New Life St Louis" />

      <h1 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">Reset password</h1>
      <p className="mt-3 text-sm text-ink/70">
        Enter your email and we’ll send a reset link if an account exists. The link expires in 30 minutes.
      </p>

      {sent ? (
        <p className="mt-6 rounded-xl border border-azure/30 bg-azure/10 px-4 py-3 text-sm text-ink">
          If an account exists for that email, we sent a message with next steps.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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

        {error ? <p className="error-banner">{error}</p> : null}

        <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink/70">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-ink transition-colors hover:text-terra">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
