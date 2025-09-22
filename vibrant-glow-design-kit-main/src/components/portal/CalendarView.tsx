import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

const Auth = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/portal" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetMode) {
        await resetPassword(formData.email);
        toast.success('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
      } else if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        toast.success('Account created! Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-gray-900">Smart</span>
                <span className="text-[#5FFF56]">Hoster</span>
                <span className="text-black">.io</span>
              </span>
            </Link>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartHoster</h1>
            <p className="text-gray-600">Client Portal</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isResetMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isResetMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                )}

                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                {!isResetMode && (
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[#5FFF56] hover:bg-[#4EE045] text-black"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : 
                    isResetMode ? 'Send Reset Email' : 
                    isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <div className="text-center space-y-2">
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}

                  {!isResetMode && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setFormData({ email: '', password: '', firstName: '', lastName: '' });
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </button>
                    </div>
                  )}

                  {isResetMode && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
