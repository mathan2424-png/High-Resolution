/**
 * PRODUCTS.JS - PRODUCT CATALOG & GALLERY LOGIC
 * Project: High Resolution Technologies - E-Commerce Storefront
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Product Detail - Thumbnail Image Switcher
  const thumbBtns = document.querySelectorAll('.thumb-btn');
  const mainImage = document.querySelector('#main-product-img');

  if (thumbBtns.length > 0 && mainImage) {
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        thumbBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const img = this.querySelector('img');
        if (img) {
          const newSrc = img.getAttribute('src');
          mainImage.setAttribute('src', newSrc);
        }
      });
    });
  }

  // 2. Product Detail - Size Selection Buttons
  const sizeBtns = document.querySelectorAll('.size-btn');
  if (sizeBtns.length > 0) {
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
});
