import React, { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from '@/api/auth';

const formContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const formItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(0);
  const [loading, setLoading] = useState(false);

  const fail = (message) => {
    setError(message);
    setShake((n) => n + 1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate('/login');
    } catch (err) {
      fail(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback((data) => {
    if (data.role === 'ADMIN') navigate('/admindashboard');
    else navigate('/');
  }, [navigate]);

  const handleGoogleError = useCallback((message) => {
    fail(message);
  }, []);

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
                initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Logo size="large" />
              </motion.div>
              <div>
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>Join ShopKart and start shopping today</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface/80 backdrop-blur-sm rounded-b-2xl"
                  >
                    <Loader2 className="h-8 w-8 text-brand animate-spin" strokeWidth={2} />
                    <p className="text-sm font-semibold text-ink">Creating your account…</p>
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
                onSubmit={handleSignUp}
                className="space-y-4"
                variants={formContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={formItem} className="space-y-1.5">
                  <label htmlFor="username" className="text-sm font-medium text-ink">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                    <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
                  </div>
                </motion.div>
                <motion.div variants={formItem} className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </motion.div>
                <motion.div variants={formItem} className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                    <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={8} />
                  </div>
                </motion.div>
                <motion.div variants={formItem}>
                  <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl gap-2 mt-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> : <UserPlus className="h-4 w-4" strokeWidth={2} />}
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </motion.div>
              </motion.form>
              <motion.div variants={formItem} initial="hidden" animate="visible">
                <GoogleSignInButton
                  text="signup_with"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </motion.div>
            </CardContent>

            <CardFooter className="text-center text-sm border-t border-border pt-5">
              <p className="text-ink-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-brand hover:text-brand-hover font-semibold transition-colors">Sign in</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
