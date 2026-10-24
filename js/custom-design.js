/**
 * CUSTOM-DESIGN.JS - HIGH RESOLUTION TECHNOLOGIES
 * Logic strictly for the Custom Design fields from the screenshot
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Star Rating Selector
  const starPicker = document.getElementById('starPicker');
  const ratingInput = document.getElementById('ratingValue');
  const starItems = document.querySelectorAll('.star-pick-item');

  if (starPicker && ratingInput) {
    starItems.forEach((star, index) => {
      // Hover effect
      star.addEventListener('mouseenter', () => {
        highlightStars(index + 1);
      });

      // Click selection
      star.addEventListener('click', () => {
        const rating = index + 1;
        ratingInput.value = rating;
        setSelectedStars(rating);
      });
    });

    starPicker.addEventListener('mouseleave', () => {
      const current = parseInt(ratingInput.value, 10) || 0;
      setSelectedStars(current);
    });

    function highlightStars(count) {
      starItems.forEach((s, idx) => {
        if (idx < count) {
          s.classList.add('hovered');
          s.textContent = '★';
        } else {
          s.classList.remove('hovered');
          s.textContent = '☆';
        }
      });
    }

    function setSelectedStars(count) {
      starItems.forEach((s, idx) => {
        s.classList.remove('hovered');
        if (idx < count) {
          s.classList.add('selected');
          s.textContent = '★';
        } else {
          s.classList.remove('selected');
          s.textContent = '☆';
        }
      });
    }
  }

  // 2. Strict Senior-Developer Validation on Add Review Form
  const reviewForm = document.getElementById('cdReviewForm');
  const nameInput = document.getElementById('reviewName');
  const emailInput = document.getElementById('reviewEmail');
  const reviewTextInput = document.getElementById('reviewText');
  const successBanner = document.getElementById('reviewSuccessBanner');

  // Real-time restriction: Name letters only
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, '');
      if (nameInput.value.trim().length >= 2) {
        clearError('reviewName');
      }
    });
  }

  // Real-time email validation
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (emailPattern.test(emailInput.value.trim())) {
        clearError('reviewEmail');
      }
    });
  }

  // Real-time review text
  if (reviewTextInput) {
    reviewTextInput.addEventListener('input', () => {
      if (reviewTextInput.value.trim().length >= 3) {
        clearError('reviewText');
      }
    });
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    const err = document.getElementById('error-' + id);
    if (el) el.classList.add('is-invalid');
    if (err) {
      if (msg) err.textContent = msg;
      err.classList.add('visible');
    }
  }

  function clearError(id) {
    const el = document.getElementById(id);
    const err = document.getElementById('error-' + id);
    if (el) el.classList.remove('is-invalid');
    if (err) err.classList.remove('visible');
  }

  // Form Submit Handler
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Rating Check
      const rating = parseInt(ratingInput.value, 10);
      if (!rating || rating < 1) {
        showError('ratingValue', 'Please select a star rating (1 to 5 stars)');
        isValid = false;
      } else {
        clearError('ratingValue');
      }

      // Review Text Check
      const reviewVal = reviewTextInput ? reviewTextInput.value.trim() : '';
      if (!reviewVal || reviewVal.length < 3) {
        showError('reviewText', 'Please write your review (minimum 3 characters)');
        isValid = false;
      } else {
        clearError('reviewText');
      }

      // Name Check (Letters only, min 2)
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2 || !/^[a-zA-Z\s]+$/.test(nameVal)) {
        showError('reviewName', 'Please enter a valid name (letters only, min 2 characters)');
        isValid = false;
      } else {
        clearError('reviewName');
      }

      // Email Check (@ and domain)
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailVal || !emailVal.includes('@') || !emailPattern.test(emailVal)) {
        showError('reviewEmail', 'Please enter a valid email address (e.g. name@example.com)');
        isValid = false;
      } else {
        clearError('reviewEmail');
      }

      if (!isValid) return;

      // Submit feedback animation
      const submitBtn = document.getElementById('btnSubmitReview');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SUBMITTING...';
      }

      setTimeout(() => {
        if (successBanner) {
          successBanner.classList.add('visible');
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'SUBMITTED!';
          submitBtn.style.background = '#10b981';
        }
        reviewForm.reset();
        if (ratingInput) ratingInput.value = '0';
        starItems.forEach(s => {
          s.classList.remove('selected', 'hovered');
          s.textContent = '☆';
        });
      }, 600);
    });
  }

  // 3. Share Design Button - Copy Link & Toast
  const btnShare = document.getElementById('btnShareDesign');
  const toastEl = document.getElementById('cdToast');
  if (btnShare) {
    btnShare.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      if (toastEl) {
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 3000);
      }
    });
  }

  // 4. Customize & ADD TO QUOTE Modal Dialogs
  const btnCustomize = document.getElementById('btnCustomize');
  const btnAddToQuote = document.getElementById('btnAddToQuote');
  const modalOverlay = document.getElementById('cdModalOverlay');
  const modalTitle = document.getElementById('cdModalTitle');
  const modalBody = document.getElementById('cdModalBody');
  const modalClose = document.getElementById('cdModalClose');

  if (btnCustomize && modalOverlay) {
    btnCustomize.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalTitle) modalTitle.textContent = 'CUSTOMIZE YOUR DESIGN';
      if (modalBody) {
        modalBody.innerHTML = `
          <p style="color:#475569; font-size:0.95rem; line-height:1.6; margin-bottom:1.25rem;">
            You can customize this product with your custom logo, text embroidery, or screen print graphic!
          </p>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem;">
            <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">Direct Sivakasi & Tirupur Facility:</div>
            <div style="font-size:0.88rem; color:#64748b; line-height:1.5;">
              • High-density Screen Printing<br>
              • Thread Embroidery on Polo & Round Neck<br>
              
            </div>
          </div>
          <a href="contact.html" class="btn-cd-customize" style="text-decoration:none; text-align:center;">
            Contact Design Team for Mockup
          </a>
        `;
      }
      modalOverlay.classList.add('active');
    });
  }

  if (btnAddToQuote && modalOverlay) {
    btnAddToQuote.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalTitle) modalTitle.textContent = 'ADD TO QUOTE';
      if (modalBody) {
        modalBody.innerHTML = `
          <p style="color:#475569; font-size:0.95rem; line-height:1.6; margin-bottom:1.25rem;">
            <strong>Custom Design</strong> has been added to your quote list! Connect with our wholesale sales desk for volume factory pricing.
          </p>
          <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:12px; padding:1rem 1.25rem; color:#065f46; font-size:0.9rem; font-weight:600; margin-bottom:1.5rem; display:flex; align-items:center; gap:8px;">
            <span>✓</span> Product added to your quotation request.
          </div>
          <a href="contact.html" class="btn-cd-quote" style="text-decoration:none; width:100%; text-align:center; display:flex;">
            Request Official B2B Quote
          </a>
        `;
      }
      modalOverlay.classList.add('active');
    });
  }

  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
});
