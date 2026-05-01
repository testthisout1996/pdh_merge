import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ToolPlaceholder from "@/pages/tool-placeholder";
import PilSearch from "@/pages/pil-search";
import PilPrinterComingSoon from "@/pages/pil-printer-coming-soon";
import Profile from "@/pages/Profile";
import { PilUpdateProvider } from "@/context/PilUpdateContext";
import { PilUpdateFloatingPanel } from "@/components/pil/PilUpdateFloatingPanel";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginModal } from "@/components/LoginModal";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />

      {/* /login redirects to home — modal handles login now */}
      <Route path="/login">
        {() => <Redirect to="/" />}
      </Route>

      {/* /admin redirects to /profile */}
      <Route path="/admin">
        {() => <Redirect to="/profile" />}
      </Route>

      {/* Profile & Settings — all authenticated users */}
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>

      {/* Protected tools */}
      <Route path="/tools/pils/pil-search">
        {() => (
          <ProtectedRoute>
            <PilSearch />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/tools/pils/pil-printer">
        {() => (
          <ProtectedRoute>
            <PilPrinterComingSoon />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/tools/pil-printer">
        {() => (
          <ProtectedRoute>
            <PilSearch />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/tools/prednisolone-calculator">
        {() => (
          <ProtectedRoute>
            <ToolPlaceholder toolName="Prednisolone Reducing Regimen Calculator" />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PilUpdateProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <PilUpdateFloatingPanel />
            <LoginModal />
          </PilUpdateProvider>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
