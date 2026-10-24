/**
 * High Resolution Technologies - Enquiry Modal Controller
 * Enhanced with Strict Validation:
 * - Name fields: Allow ONLY alphabets & spaces
 * - Email field: Mandatory, must contain '@' and valid domain format
 * - Phone field: Mandatory, exactly 10 digits & valid mobile number (starting with 6, 7, 8, 9)
 * - Message field: Mandatory, minimum 5 characters
 */

(function () {
  'use strict';

  let activeOverlay = null;

  // Validation Rules
  const ValidationRules = {
    isValidName(name) {
      const trimmed = (name || '').trim();
      return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmed);
    },

    isValidLastName(name) {
      const trimmed = (name || '').trim();
      if (trimmed === '') return true; // Last name is optional
      return trimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmed);
    },

    isValidEmail(email) {
      const trimmed = (email || '').trim();
      // Must contain '@' and a valid domain format with at least 2 characters TLD
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
    },

    isValidPhone(phone) {
      const cleanDigits = (phone || '').replace(/\D/g, '');
      // Must be exactly 10 digits and start with 6, 7, 8, or 9
      return cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits);
    },

    isValidMessage(msg) {
      const trimmed = (msg || '').trim();
      return trimmed.length >= 5;
    }
  };

  // UI Error Helpers
  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(inputEl, errorEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    if (inputEl.value.trim() !== '') {
      inputEl.classList.add('is-valid');
    } else {
      inputEl.classList.remove('is-valid');
    }
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  function resetAllValidation(form) {
    if (!form) return;
    form.querySelectorAll('.enquiry-input, .enquiry-textarea').forEach(el => {
      el.classList.remove('is-invalid', 'is-valid');
    });
    form.querySelectorAll('.form-error-msg').forEach(el => {
      el.classList.remove('visible');
    });
  }

  // Open modal with specific product details
  window.openEnquiryModal = function (productName, productImg) {
    const overlay = document.getElementById('enquiryModalOverlay');
    if (!overlay) return;

    activeOverlay = overlay;
    const titleSpan = document.getElementById('enquiryProductTitle');
    const previewName = document.getElementById('enquiryPreviewName');
    const previewImg = document.getElementById('enquiryPreviewImg');
    const hiddenProductInput = document.getElementById('enquiryProductInput');
    const formView = document.getElementById('enquiryFormView');
    const successView = document.getElementById('enquirySuccessView');
    const form = document.getElementById('productEnquiryForm');

    // Reset views and validation
    if (form) {
      form.reset();
      resetAllValidation(form);
    }
    if (formView) formView.style.display = 'block';
    if (successView) successView.style.display = 'none';

    // Populate product information
    const cleanName = (productName || 'Product').toUpperCase();
    if (titleSpan) titleSpan.textContent = cleanName;
    if (previewName) previewName.textContent = cleanName;
    if (hiddenProductInput) hiddenProductInput.value = cleanName;

    if (previewImg) {
      previewImg.src = productImg || 'images/Stationery/Calculator.png';
      previewImg.alt = cleanName;
    }

    // Show modal & prevent background scrolling
    overlay.classList.add('active');
    document.body.classList.add('modal-open');

    // Focus on first input for accessibility
    setTimeout(() => {
      const firstInput = document.getElementById('enquiryFirstName');
      if (firstInput) firstInput.focus();
    }, 150);
  };

  // Close modal
  window.closeEnquiryModal = function () {
    const overlay = document.getElementById('enquiryModalOverlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    activeOverlay = null;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('enquiryModalOverlay');
    const closeBtn = document.getElementById('closeEnquiryModal');
    const doneBtn = document.getElementById('enquiryDoneBtn');
    const form = document.getElementById('productEnquiryForm');

    // Form Inputs
    const firstNameInput = document.getElementById('enquiryFirstName');
    const lastNameInput = document.getElementById('enquiryLastName');
    const emailInput = document.getElementById('enquiryEmail');
    const phoneInput = document.getElementById('enquiryPhone');
    const messageInput = document.getElementById('enquiryMessage');

    // Error Message Elements
    const errorFirstName = document.getElementById('errorFirstName');
    const errorLastName = document.getElementById('errorLastName');
    const errorEmail = document.getElementById('errorEmail');
    const errorPhone = document.getElementById('errorPhone');
    const errorMessage = document.getElementById('errorMessage');

    // =========================================================================
    // Real-Time Input Restriction & Live Validation
    // =========================================================================

    // 1. First Name: Allow ONLY letters and spaces
    if (firstNameInput) {
      firstNameInput.addEventListener('input', function () {
        // Strip out any numbers or special characters immediately as typed
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');

        if (ValidationRules.isValidName(this.value)) {
          clearFieldError(this, errorFirstName);
        }
      });

      firstNameInput.addEventListener('blur', function () {
        if (!ValidationRules.isValidName(this.value)) {
          setFieldError(this, errorFirstName, 'Please enter a valid first name (letters only, min 2 characters)');
        } else {
          clearFieldError(this, errorFirstName);
        }
      });
    }

    // 2. Last Name: Allow ONLY letters and spaces (optional)
    if (lastNameInput) {
      lastNameInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');

        if (ValidationRules.isValidLastName(this.value)) {
          clearFieldError(this, errorLastName);
        }
      });

      lastNameInput.addEventListener('blur', function () {
        if (this.value.trim() !== '' && !ValidationRules.isValidLastName(this.value)) {
          setFieldError(this, errorLastName, 'Please enter only letters for last name');
        } else {
          clearFieldError(this, errorLastName);
        }
      });
    }

    // 3. Email: Must be valid email with @ and domain
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (ValidationRules.isValidEmail(this.value)) {
          clearFieldError(this, errorEmail);
        }
      });

      emailInput.addEventListener('blur', function () {
        const val = this.value.trim();
        if (!val) {
          setFieldError(this, errorEmail, 'Email address is required');
        } else if (!val.includes('@')) {
          setFieldError(this, errorEmail, "Email must contain an '@' sign (e.g. name@company.com)");
        } else if (!ValidationRules.isValidEmail(val)) {
          setFieldError(this, errorEmail, 'Please enter a complete and valid email address (e.g. name@company.com)');
        } else {
          clearFieldError(this, errorEmail);
        }
      });
    }

    // 4. Phone: Allow ONLY 10 digits and valid mobile number (starting with 6, 7, 8, 9)
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        // Strip out any non-numeric characters and cap strictly at 10 digits
        this.value = this.value.replace(/\D/g, '').slice(0, 10);

        if (ValidationRules.isValidPhone(this.value)) {
          clearFieldError(this, errorPhone);
        }
      });

      phoneInput.addEventListener('blur', function () {
        const val = this.value.trim();
        if (!val) {
          setFieldError(this, errorPhone, 'Mobile phone number is required');
        } else if (val.length < 10) {
          setFieldError(this, errorPhone, `Please enter a full 10-digit mobile number (${val.length}/10 entered)`);
        } else if (!/^[6-9]/.test(val)) {
          setFieldError(this, errorPhone, 'Please enter a valid mobile number ');
        } else if (!ValidationRules.isValidPhone(val)) {
          setFieldError(this, errorPhone, 'Please enter a valid 10-digit mobile number');
        } else {
          clearFieldError(this, errorPhone);
        }
      });
    }

    // 5. Message: Minimum 5 characters
    if (messageInput) {
      messageInput.addEventListener('input', function () {
        if (ValidationRules.isValidMessage(this.value)) {
          clearFieldError(this, errorMessage);
        }
      });

      messageInput.addEventListener('blur', function () {
        if (!ValidationRules.isValidMessage(this.value)) {
          setFieldError(this, errorMessage, 'Please enter your enquiry (minimum 5 characters)');
        } else {
          clearFieldError(this, errorMessage);
        }
      });
    }

    // =========================================================================
    // Close & Dialog Handlers
    // =========================================================================

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.closeEnquiryModal();
      });
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.closeEnquiryModal();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.closeEnquiryModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
        window.closeEnquiryModal();
      }
    });

    // =========================================================================
    // Form Submit Handler with Comprehensive Validation Check
    // =========================================================================

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        let firstInvalidField = null;

        // Validate First Name
        const firstNameVal = firstNameInput ? firstNameInput.value.trim() : '';
        if (!ValidationRules.isValidName(firstNameVal)) {
          setFieldError(firstNameInput, errorFirstName, 'Please enter a valid first name (letters only, min 2 characters)');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = firstNameInput;
        } else {
          clearFieldError(firstNameInput, errorFirstName);
        }

        // Validate Last Name (optional, but if present must be letters)
        const lastNameVal = lastNameInput ? lastNameInput.value.trim() : '';
        if (lastNameVal !== '' && !ValidationRules.isValidLastName(lastNameVal)) {
          setFieldError(lastNameInput, errorLastName, 'Please enter only letters for last name');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = lastNameInput;
        } else {
          clearFieldError(lastNameInput, errorLastName);
        }

        // Validate Email
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (!emailVal) {
          setFieldError(emailInput, errorEmail, 'Email address is required');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailInput;
        } else if (!emailVal.includes('@')) {
          setFieldError(emailInput, errorEmail, "Email must contain '@' (e.g. name@company.com)");
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailInput;
        } else if (!ValidationRules.isValidEmail(emailVal)) {
          setFieldError(emailInput, errorEmail, 'Please enter a valid email address (e.g. name@company.com)');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = emailInput;
        } else {
          clearFieldError(emailInput, errorEmail);
        }

        // Validate Phone
        const phoneVal = phoneInput ? phoneInput.value.trim() : '';
        if (!phoneVal) {
          setFieldError(phoneInput, errorPhone, 'Mobile phone number is required');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        } else if (phoneVal.length < 10) {
          setFieldError(phoneInput, errorPhone, `Please enter a full 10-digit mobile number (${phoneVal.length}/10 entered)`);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        } else if (!/^[6-9]/.test(phoneVal)) {
          setFieldError(phoneInput, errorPhone, 'Please enter a valid mobile number ');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        } else if (!ValidationRules.isValidPhone(phoneVal)) {
          setFieldError(phoneInput, errorPhone, 'Please enter a valid 10-digit mobile number');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = phoneInput;
        } else {
          clearFieldError(phoneInput, errorPhone);
        }

        // Validate Message
        const messageVal = messageInput ? messageInput.value.trim() : '';
        if (!ValidationRules.isValidMessage(messageVal)) {
          setFieldError(messageInput, errorMessage, 'Please enter your enquiry (minimum 5 characters)');
          isValid = false;
          if (!firstInvalidField) firstInvalidField = messageInput;
        } else {
          clearFieldError(messageInput, errorMessage);
        }

        // If any field is invalid, focus the first error field and stop
        if (!isValid) {
          if (firstInvalidField) {
            firstInvalidField.focus();
          }
          return;
        }

        // Form is 100% valid: Process success view
        const productName = document.getElementById('enquiryProductTitle')?.textContent || 'this product';
        const formView = document.getElementById('enquiryFormView');
        const successView = document.getElementById('enquirySuccessView');
        const successName = document.getElementById('enquirySuccessName');
        const successProduct = document.getElementById('enquirySuccessProduct');

        if (successName) successName.textContent = firstNameVal || 'Valued Customer';
        if (successProduct) successProduct.textContent = productName;

        // Transition smoothly to success state
        if (formView) formView.style.display = 'none';
        if (successView) successView.style.display = 'block';
      });
    }

    // Bind all stationery product cards to open modal
    document.querySelectorAll('.stationery-product-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const name = card.dataset.name || card.querySelector('.card-title')?.textContent.trim();
        const img = card.dataset.img || card.querySelector('.card-img')?.getAttribute('src');
        window.openEnquiryModal(name, img);
      });
    });
  });
})();
