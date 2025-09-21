
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfileLoading(false);
        return null;
      }
      
      console.log('Profile data fetched:', data);
      console.log('User role is:', data.role);
      console.log('Is admin?', data.role === 'admin');
      
      // Set the profile state immediately
      setProfile(data);
      setProfileLoading(false);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfileLoading(false);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user logs in
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile for initial session
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    // Use the correct redirect URL based on environment
    const getRedirectUrl = () => {
      // For localhost development, use localhost
      if (window.location.hostname === 'localhost') {
        return `${window.location.origin}/auth/reset`;
      }
      // For Lovable preview URLs, use the preview URL
      if (window.location.hostname.includes('.lovableproject.com')) {
        return `${window.location.origin}/auth/reset`;
      }
      // For production, always use smarthoster.io
      return 'https://www.smarthoster.io/auth/reset';
    };
    
    const redirectUrl = getRedirectUrl();
    console.log('Password reset redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      profileLoading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
