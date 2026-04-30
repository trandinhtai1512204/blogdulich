import * as React from "react";

/**
 * Minimal `useIsMobile` hook to satisfy UI components.
 * Uses a media query (<= 768px).
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Fallback for older browsers
    (mql as any).addListener(onChange);
    return () => (mql as any).removeListener(onChange);
  }, []);

  return isMobile;
}

