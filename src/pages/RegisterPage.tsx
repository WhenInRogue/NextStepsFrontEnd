import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BrandMark from "@/components/brand/BrandMark";
import AuthLayout from "@/components/auth/AuthLayout";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: { name: string; email: string; password: string; phoneNumber?: string } = {
        name,
        email,
        password,
      };
      if (phoneNumber.trim()) payload.phoneNumber = phoneNumber.trim();
      const res = await ApiService.registerUser(payload);
      toast({
        title: "Account created",
        description: res.message || "Check your email to verify your account.",
      });
      navigate(`/check-email?email=${encodeURIComponent(email)}`, { state: { registered: true } });
    } catch (err: unknown) {
      const message = ApiService.getErrorMessage(err, "Error registering user");
      setError(message);
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <BrandMark subtitle="New Life St Louis" />

      <h1 className="mt-12 font-serif text-4xl font-semibold text-ink md:text-[2.75rem]">Create an account</h1>
      <p className="mt-3 text-sm text-ink/70">Join NextSteps to take assessments and find where you can serve.</p>

      <form onSubmit={handleRegister} className="mt-10 space-y-5">
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            pattern=".+@.+\..+"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone number <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="\d{9,12}"
            value={phoneNumber}
            minLength={9}
            maxLength={12}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,12}$/.test(value)) {
                setPhoneNumber(value);
              }
            }}
          />
        </div>

        {error ? <p className="error-banner">{error}</p> : null}

        <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink/70">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-ink transition-colors hover:text-terra">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
