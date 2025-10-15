"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUpSchema, type SignUpData } from "@/lib/types";
import { copy } from "@/lib/i18n";
import { Calculator, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpData) => {
    setIsLoading(true);
    setSignupError(null);
    clearErrors();
    
    try {
      await registerUser(data.name, data.email, data.password, data.company);
      toast({
        title: "Account created successfully!",
        description: "Welcome to Invoice Optimizer. You can now start optimizing your invoices.",
        variant: "success",
      });
      router.push("/app/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSignupError(errorMessage);
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Calculator className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">Invoice Optimizer</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{copy.auth.signUp.title}</CardTitle>
            <CardDescription>
              Create your account to start optimizing your invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {signupError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{signupError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{copy.auth.signUp.name}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                  onChange={() => setSignupError(null)}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">{copy.auth.signUp.company}</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Corp"
                  {...register("company")}
                  className={errors.company ? "border-destructive" : ""}
                  onChange={() => setSignupError(null)}
                />
                {errors.company && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.company.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{copy.auth.signUp.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  onChange={() => setSignupError(null)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{copy.auth.signUp.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                    onChange={() => setSignupError(null)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                  {copy.auth.signIn.title}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
