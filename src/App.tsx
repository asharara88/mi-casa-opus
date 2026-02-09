import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DemoProvider, useDemoMode } from "@/contexts/DemoContext";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Architecture = lazy(() => import("./pages/Architecture"));
const MortgageCalculator = lazy(() => import("./pages/MortgageCalculator"));

// Minimal loading spinner for route transitions
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// QueryClient for React Query
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemoBypass } = useDemoMode();
  
  // Allow access if demo bypass is enabled
  if (isDemoBypass) {
    return <>{children}</>;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemoBypass } = useDemoMode();
  
  // If demo bypass, don't redirect to home
  if (isDemoBypass) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem={false}
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </DemoProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
