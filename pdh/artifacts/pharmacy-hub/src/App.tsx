import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ToolPlaceholder from "@/pages/tool-placeholder";
import PilSearch from "@/pages/pil-search";
import PilPrinterComingSoon from "@/pages/pil-printer-coming-soon";
import { PilUpdateProvider } from "@/context/PilUpdateContext";
import { PilUpdateFloatingPanel } from "@/components/pil/PilUpdateFloatingPanel";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools/pils/pil-search" component={PilSearch} />
      <Route path="/tools/pils/pil-printer" component={PilPrinterComingSoon} />
      {/* Legacy redirect-style routes */}
      <Route path="/tools/pil-printer" component={PilSearch} />
      <Route path="/tools/prednisolone-calculator">
        {() => (
          <ToolPlaceholder toolName="Prednisolone Reducing Regimen Calculator" />
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
        <PilUpdateProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <PilUpdateFloatingPanel />
        </PilUpdateProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
