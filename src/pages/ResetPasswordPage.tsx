import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrandMark from "@/components/brand/BrandMark";
import AuthLayout from "@/components/auth/AuthLayout";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "This reset link is missing a token.");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ApiService.resetPassword(token, newPassword);
      toast({
        title: "Password reset",
        description: res.message || "Password reset successfully. You can now log in.",
      });
      navigate("/login");
    } catch (err: unknown) {
      setError(ApiService.getErrorMessage(err, "This link is invalid or has expired"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <BrandMark to="/login" subtitle="New Life St Louis" />

      <h1 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">Choose a new password</h1>
      <p className="mt-3 text-sm text-ink/70">
        {token
          ? "Enter a new password for your account. This link expires 30 minutes after it was sent."
          : "This reset link is incomplete. Request a new one to continue."}
      </p>

      {token ? (
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="new-password" className="field-label">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="field-label">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p className="error-banner">{error}</p> : null}

          <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
            {loading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      ) : (
        <div className="mt-10 space-y-5">
          <p className="error-banner">{error}</p>
          <Button asChild className="h-12 w-full text-lg">
            <Link to="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-ink/70">
        <Link to="/login" className="font-medium text-ink transition-colors hover:text-terra">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
