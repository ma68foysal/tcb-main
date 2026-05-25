// Combined vendor JavaScript for The Conscious Bar
// This file is intended to combine frequently used vendor scripts to reduce HTTP requests

// Placeholder for future vendor script combinations
// Currently using CDN versions for jQuery and Slick for better caching

// Performance optimization utilities
function loadScriptAsync(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (callback) {
    script.onload = callback;
  }
  document.head.appendChild(script);
}

// Optimize third-party script loading
function optimizeThirdPartyScripts() {
  // Add any third-party script optimizations here
  if (typeof window !== 'undefined') {
    // Defer non-critical scripts
    window.addEventListener('load', function() {
      // Load non-critical scripts after page load
    });
  }
}

// Initialize optimizations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizeThirdPartyScripts);
} else {
  optimizeThirdPartyScripts();
}

//# sourceMappingURL=combined-vendor.js.map