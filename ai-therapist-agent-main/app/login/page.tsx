"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Sparkles } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(email, password);

      // Store the token in localStorage
      localStorage.setItem("token", response.token);

      // Update session state
      await checkSession();

      // Wait for state to update before redirecting
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 px-4 py-8 sm:py-12">
      <Container className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <Card className="w-full p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 mb-3 sm:mb-4 lg:mb-5">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 lg:mb-3">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
              Sign in to continue your mental wellness journey
            </p>
          </div>

          <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs sm:text-sm lg:text-base font-medium text-foreground"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 sm:pl-10 lg:pl-12 h-10 sm:h-11 lg:h-12 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-sm lg:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs sm:text-sm lg:text-base font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 sm:pl-10 lg:pl-12 h-10 sm:h-11 lg:h-12 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-sm lg:text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 sm:p-3 lg:p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 text-xs sm:text-sm lg:text-base text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <Button
              className="w-full h-10 sm:h-11 lg:h-12 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-sm sm:text-base lg:text-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 lg:mt-8 pt-4 sm:pt-5 lg:pt-6 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm lg:text-base">
              <Link
                href="/signup"
                className="text-primary font-medium hover:text-primary/80 transition-colors order-2 sm:order-1"
              >
                Create account
              </Link>
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground transition-colors order-1 sm:order-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}