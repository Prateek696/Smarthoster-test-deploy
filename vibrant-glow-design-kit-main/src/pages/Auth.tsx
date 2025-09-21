
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Check for password reset errors from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');
    
    if (error === 'access_denied' && errorCode === 'otp_expired') {
      setPasswordResetError('The password reset link has expired. Please request a new one.');
      setIsResetMode(true); // Switch to reset mode to make it easy to request a new link
      
      // Clean up URL parameters
      window.history.replaceState({}, '', '/auth');
    }
  }, [location.search]);

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
        toast.success(t.auth.messages.resetEmailSent);
        setPasswordResetError(null); // Clear any previous error
        setIsResetMode(false);
      } else if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success(t.auth.messages.welcomeBack);
      } else {
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        toast.success(t.auth.messages.accountCreated);
      }
    } catch (error: any) {
      toast.error(error.message || t.auth.messages.somethingWrong);
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
              <svg
                width="28"
                height="24"
                viewBox="0 0 67 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-auto sm:h-8 mr-2 flex-shrink-0"
              >
                <path d="M35.0266 14.7486C36.9557 14.2329 38.5616 12.9916 39.5594 11.2537C40.5573 9.51586 40.8138 7.49153 40.3007 5.56268C39.7875 3.63384 38.5521 2.01055 36.8226 1.00793C35.0931 0.00531467 33.0785 -0.26205 31.1589 0.263131C29.2393 0.778763 27.6238 2.0201 26.626 3.75797C25.6282 5.49584 25.3621 7.52017 25.8753 9.44902C26.3884 11.3779 27.6238 13.0011 29.3533 14.0038C31.0829 15.0064 33.088 15.2738 35.0171 14.7581L35.0266 14.7486Z" fill="#00ACE8"/>
                <path d="M60.6555 29.6186C62.5846 29.1029 64.1906 27.8616 65.1884 26.1237C67.241 22.543 66.0151 17.95 62.4515 15.8779C60.722 14.8753 58.7169 14.608 56.7878 15.1236C54.8587 15.6488 53.2527 16.8901 52.2549 18.6184C50.2023 22.1992 51.4282 26.7922 54.9823 28.8642C56.7118 29.8668 58.7169 30.1438 60.6555 29.6186Z" fill="#0095D5"/>
                <path d="M3.73273 28.8631C5.46226 29.8753 7.47687 30.1331 9.40596 29.6175C11.3255 29.1019 12.941 27.8605 13.9293 26.1227C14.9366 24.3848 15.1932 22.37 14.6706 20.4316C14.1574 18.4932 12.9315 16.8795 11.1925 15.8673C9.47248 14.8647 7.45787 14.5973 5.52878 15.1225C3.59969 15.6381 1.99371 16.889 0.995902 18.6173C0.00760197 20.3552 -0.258479 22.37 0.26418 24.3084C0.777336 26.2468 2.01271 27.8605 3.73273 28.8631Z" fill="#00BDF2"/>
                <path d="M54.9727 58.5858C56.7023 59.598 58.7169 59.8558 60.646 59.3401C62.5656 58.8245 64.1811 57.5832 65.1789 55.8453C66.1767 54.1074 66.4427 52.0927 65.9201 50.1543C65.4069 48.2159 64.181 46.6021 62.442 45.59C60.722 44.5873 58.7074 44.32 56.7783 44.8452C54.8492 45.3608 53.2432 46.6117 52.2549 48.34C51.2571 50.0779 50.991 52.0927 51.5042 54.0311C52.0269 55.9694 53.2527 57.5832 54.9727 58.5858Z" fill="#007FC4"/>
                <path d="M14.6711 50.154C15.1842 52.0924 14.9181 54.1167 13.9298 55.845C12.932 57.5829 11.3165 58.8147 9.39695 59.3399C7.47737 59.8555 5.46275 59.5977 3.73323 58.5951C2.0037 57.5924 0.768327 55.9691 0.255171 54.0403C-0.257985 52.1115 0.00809622 50.0871 1.0059 48.3493C2.0037 46.6114 3.61919 45.37 5.53878 44.8544C7.45836 44.3388 9.47297 44.6061 11.2025 45.5992C12.9225 46.6018 14.1674 48.2156 14.6806 50.154H14.6711Z" fill="#4EC9F5"/>
                <path d="M49.3665 41.7898H41.2415V53.4392H24.9345V41.7898H16.8096L33.088 21.0117L49.3665 41.7898Z" fill="#5FFF56"/>
              </svg>
              <span className="text-xl sm:text-2xl font-bold">
                <span className="text-gray-900">Smart</span>
                <span className="text-[#5FFF56]">Hoster</span>
                <span className="text-black">.io</span>
              </span>
            </Link>
            <Button asChild variant="outline">
              <Link to="/">{t.auth.backToHome}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 67 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
              >
                <path d="M35.0266 14.7486C36.9557 14.2329 38.5616 12.9916 39.5594 11.2537C40.5573 9.51586 40.8138 7.49153 40.3007 5.56268C39.7875 3.63384 38.5521 2.01055 36.8226 1.00793C35.0931 0.00531467 33.0785 -0.26205 31.1589 0.263131C29.2393 0.778763 27.6238 2.0201 26.626 3.75797C25.6282 5.49584 25.3621 7.52017 25.8753 9.44902C26.3884 11.3779 27.6238 13.0011 29.3533 14.0038C31.0829 15.0064 33.088 15.2738 35.0171 14.7581L35.0266 14.7486Z" fill="#00ACE8"/>
                <path d="M60.6555 29.6186C62.5846 29.1029 64.1906 27.8616 65.1884 26.1237C67.241 22.543 66.0151 17.95 62.4515 15.8779C60.722 14.8753 58.7169 14.608 56.7878 15.1236C54.8587 15.6488 53.2527 16.8901 52.2549 18.6184C50.2023 22.1992 51.4282 26.7922 54.9823 28.8642C56.7118 29.8668 58.7169 30.1438 60.6555 29.6186Z" fill="#0095D5"/>
                <path d="M3.73273 28.8631C5.46226 29.8753 7.47687 30.1331 9.40596 29.6175C11.3255 29.1019 12.941 27.8605 13.9293 26.1227C14.9366 24.3848 15.1932 22.37 14.6706 20.4316C14.1574 18.4932 12.9315 16.8795 11.1925 15.8673C9.47248 14.8647 7.45787 14.5973 5.52878 15.1225C3.59969 15.6381 1.99371 16.889 0.995902 18.6173C0.00760197 20.3552 -0.258479 22.37 0.26418 24.3084C0.777336 26.2468 2.01271 27.8605 3.73273 28.8631Z" fill="#00BDF2"/>
                <path d="M54.9727 58.5858C56.7023 59.598 58.7169 59.8558 60.646 59.3401C62.5656 58.8245 64.1811 57.5832 65.1789 55.8453C66.1767 54.1074 66.4427 52.0927 65.9201 50.1543C65.4069 48.2159 64.181 46.6021 62.442 45.59C60.722 44.5873 58.7074 44.32 56.7783 44.8452C54.8492 45.3608 53.2432 46.6117 52.2549 48.34C51.2571 50.0779 50.991 52.0927 51.5042 54.0311C52.0269 55.9694 53.2527 57.5832 54.9727 58.5858Z" fill="#007FC4"/>
                <path d="M14.6711 50.154C15.1842 52.0924 14.9181 54.1167 13.9298 55.845C12.932 57.5829 11.3165 58.8147 9.39695 59.3399C7.47737 59.8555 5.46275 59.5977 3.73323 58.5951C2.0037 57.5924 0.768327 55.9691 0.255171 54.0403C-0.257985 52.1115 0.00809622 50.0871 1.0059 48.3493C2.0037 46.6114 3.61919 45.37 5.53878 44.8544C7.45836 44.3388 9.47297 44.6061 11.2025 45.5992C12.9225 46.6018 14.1674 48.2156 14.6806 50.154H14.6711Z" fill="#4EC9F5"/>
                <path d="M49.3665 41.7898H41.2415V53.4392H24.9345V41.7898H16.8096L33.088 21.0117L49.3665 41.7898Z" fill="#5FFF56"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.auth.title}</h1>
            <p className="text-gray-600">{t.auth.subtitle}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isResetMode ? t.auth.resetPassword : isLogin ? t.auth.welcomeBack : t.auth.createAccount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Password Reset Error Message */}
              {passwordResetError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
                  <AlertCircle size={20} />
                  <span className="text-sm">{passwordResetError}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isResetMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder={t.auth.firstName}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      type="text"
                      placeholder={t.auth.lastName}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                )}

                <Input
                  type="email"
                  placeholder={t.auth.email}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                {!isResetMode && (
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.auth.password}
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
                  {loading ? t.auth.pleaseWait : 
                    isResetMode ? t.auth.sendResetEmail : 
                    isLogin ? t.auth.signIn : t.auth.signUp}
                </Button>

                <div className="text-center space-y-2">
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  )}

                  {!isResetMode && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setFormData({ email: '', password: '', firstName: '', lastName: '' });
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {isLogin ? t.auth.signUpLink : t.auth.signInLink}
                      </button>
                    </div>
                  )}

                  {isResetMode && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t.auth.backToSignIn}
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
