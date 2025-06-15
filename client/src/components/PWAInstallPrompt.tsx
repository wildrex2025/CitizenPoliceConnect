import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone, Zap } from "lucide-react";
import { installPWA, isStandalone } from "@/utils/pwa";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Show install prompt if not already installed and not standalone
    const checkInstallability = () => {
      if (!isStandalone() && !localStorage.getItem('pwa-install-dismissed')) {
        setShowPrompt(true);
      }
    };

    // Check on load and when beforeinstallprompt fires
    checkInstallability();
    
    window.addEventListener('beforeinstallprompt', checkInstallability);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallability);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      
      if (success) {
        setShowPrompt(false);
        localStorage.setItem('pwa-installed', 'true');
      } else {
        // Fallback for browsers that don't support beforeinstallprompt
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          alert('To install this app on iOS: tap Share button and then "Add to Home Screen"');
        } else {
          alert('Please use your browser\'s menu to install this app');
        }
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install TrafficGuard Pro</h3>
            <p className="text-xs text-blue-100 mt-1">
              Get instant access with offline capabilities and push notifications
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 text-xs h-8"
              >
                {isInstalling ? (
                  <>
                    <Zap className="h-3 w-3 mr-1 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Install App
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 text-xs h-8"
              >
                Not Now
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="flex-shrink-0 text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}