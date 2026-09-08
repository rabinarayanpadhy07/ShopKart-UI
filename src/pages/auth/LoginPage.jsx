import React, { useCallback, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, AlertCircle, Loader2 } from "lucide-react";
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

const formContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const formItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// 'idle' -> 'loading' (request in flight) -> navigate away as soon as it resolves.
// Any request path (password or Google) can only start from 'idle', which is what
// guards against duplicate submissions from either path while one is already running.
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(0);
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  const busy = status !== "idle";

  // Stable identities (only close over stable setters/navigate) so passing them
  // to GoogleSignInButton doesn't force it to re-render its effect every render.
  const fail = useCallback((message) => {
    setStatus("idle");
    setError(message);
    setShake((n) => n + 1);
  }, []);

  const succeed = useCallback((role) => {
    redirectAfterAuth(navigate, role);
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!username.trim() || !password.trim()) {
      fail("Username and password are required");
      return;
    }
    setStatus("loading");
    try {
      const data = await login(username, password);
      succeed(data.role);
    } catch (err) {
      fail(err.message);
    }
  };

  const handleGoogleStart = useCallback(() => {
    if (busy) return;
    setError(null);
    setStatus("loading");
  }, [busy]);

  const handleGoogleSuccess = useCallback((data) => {
    succeed(data.role);
  }, [succeed]);

  const handleGoogleError = useCallback((message) => {
    fail(message);
  }, [fail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
        >
          <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-border">
            <CardHeader className="text-center pb-2 flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Logo size="large" />
              </motion.div>
              <div>
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>Sign in to your ShopKart account</CardDescription>
              </div>
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
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.form
                onSubmit={handleSignIn}
                className="space-y-4"
                variants={formContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={formItem} className="space-y-1.5">
                  <label htmlFor="username" className="text-sm font-medium text-ink">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                    <Input id="username" type="text" placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required disabled={busy} />
                  </div>
                </motion.div>
                <motion.div variants={formItem} className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                    <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required disabled={busy} />
                  </div>
                </motion.div>
                <motion.div variants={formItem}>
                  <Button type="submit" disabled={busy} className="w-full h-11 rounded-xl mt-2 gap-2">
                    {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
                    {status === "loading" ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>
              </motion.form>
              <motion.div variants={formItem} initial="hidden" animate="visible">
                <GoogleSignInButton
                  text="signin_with"
                  onStart={handleGoogleStart}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 text-center text-sm border-t border-border pt-5">
              <Link to="/register" className="text-brand hover:text-brand-hover font-semibold transition-colors">
                Create a new account
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
