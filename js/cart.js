/**
 * CART.JS - SHOPPING CART LOGIC & QUANTITY CONTROLS
 * Project: High Resolution Technologies - E-Commerce Storefront
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Quantity Buttons (+ / -) in Cart & Product Page
  const qtyWrappers = document.querySelectorAll('.qty-input-wrap');

  qtyWrappers.forEach(wrap => {
    const decBtn = wrap.querySelector('.qty-btn:first-child, #qty-decrease');
    const incBtn = wrap.querySelector('.qty-btn:last-child, #qty-increase');
    const input = wrap.querySelector('.qty-input');

    if (decBtn && incBtn && input) {
      decBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        if (val > 1) {
          input.value = val - 1;
          updateCartTotals();
        }
      });

      incBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        input.value = val + 1;
        updateCartTotals();
      });
    }
  });

  // 2. Remove Item from Cart Table
  const removeButtons = document.querySelectorAll('.cart-table button[title="Remove Item"]');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      if (row) {
        row.remove();
        updateCartTotals();
      }
    });
  });

  // 3. Coupon Code Application Feedback
  const couponBtn = document.querySelector('.btn-outline[type="button"]');
  const couponInput = document.querySelector('input[placeholder*="Coupon code"]');

  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) {
        alert('Please enter a coupon code.');
        return;
      }
      if (code === 'FREESHIP') {
        alert('Coupon "FREESHIP" applied successfully! You unlocked FREE express shipping.');
      } else {
        alert(`Coupon "${code}" applied! You received a 10% discount.`);
      }
    });
  }

  function updateCartTotals() {
    // Dynamic recalculation placeholder
    console.log('Cart updated.');
  }
});
