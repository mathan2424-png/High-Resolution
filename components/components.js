/**
 * MASTER COMPONENTS LOADER
 * File: components/components.js
 * Description: Bundles and registers <site-header> and <site-footer> custom elements
 */

// Import / load Header & Footer components
(function() {
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // If running in browser where header.js or footer.js is needed
  if (!customElements.get('site-header')) {
    const headerScript = document.createElement('script');
    headerScript.src = 'components/header.js';
    document.head.appendChild(headerScript);
  }

  if (!customElements.get('site-footer')) {
    const footerScript = document.createElement('script');
    footerScript.src = 'components/footer.js';
    document.head.appendChild(footerScript);
  }
})();
