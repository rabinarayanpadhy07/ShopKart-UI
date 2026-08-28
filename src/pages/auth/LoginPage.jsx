import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, AlertCircle } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/api/auth";

function redirectAfterAuth(navigate, role) {
  if (role === "ADMIN") navigate("/admindashboard");
  else navigate("/");
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    try {
      const data = await login(username, password);
      redirectAfterAuth(navigate, data.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback((data) => {
    redirectAfterAuth(navigate, data.role);
  }, [navigate]);

  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-border">
          <CardHeader className="text-center pb-2 flex flex-col items-center gap-4">
            <Logo size="large" />
            <div>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your ShopKart account</CardDescription>
            </div>
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
                  <Input id="username" type="text" placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl mt-2">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <GoogleSignInButton
              text="signin_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-center text-sm border-t border-border pt-5">
            <a href="/register" className="text-brand hover:text-brand-hover font-semibold transition-colors">
              Create a new account
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
