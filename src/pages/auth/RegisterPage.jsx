import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from '@/api/auth';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ username, email, password, role: 'CUSTOMER' });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback((data) => {
    if (data.role === 'ADMIN') navigate('/admindashboard');
    else navigate('/');
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
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>Join ShopKart and start shopping today</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-100 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium text-ink">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ink">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" strokeWidth={2} />
                  <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl gap-2 mt-2">
                <UserPlus className="h-4 w-4" strokeWidth={2} />
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <GoogleSignInButton
              text="signup_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </CardContent>

          <CardFooter className="text-center text-sm border-t border-border pt-5">
            <p className="text-ink-muted">
              Already have an account?{' '}
              <a href="/login" className="text-brand hover:text-brand-hover font-semibold transition-colors">Sign in</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
