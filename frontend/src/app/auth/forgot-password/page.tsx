"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicLinkSchema, type MagicLinkData } from "@/lib/types";
import { copy } from "@/lib/i18n";
import { Calculator, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkData>({
    resolver: zodResolver(MagicLinkSchema),
  });

  const onSubmit = async (data: MagicLinkData) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSent(true);
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Calculator className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">Invoice Optimizer</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSent(false)}
                className="w-full"
              >
                Try again
              </Button>
              <div className="mt-4">
                <Link
                  href="/auth/sign-in"
                  className="text-sm text-primary hover:underline flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Calculator className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">Invoice Optimizer</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{copy.auth.forgotPassword.title}</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{copy.auth.forgotPassword.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : copy.auth.forgotPassword.sendReset}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/sign-in"
                className="text-sm text-primary hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
