/**
 * HEADER COMPONENT (Web Component)
 * File: components/header.js
 * Description: Reusable, responsive site navigation header with active page detection
 */

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initEvents();
  }

  render() {
    // Current page URL detection
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const explicitActive = (this.getAttribute('active') || '').toLowerCase();

    // Determine active menu item
    const isHome = explicitActive === 'home' || (!explicitActive && (pathname.endsWith('/') || pathname.endsWith('/index.html') || pathname.endsWith('t-shrite-ecommerce/') || pathname === ''));
    const isAbout = explicitActive === 'about' || (!explicitActive && pathname.includes('about.html'));
    const isStationery = explicitActive === 'stationery' || (!explicitActive && (pathname.includes('stationery.html') || (pathname.includes('shop.html') && search.includes('cat=stationery'))));
    const isCustom = explicitActive === 'custom' || (!explicitActive && (pathname.includes('custom-design.html') || (pathname.includes('shop.html') && search.includes('cat=custom'))));
    const isShop = explicitActive === 'shop' || (!explicitActive && pathname.includes('shop.html') && !isStationery && !isCustom);
    const isContact = explicitActive === 'contact' || (!explicitActive && pathname.includes('contact.html'));
    const isCart = explicitActive === 'cart' || (!explicitActive && (pathname.includes('cart.html') || pathname.includes('checkout.html')));

    // Get live cart count from localStorage if available
    let cartCount = 2;
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cartCount = parsed.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
      }
    } catch (e) {
      // Fallback default
    }

    this.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="header-wrapper">
            <!-- Brand Logo -->
            <a href="index.html" class="brand-logo" title="High Resolution Technologies">
              <img src="images/logo/logo.png" alt="High Resolution Technologies" class="logo-img">
            </a>

            <!-- Desktop Navigation -->
            <nav class="nav-menu" id="navMenu">
              <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a>
              <a href="about.html" class="nav-link ${isAbout ? 'active' : ''}">About Us</a>
              <a href="shop.html" class="nav-link ${isShop ? 'active' : ''}">Our Products</a>
              <a href="stationery.html" class="nav-link ${isStationery ? 'active' : ''}">Stationery</a>
              <a href="custom-design.html" class="nav-link ${isCustom ? 'active' : ''}">Custom Design</a>
              <a href="contact.html" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
            </nav>

            <!-- Right Header Icons -->
            <div class="header-icons">
              <!-- Search Icon Link -->
              <a href="shop.html" class="icon-btn" title="Search Products" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </a>

              <!-- Cart Icon Link with Badge -->
              <a href="cart.html" class="icon-btn ${isCart ? 'active' : ''}" title="View Cart" aria-label="Cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span class="icon-badge" id="cartCountBadge">${cartCount}</span>
              </a>

              <!-- Mobile Hamburger Menu Button -->
              <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  initEvents() {
    const mobileToggle = this.querySelector('.mobile-toggle');
    const navMenu = this.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('open');
      });

      // Close mobile menu on clicking any navigation link
      navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          navMenu.classList.remove('open');
        }
      });
    }

    // Header elevation on page scroll
    const header = this.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });
  }
}

// Define the custom element <site-header>
if (!customElements.get('site-header')) {
  customElements.define('site-header', SiteHeader);
}
