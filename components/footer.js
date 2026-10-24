/**
 * FOOTER COMPONENT (Web Component)
 * File: components/footer.js
 * Description: Reusable site footer with botanical leaf accent, company details, QR code, and address
 */

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer class="site-footer">
        <!-- Botanical Leaf Accent (Bottom-Left as in design) -->
        <div class="footer-leaf-accent" aria-hidden="true">
          <img src="images/footer-leaves.jpg" alt="Botanical leaf accent" class="footer-leaf-img" onerror="this.style.display='none'">
        </div>

        <div class="container footer-content-wrap">
          <div class="footer-grid">
            <!-- Col 1: Brand & About -->
            <div class="footer-col">
              <a href="index.html" class="footer-brand" title="High Resolution Technologies">
                <img src="images/logo/logo.png" alt="High Resolution Technologies" class="footer-brand-logo">
              </a>
              <p>
                High Resolution Technologies delivers premium-quality products with custom branding solutions for businesses, schools and organizations.
              </p>
              <!-- Social Media Links -->
              <div class="footer-social-links">
                <a href="#" class="footer-social-btn" aria-label="Facebook" title="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" class="footer-social-btn" aria-label="Instagram" title="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" class="footer-social-btn" aria-label="LinkedIn" title="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="#" class="footer-social-btn" aria-label="YouTube" title="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#121417"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Col 2: Quick Links -->
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul class="footer-links">
                <li><a href="index.html"><span class="chevron">&#8250;</span> Home</a></li>
                <li><a href="about.html"><span class="chevron">&#8250;</span> About Us</a></li>
                <li><a href="shop.html"><span class="chevron">&#8250;</span> Our Products</a></li>
                <li><a href="stationery.html"><span class="chevron">&#8250;</span> Stationery</a></li>
                <li><a href="custom-design.html"><span class="chevron">&#8250;</span> Custom Design</a></li>
                <li><a href="contact.html"><span class="chevron">&#8250;</span> Contact Us</a></li>
              </ul>
            </div>

            <!-- Col 3: QR Code -->
            <div class="footer-col">
              <h4>QR Code</h4>
              <div class="footer-qr-container">
                <div class="footer-qr-wrap">
                  <img src="images/icons/qr-code.png" alt="High Resolution Technologies QR Code" class="footer-qr-img" onerror="this.src='images/qr-code.png'">
                </div>
                <span class="footer-qr-subtext">Scan to visit our store</span>
              </div>
            </div>

            <!-- Col 4: Contact Us -->
            <div class="footer-col">
              <h4>Contact Us</h4>
              <div class="footer-contact-list">
                <div class="footer-contact-item">
                  <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <span>+91 87544 79888</span>
                </div>
                <div class="footer-contact-item">
                  <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:info@highresolutiontech.com">info@highresolutiontech.com</a>
                </div>
                <div class="footer-contact-item">
                  <svg class="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>H3 Antony pebbles, Mullai nagar,<br>Sankarapuram Extn., Sithalapakkam</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Copyright Bar -->
        <div class="footer-bottom">
          <div class="container footer-bottom-inner">
            <p>&copy; 2026 High Resolution Technologies. All rights reserved.</p>
            <div class="footer-legal-links">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms &amp; Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

// Define the custom element <site-footer>
if (!customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooter);
}
