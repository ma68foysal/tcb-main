import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/+esm';

// Respect user's accessibility preferences
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // CRITICAL FIX: Disable native smooth scroll which conflicts with Lenis
  const style = document.createElement('style');
  style.innerHTML = `
    html, body { scroll-behavior: auto !important; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-stopped { overflow: hidden; }
    .lenis.lenis-scrolling iframe { pointer-events: none; }
  `;
  document.head.appendChild(style);

  // Add Lenis classes to html/body
  document.documentElement.classList.add('lenis', 'lenis-smooth');

  // 1. Force manual scroll restoration to prevent browser jumping
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const lenis = new Lenis({
    // Studio Freight Standard Defaults
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    autoResize: true,
    // Prevent Lenis from affecting cart drawer and other scrollable areas
    prevent: (node) => {
      // Check if the node or any parent is the cart drawer or has data-lenis-prevent
      if (node.hasAttribute('data-lenis-prevent')) return true;

      // Exclude cart drawer and its children
      if (node.closest('.cart-drawer, #cart-drawer, cart-drawer')) return true;

      // Exclude any drawer elements
      if (node.closest('.drawer')) return true;

      // Exclude modal/dialog elements
      if (node.closest('[role="dialog"], dialog, .modal')) return true;

      // Exclude product list dropdown
      if (node.closest('.product_list_item, productlist-dropdown')) return true;

      return false;
    }
  });

  // Animation frame loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose to window for debugging
  window.lenis = lenis;
  
  // 2. Link Prefetching for "Instant" Navigation Feel
  // Prefetch pages on hover to make the View Transition seamless
  document.addEventListener('mouseover', (e) => {
    try {
      const link = e.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
        const alreadyPrefetched = document.querySelector(`link[rel="prefetch"][href="${link.href}"]`);
        if (!alreadyPrefetched) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = link.href;
          document.head.appendChild(prefetchLink);
        }
      }
    } catch (err) {
      // Silently fail for cross-origin or invalid targets
    }
  });

  console.log('Lenis + Prefetch initialized');
}
