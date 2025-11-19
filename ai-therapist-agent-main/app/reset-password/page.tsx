"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Lock, Sparkles, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    // TODO: Call backend to reset password
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1200);
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
              Reset Password
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
              Create a new password for your account
            </p>
          </div>

          {success ? (
            <div className="text-center py-4 lg:py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-green-50 border border-green-200 mb-3 sm:mb-4 lg:mb-5">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" />
              </div>
              <p className="text-lg sm:text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">
                Password Updated!
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8">
                Your password has been successfully reset.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-10 sm:h-11 lg:h-12 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-sm sm:text-base lg:text-lg"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs sm:text-sm lg:text-base font-medium text-foreground"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-10 sm:pl-10 lg:pl-12 pr-10 h-10 sm:h-11 lg:h-12 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-sm lg:text-base"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs sm:text-sm lg:text-base font-medium text-foreground"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-10 sm:pl-10 lg:pl-12 pr-10 h-10 sm:h-11 lg:h-12 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm sm:text-sm lg:text-base"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      )}
                    </button>
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
                    Updating...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-5 sm:mt-6 lg:mt-8 pt-4 sm:pt-5 lg:pt-6 border-t border-border/50">
              <p className="text-center text-xs sm:text-sm lg:text-base text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}