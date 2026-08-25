import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, AlertCircle, Shield } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role === "ADMIN") {
          navigate("/admindashboard");
        } else {
          setError("Access denied. Admin role required.");
        }
      } else {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-ink flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <CardTitle className="text-xl">Admin Sign In</CardTitle>
            <CardDescription>Access the ShopKart admin panel</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-100 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium text-ink">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="username" type="text" placeholder="Admin username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="password" type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full h-11 rounded-xl mt-2">
                Enter as Admin
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center text-sm border-t border-border pt-5">
            <a href="/login" className="text-brand hover:text-brand-hover font-semibold transition-colors">
              Sign in as a customer
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
