"use client";

import { useState, useEffect } from "react";

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes("android-app://");
      setIsPWA(!!isStandalone);
    };

    checkPWA();
    
    // Listen for changes (though unlikely during a session, good practice)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isPWA;
}
