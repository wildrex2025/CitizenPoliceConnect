import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { useEffect } from "react";
import { registerServiceWorker, initializeInstallPrompt, requestNotificationPermission } from "@/utils/pwa";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/home";
import WomenSafety from "@/pages/women-safety";
import ChildSafety from "@/pages/child-safety";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import EmergencySOS from "@/pages/emergency-sos";
import TrafficGuard from "@/pages/traffic-guard";
import TrafficAccidentReporting from "@/pages/traffic-accident-reporting";
import RealTimeTrafficMonitor from "@/pages/real-time-traffic-monitor";
import VehicleTracking from "@/pages/vehicle-tracking";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/women-safety" component={WomenSafety} />
      <Route path="/child-safety" component={ChildSafety} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/emergency" component={EmergencySOS} />
      <Route path="/traffic-guard" component={TrafficGuard} />
      <Route path="/traffic-accidents" component={TrafficAccidentReporting} />
      <Route path="/traffic-monitor" component={RealTimeTrafficMonitor} />
      <Route path="/vehicle-tracking" component={VehicleTracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize PWA functionality
    registerServiceWorker();
    initializeInstallPrompt();
    requestNotificationPermission();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Navigation />
          <Toaster />
          <Router />
          <PWAInstallPrompt />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
