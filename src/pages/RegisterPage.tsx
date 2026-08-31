import { useState } from "react";
import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.registerUser({ name, email, password, phoneNumber });
      toast({ title: "Registration successful", description: `User ${name} has been created` });
      setName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Error registering user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl animate-rise">
        <div className="relative mb-8 h-44 overflow-hidden rounded-2xl">
          <CoastalScene className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/80">New account</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-cream">Register a user</h1>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div>
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <Input
              id="email"
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="field-label">
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
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
              required
            />
          </div>
          <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterPage;
