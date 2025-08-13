// sai-123-stack/pulse-work/pulse-work-3a60247e05301e6a63964fe9c09ab838577cff10/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { Unauthorized } from "@/pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { OtpVerification } from "./pages/OtpVerification"; // Import the new page

const queryClient = new QueryClient();



const AppRoutes = () => {
  const { user } = useAuth();


  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/verify-user" element={<OtpVerification />} /> {/* Add the new route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">User Management</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="tasks" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">Task Management</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="notifications" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">Notifications</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="documents" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">Documents</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="analytics" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">Analytics</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="settings" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-2xl font-bold gradient-text">Settings</h2><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;