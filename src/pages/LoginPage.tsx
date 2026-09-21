import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrandMark from "@/components/brand/BrandMark";
import AuthLayout from "@/components/auth/AuthLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);
    try {
      const res = await ApiService.loginUser({ email, password });
      if (res.status === 200) {
        ApiService.saveToken(res.token);
        ApiService.saveRole(res.role);
        toast({ title: "Welcome Back", description: res.message });
        navigate("/profile");
      }
    } catch (err: unknown) {
      setError(ApiService.getErrorMessage(err, "Invalid credentials"));
      setNeedsVerification(ApiService.isUnverifiedEmailError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ApiService.resendVerification(email.trim());
      toast({
        title: "Check your email",
        description: res.message || "If an account exists for that email, we sent a message with next steps.",
      });
      navigate(`/check-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      setError(ApiService.getErrorMessage(err, "Couldn’t send a verification email"));
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordTo = email.trim()
    ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
    : "/forgot-password";

  return (
    <AuthLayout>
      <BrandMark subtitle="New Life St Louis" />

      <h1 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">Welcome Back</h1>
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="field-label mb-0">
              Password
            </label>
            <Link to={forgotPasswordTo} className="text-xs font-medium text-ink transition-colors hover:text-terra">
              Forgot password?
            </Link>
          </div>
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

        {needsVerification ? (
          <Button type="button" variant="outline" className="h-12 w-full text-lg" disabled={loading} onClick={handleResend}>
            {loading ? "Sending..." : "Resend verification email"}
          </Button>
        ) : null}

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
    </AuthLayout>
  );
};

export default LoginPage;
