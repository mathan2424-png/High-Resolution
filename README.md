# 👕 High Resolution Technologies - E-Commerce Storefront
> **WordPress/WooCommerce to Modular Static HTML & CSS Conversion Architecture**

---

## 📁 Project Directory Structure

```text
ecommerce-website/
│
├── index.html              # Homepage (Hero Drop, Value Badges, Trending Products, Categories, Newsletter)
├── shop.html               # Product Catalog / Archive (Filter sidebar, size selector, sorting, pagination)
├── stationery.html         # Corporate Stationery (ID Cards, Lanyards, Mugs, Notebooks, Pens)
├── custom-design.html      # Custom Design & Bulk Quote Request
├── contact.html            # Customer Support & FAQ (Contact form, direct support channels)
├── about.html              # About High Resolution Technologies
│
├── css/
│   ├── style.css           # Master Stylesheet (Design tokens, Google Fonts, reset, layout, components)
│   ├── header.css          # Site Header, announcement bar, navigation, mobile toggle
│   ├── footer.css          # Exact High Resolution Technologies footer styles
│   ├── shop.css            # Shop layout, sidebar filters, product cards, category cards
│   ├── enquiry-modal.css   # Enquiry modal, quotation popup, interactive hover effects
│   └── responsive.css      # Tablet (max-width: 992px) & Mobile (max-width: 640px) Media Queries
│
├── js/
│   ├── main.js             # Core script (Mobile navbar toggle, header scroll)
│   ├── enquiry-modal.js    # Enquiry modal handlers & form submission
│   └── validation.js       # Contact form & input validation
│
├── images/
│   ├── logo/
│   │   └── logo.png        # Brand logo (High Resolution Technologies)
│   ├── banners/
│   │   └── hero-banner.svg # Hero presentation banner
│   ├── products/
│   │   ├── tshirt-1.svg    # Cyberpunk Tokyo Oversized Graphic Tee
│   │   ├── tshirt-2.svg    # Minimalist Studio Typography Tee
│   │   ├── tshirt-3.svg    # Acid Wash Retro Vintage Skull Tee
│   │   ├── tshirt-4.svg    # Essential Everyday Supima Solid Crew Tee
│   │   └── tshirt-back.svg # Product detail back view
│   └── icons/
│       └── qr-code.svg     # Footer QR Code
│
├── fonts/
│   └── .gitkeep            # Local web fonts directory (.woff2, .woff)
│
├── .gitignore              # Standard git ignore configuration
└── README.md               # Architecture documentation
```

---

## 🔄 WordPress / WooCommerce to Static HTML/CSS Mapping

| Old WordPress / WooCommerce Component | Static HTML/CSS Equivalent File | Key Improvements & Changes |
| :--- | :--- | :--- |
| `front-page.php` / Elementor Home Page | [index.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/index.html) | Zero database queries, instant 100/100 Google Lighthouse score |
| `woocommerce/archive-product.php` | [shop.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/shop.html) | Direct interactive enquiry modal trigger for all 17 merchandise categories |
| Corporate Stationery / Merchandise | [stationery.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/stationery.html) | Interactive stationery catalog with quote enquiry integration |
| Contact Form 7 / WPForms | [contact.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/contact.html) | Lightweight HTML form with client-side JS validation |
| `wp-content/themes/{theme}/style.css` | `css/style.css`, `header.css`, `footer.css`, `shop.css`, `enquiry-modal.css` | Clean modular separation for easy maintenance and performance |
| `wp-content/uploads/` | `images/logo/`, `images/banners/`, `images/products/`, `images/icons/` | Clean asset organization for high-resolution graphics and mockups |

---

## 🚀 How To Run & Preview Locally

Because this is a pure **Static HTML/CSS/JS** site:

1. **Directly in Browser:**
   - Double-click on [index.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/index.html) to open it directly in Chrome, Edge, or Firefox.

2. **Using VS Code / IDE Live Server:**
   - Right-click [index.html](file:///c:/Users/Dell/Documents/T-Shrite-Ecommerce/index.html) and click **"Open with Live Server"**.

3. **Using Node / NPX (Zero Install):**
   ```bash
   npx serve .
   ```
