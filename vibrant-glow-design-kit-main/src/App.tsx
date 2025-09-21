
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import PortalLayout from "@/components/portal/PortalLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import LearnMore from "./pages/LearnMore";
import Integrations from "./pages/Integrations";
import EnhancedDirectBookings from "./pages/EnhancedDirectBookings";
import FullServiceManagement from "./pages/FullServiceManagement";
import GreenPledge from "./pages/GreenPledge";
import LocalExpertise from "./pages/LocalExpertise";
import IncomeStrategy from "./pages/IncomeStrategy";
import AdvancedAutomation from "./pages/AdvancedAutomation";
import LegalCompliance from "./pages/LegalCompliance";
import AutomatedBilling from "./pages/AutomatedBilling";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import AuthReset from "./pages/AuthReset";
import Pricing from "./pages/Pricing";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";
import CookiePolicy from "./pages/CookiePolicy";
import GdprCompliance from "./pages/GdprCompliance";
import SecurityPolicy from "./pages/SecurityPolicy";
import Blog from "./pages/Blog";
import Learn from "./pages/Learn";
import Jobs from "./pages/Jobs";
import AdminContentGenerator from "./pages/AdminContentGenerator";
import AdminContentDashboard from "./pages/AdminContentDashboard";
import AdminContentEditor from "./pages/AdminContentEditor";
import TagPage from "./pages/TagPage";
import AuthorPage from "./pages/AuthorPage";
import Posts from "./pages/api/Posts";
import Start from "./pages/Start";
import Contact from "./pages/Contact";
import { LearnContentGenerator } from "./components/LearnContentGenerator";
import { generateSitemap } from "./utils/sitemapGenerator";

const queryClient = new QueryClient();

// Component to handle scroll to top and Google Analytics on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    
    // Send page view to Google Analytics
    ReactGA.send({ hitType: "pageview", page: pathname });
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/enhanced-direct-bookings" element={<EnhancedDirectBookings />} />
              <Route path="/full-service-management" element={<FullServiceManagement />} />
              <Route path="/green-pledge" element={<GreenPledge />} />
              <Route path="/local-expertise" element={<LocalExpertise />} />
              <Route path="/income-strategy" element={<IncomeStrategy />} />
              <Route path="/advanced-automation" element={<AdvancedAutomation />} />
              <Route path="/legal-compliance" element={<LegalCompliance />} />
              <Route path="/automated-billing" element={<AutomatedBilling />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/security-policy" element={<SecurityPolicy />} />
              <Route path="/jobs" element={<Jobs />} />
              
              {/* English Blog Routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              
              {/* Portuguese Blog Routes */}
              <Route path="/pt/blog" element={<Blog />} />
              <Route path="/pt/blog/:slug" element={<Blog />} />
              
              {/* French Blog Routes */}
              <Route path="/fr/blog" element={<Blog />} />
              <Route path="/fr/blog/:slug" element={<Blog />} />
              
              {/* Tag Pages */}
              <Route path="/tags/:tagName" element={<TagPage />} />
              <Route path="/pt/tags/:tagName" element={<TagPage />} />
              <Route path="/fr/tags/:tagName" element={<TagPage />} />
              
              {/* Author Pages */}
              <Route path="/authors/:authorSlug" element={<AuthorPage />} />
              <Route path="/pt/authors/:authorSlug" element={<AuthorPage />} />
              <Route path="/fr/authors/:authorSlug" element={<AuthorPage />} />
              
              {/* API Routes */}
              <Route path="/api/posts" element={<Posts />} />
              
              {/* English Learn Routes */}
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:slug" element={<Learn />} />
              
              {/* Portuguese Learn Routes */}
              <Route path="/pt/learn" element={<Learn />} />
              <Route path="/pt/learn/:slug" element={<Learn />} />
              
              {/* French Learn Routes */}
              <Route path="/fr/learn" element={<Learn />} />
              <Route path="/fr/learn/:slug" element={<Learn />} />
              
              <Route path="/start" element={<Start />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset" element={<AuthReset />} />
              <Route path="/portal" element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Portal />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminContentDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/content-generator" element={
                <AdminRoute>
                  <AdminContentGenerator />
                </AdminRoute>
              } />
              <Route path="/admin/content-dashboard" element={
                <AdminRoute>
                  <AdminContentDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/content-edit/:id" element={
                <AdminRoute>
                  <AdminContentEditor />
                </AdminRoute>
              } />
              <Route path="/admin/generate-learn" element={
                <AdminRoute>
                  <div className="min-h-screen bg-background py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Generate Learn Content</h1>
                        <p className="text-muted-foreground">
                          Generate multilingual /learn content for the Algarve rental market
                        </p>
                      </div>
                      <LearnContentGenerator />
                    </div>
                  </div>
                </AdminRoute>
              } />
              
              <Route path="/gdpr-compliance" element={<GdprCompliance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
