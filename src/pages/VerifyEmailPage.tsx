import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/brand/BrandMark";
import AuthLayout from "@/components/auth/AuthLayout";

type VerifyState = "verifying" | "success" | "error";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "Confirming your email…" : "This verification link is missing a token.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setState("verifying");
    setMessage("Confirming your email…");

    ApiService.verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setState("success");
        setMessage(res.message || "Email verified successfully. You can now log in.");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState("error");
        setMessage(ApiService.getErrorMessage(err, "This link is invalid or has expired"));
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout>
      <BrandMark to="/login" subtitle="New Life St Louis" />

      <h1 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">
        {state === "success" ? "Email verified" : "Verify your email"}
      </h1>
      <p className="mt-3 text-sm text-ink/70">
        {state === "verifying"
          ? "Hang on while we confirm this link."
          : state === "success"
            ? "Your account is ready. You can sign in now."
            : "We couldn’t confirm this link. Request a new one if it expired."}
      </p>

      {state === "verifying" ? (
        <p className="mt-8 text-sm text-ink/70">{message}</p>
      ) : (
        <p className={`mt-8 ${state === "success" ? "rounded-xl border border-azure/30 bg-azure/10 px-4 py-3 text-sm text-ink" : "error-banner"}`}>
          {message}
        </p>
      )}

      {state !== "verifying" ? (
        <div className="mt-10 space-y-3">
          {state === "success" ? (
            <Button asChild className="h-12 w-full text-lg">
              <Link to="/login">Sign in</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="h-12 w-full text-lg">
                <Link to="/check-email">Resend verification email</Link>
              </Button>
              <p className="text-center text-sm text-ink/70">
                <Link to="/login" className="font-medium text-ink transition-colors hover:text-terra">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      ) : null}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
