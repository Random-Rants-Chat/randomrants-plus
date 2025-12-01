// Mobile Viewport Height Fix
// Handles iOS Safari and other mobile browsers that don't properly handle 100vh
// Uses dynamic viewport height (dvh) CSS unit, with JavaScript fallback for older browsers

function fixMobileViewportHeight() {
  // Check if browser supports dvh (dynamic viewport height)
  const supportsDVH = CSS.supports("height", "100dvh");
  
  if (!supportsDVH) {
    // Fallback for older browsers - calculate viewport height in pixels
    const updateViewportHeight = function() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", vh + "px");
    };

    // Initial call
    updateViewportHeight();

    // Update on resize and orientation change
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    // Update on scroll (iOS address bar hides/shows)
    window.addEventListener("scroll", updateViewportHeight);
  }

  // Additional fix for iOS: prevent zoom on input focus
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    );
  }
}

// Run on DOMContentLoaded to ensure meta tags are present
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fixMobileViewportHeight);
} else {
  fixMobileViewportHeight();
}

module.exports = fixMobileViewportHeight;
