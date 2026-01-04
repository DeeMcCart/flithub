import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthMode = 'signin' | 'signup' | 'magic-link' | 'forgot-password' | 'reset-password';

export default function AuthPage() {
  const { user, loading, signInWithMagicLink, signInWithPassword, signUp, resetPassword, updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('signin');

  // Check if we're in password reset mode (coming from email link)
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setMode('reset-password');
    }
  }, [searchParams]);

  // Redirect if already logged in (but not if resetting password)
  if (!loading && user && mode !== 'reset-password') {
    return <Navigate to="/" replace />;
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    const { error: authError } = mode === 'signup' 
      ? await signUp(email, password)
      : await signInWithPassword(email, password);
    
    setIsSubmitting(false);
    
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (authError.message.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(authError.message);
      }
    } else if (mode === 'signup') {
      setSuccess(true);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    const { error: signInError } = await signInWithMagicLink(email);
    
    setIsSubmitting(false);
    
    if (signInError) {
      setError(signInError.message);
    } else {
      setSuccess(true);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    const { error: resetError } = await resetPassword(email);
    
    setIsSubmitting(false);
    
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    const { error: updateError } = await updatePassword(password);
    
    setIsSubmitting(false);
    
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Password reset flow (after clicking email link)
  if (mode === 'reset-password') {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[60vh] py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">Set New Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Password Updated!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your password has been successfully updated.
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Go to Home
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Forgot password flow
  if (mode === 'forgot-password') {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[60vh] py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Check your email!</h3>
                  <p className="text-muted-foreground text-sm">
                    We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSuccess(false);
                      setMode('signin');
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full gap-2"
                    onClick={() => {
                      setError(null);
                      setMode('signin');
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[60vh] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Welcome to FlitHub</CardTitle>
            <CardDescription>
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {mode === 'magic-link' ? 'Check your email!' : 'Account created!'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {mode === 'magic-link' 
                    ? <>We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.</>
                    : <>Your account has been created. You can now sign in with your email and password.</>
                  }
                </p>
                {mode === 'signup' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSuccess(false);
                      setMode('signin');
                    }}
                  >
                    Sign in now
                  </Button>
                )}
              </div>
            ) : (
              <Tabs value={mode} onValueChange={(v) => { setMode(v as AuthMode); setError(null); }}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin">
                  <form onSubmit={handlePasswordAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            setError(null);
                            setMode('forgot-password');
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handlePasswordAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="magic-link">
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email address</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send Magic Link
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      We'll email you a link to sign in without a password
                    </p>
                  </form>
                </TabsContent>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By signing in, you agree to our terms of service and privacy policy.
                </p>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}