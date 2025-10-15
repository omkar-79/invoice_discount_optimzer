"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useFormError } from "@/hooks/use-form-error";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function ErrorDemoPage() {
  const { toast } = useToast();
  const { error, clearError, handleError, handleSuccess, executeWithErrorHandling } = useFormError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showToastVariants = () => {
    toast({
      title: "Success Toast",
      description: "This is a success message!",
      variant: "success",
    });

    setTimeout(() => {
      toast({
        title: "Error Toast",
        description: "This is an error message!",
        variant: "destructive",
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: "Warning Toast",
        description: "This is a warning message!",
        variant: "warning",
      });
    }, 2000);

    setTimeout(() => {
      toast({
        title: "Info Toast",
        description: "This is an info message!",
        variant: "default",
      });
    }, 3000);
  };

  const testValidationErrors = () => {
    if (!email) {
      handleError("Email is required", "Validation Error");
      return;
    }
    if (!password) {
      handleError("Password is required", "Validation Error");
      return;
    }
    if (password.length < 6) {
      handleError("Password must be at least 6 characters", "Validation Error");
      return;
    }
    handleSuccess("All validation passed!");
  };

  const testApiError = async () => {
    await executeWithErrorHandling(async () => {
      // Simulate API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Invalid email or password. Please check your credentials and try again."));
        }, 1000);
      });
    }, "Login Failed");
  };

  const testNetworkError = async () => {
    await executeWithErrorHandling(async () => {
      // Simulate network error
      await new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("Network error");
          error.name = "TypeError";
          reject(error);
        }, 1000);
      });
    }, "Network Error");
  };

  const testServerError = async () => {
    await executeWithErrorHandling(async () => {
      // Simulate server error
      await new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("Server error");
          (error as any).status = 500;
          reject(error);
        }, 1000);
      });
    }, "Server Error");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Error Handling Demo</h1>
          <p className="text-muted-foreground mt-2">
            Test different error scenarios and user feedback mechanisms
          </p>
        </div>

        {/* Toast Variants Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Toast Notifications</span>
            </CardTitle>
            <CardDescription>
              Different types of toast notifications for user feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showToastVariants} variant="default" className="w-full">
              Show All Toast Variants
            </Button>
          </CardContent>
        </Card>

        {/* Form Validation Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Form Validation</span>
            </CardTitle>
            <CardDescription>
              Test form validation with real-time error feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demo-password">Password</Label>
              <Input
                id="demo-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
              />
            </div>
            
            <Button onClick={testValidationErrors} variant="default" className="w-full">
              Test Validation
            </Button>
          </CardContent>
        </Card>

        {/* API Error Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>API Error Scenarios</span>
            </CardTitle>
            <CardDescription>
              Test different types of API errors and their handling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testApiError} variant="outline" className="w-full">
              Test Authentication Error
            </Button>
            <Button onClick={testNetworkError} variant="outline" className="w-full">
              Test Network Error
            </Button>
            <Button onClick={testServerError} variant="outline" className="w-full">
              Test Server Error
            </Button>
          </CardContent>
        </Card>

        {/* Success Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Success Scenarios</span>
            </CardTitle>
            <CardDescription>
              Test success feedback and user confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleSuccess("Operation completed successfully!")} 
              variant="success" 
              className="w-full"
            >
              Show Success Message
            </Button>
            <Button 
              onClick={() => handleSuccess("Welcome back!", "Login Successful")} 
              variant="success" 
              className="w-full"
            >
              Show Login Success
            </Button>
          </CardContent>
        </Card>

        {/* Error Handling Features */}
        <Card>
          <CardHeader>
            <CardTitle>Error Handling Features</CardTitle>
            <CardDescription>
              Key features implemented for better user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Implemented</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Real-time form validation</li>
                  <li>• Toast notifications for feedback</li>
                  <li>• Inline error messages with icons</li>
                  <li>• Network error handling</li>
                  <li>• Server error mapping</li>
                  <li>• Authentication error handling</li>
                  <li>• Validation error display</li>
                  <li>• Success confirmation messages</li>
                  <li>• Error clearing on input change</li>
                  <li>• Consistent error styling</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🎯 Benefits</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Clear user feedback</li>
                  <li>• Reduced user confusion</li>
                  <li>• Better accessibility</li>
                  <li>• Professional appearance</li>
                  <li>• Consistent UX patterns</li>
                  <li>• Error recovery guidance</li>
                  <li>• Visual error indicators</li>
                  <li>• Non-blocking notifications</li>
                  <li>• Contextual help messages</li>
                  <li>• Mobile-friendly design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
