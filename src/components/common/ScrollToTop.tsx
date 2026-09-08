import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that automatically scrolls the window 
 * (and any main scroll containers) to top on route change.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    // Also reset scroll for documentElement and body
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Scroll any custom main scrollable containers if present
    const mainContainers = document.querySelectorAll("main, .overflow-y-auto");
    mainContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
