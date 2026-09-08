import React, { useCallback, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, AlertCircle, Shield, Loader2 } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/api/auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  const busy = status !== "idle";

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setStatus("loading");
    try {
      const data = await login(username, password);
      if (data.role === "ADMIN") {
        navigate("/admindashboard");
      } else {
        setStatus("idle");
        setError("Access denied. Admin role required.");
      }
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Unexpected error occurred");
    }
  };

  const handleGoogleStart = useCallback(() => {
    if (busy) return;
    setError(null);
    setStatus("loading");
  }, [busy]);

  const handleGoogleSuccess = useCallback((data) => {
    if (data.role === "ADMIN") {
      navigate("/admindashboard");
    } else {
      setStatus("idle");
      setError("Access denied. Admin role required.");
    }
  }, [navigate]);

  const handleGoogleError = useCallback((message) => {
    setStatus("idle");
    setError(message);
  }, []);

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

          <CardContent className="relative">
            <AnimatePresence>
              {busy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-sm rounded-b-2xl"
                >
                  <Loader2 className="h-8 w-8 text-brand animate-spin" strokeWidth={2} />
                  <p className="text-sm font-semibold text-ink">Signing you in…</p>
                </motion.div>
              )}
            </AnimatePresence>
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
                  <Input id="username" type="text" placeholder="Admin username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required disabled={busy} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="password" type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required disabled={busy} />
                </div>
              </div>
              <Button type="submit" disabled={busy} variant="secondary" className="w-full h-11 rounded-xl mt-2">
                {status === "loading" ? "Signing in..." : "Enter as Admin"}
              </Button>
            </form>
            <GoogleSignInButton
              text="signin_with"
              expectedRole="ADMIN"
              onStart={handleGoogleStart}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </CardContent>

          <CardFooter className="flex flex-col text-center text-sm border-t border-border pt-5">
            <Link to="/login" className="text-brand hover:text-brand-hover font-semibold transition-colors">
              Sign in as a customer
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
