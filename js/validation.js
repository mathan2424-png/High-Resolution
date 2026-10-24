/**
 * VALIDATION.JS - CONTACT FORM VALIDATION & SANITIZATION
 * Project: High Resolution Technologies - E-Commerce Storefront
 * Senior Developer Standard Form Validation:
 * - Name: Only alphabetic letters & spaces allowed (numbers/symbols blocked in real-time)
 * - Email: Mandatory, must contain '@' and valid domain structure
 * - Phone: Mandatory, exactly 10 digits & valid mobile number (starting with 6-9)
 * - Message: Mandatory, minimum 5 characters
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('mainContactForm') || document.querySelector('.contact-form');
  if (!contactForm) return;

  const nameInput = contactForm.querySelector('#contactName');
  const emailInput = contactForm.querySelector('#contactEmail');
  const phoneInput = contactForm.querySelector('#contactPhone');
  const subjectInput = contactForm.querySelector('#contactSubject');
  const messageInput = contactForm.querySelector('#contactMessage');
  const successAlert = document.getElementById('contactSuccessAlert');

  // Error elements
  const errorName = document.getElementById('errorContactName');
  const errorEmail = document.getElementById('errorContactEmail');
  const errorPhone = document.getElementById('errorContactPhone');
  const errorMessage = document.getElementById('errorContactMessage');

  // Validation Rules
  const Rules = {
    isValidName(val) {
      const trimmed = (val || '').trim();
      return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmed);
    },
    isValidEmail(val) {
      const trimmed = (val || '').trim();
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
    },
    isValidPhone(val) {
      const digits = (val || '').replace(/\D/g, '');
      return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
    },
    isValidMessage(val) {
      return (val || '').trim().length >= 5;
    }
  };

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

  // 1. Real-time Name Input: Restrict to ONLY letters and spaces
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
      if (Rules.isValidName(this.value)) {
        clearFieldError(this, errorName);
      }
    });

    nameInput.addEventListener('blur', function () {
      if (!Rules.isValidName(this.value)) {
        setFieldError(this, errorName, 'Please enter a valid name (letters only, min 2 characters)');
      } else {
        clearFieldError(this, errorName);
      }
    });
  }

  // 2. Real-time Email Input
  if (emailInput) {
    emailInput.addEventListener('input', function () {
      if (Rules.isValidEmail(this.value)) {
        clearFieldError(this, errorEmail);
      }
    });

    emailInput.addEventListener('blur', function () {
      const val = this.value.trim();
      if (!val) {
        setFieldError(this, errorEmail, 'Email address is required');
      } else if (!val.includes('@')) {
        setFieldError(this, errorEmail, "Email must contain an '@' sign (e.g. name@company.com)");
      } else if (!Rules.isValidEmail(val)) {
        setFieldError(this, errorEmail, 'Please enter a valid email address (e.g. name@company.com)');
      } else {
        clearFieldError(this, errorEmail);
      }
    });
  }

  // 3. Real-time Phone Input: Restrict to ONLY 10 digits starting with 6-9
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 10);
      if (Rules.isValidPhone(this.value)) {
        clearFieldError(this, errorPhone);
      }
    });

    phoneInput.addEventListener('blur', function () {
      const val = this.value.trim();
      if (!val) {
        setFieldError(this, errorPhone, 'Phone number is required');
      } else if (val.length < 10) {
        setFieldError(this, errorPhone, `Please enter a full 10-digit mobile number (${val.length}/10 entered)`);
      } else if (!/^[6-9]/.test(val)) {
        setFieldError(this, errorPhone, 'Please enter a valid mobile number');
      } else if (!Rules.isValidPhone(val)) {
        setFieldError(this, errorPhone, 'Please enter a valid 10-digit mobile number');
      } else {
        clearFieldError(this, errorPhone);
      }
    });
  }

  // 4. Message Input
  if (messageInput) {
    messageInput.addEventListener('input', function () {
      if (Rules.isValidMessage(this.value)) {
        clearFieldError(this, errorMessage);
      }
    });

    messageInput.addEventListener('blur', function () {
      if (!Rules.isValidMessage(this.value)) {
        setFieldError(this, errorMessage, 'Please write a message of at least 5 characters');
      } else {
        clearFieldError(this, errorMessage);
      }
    });
  }

  // 5. Form Submit Handler
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalid = null;

    // Validate Name
    if (!Rules.isValidName(nameInput?.value)) {
      setFieldError(nameInput, errorName, 'Please enter a valid name (letters only, min 2 characters)');
      isValid = false;
      if (!firstInvalid) firstInvalid = nameInput;
    } else {
      clearFieldError(nameInput, errorName);
    }

    // Validate Email
    const emailVal = emailInput?.value.trim() || '';
    if (!emailVal) {
      setFieldError(emailInput, errorEmail, 'Email address is required');
      isValid = false;
      if (!firstInvalid) firstInvalid = emailInput;
    } else if (!emailVal.includes('@')) {
      setFieldError(emailInput, errorEmail, "Email must contain an '@' sign");
      isValid = false;
      if (!firstInvalid) firstInvalid = emailInput;
    } else if (!Rules.isValidEmail(emailVal)) {
      setFieldError(emailInput, errorEmail, 'Please enter a valid email address');
      isValid = false;
      if (!firstInvalid) firstInvalid = emailInput;
    } else {
      clearFieldError(emailInput, errorEmail);
    }

    // Validate Phone
    const phoneVal = phoneInput?.value.trim() || '';
    if (!phoneVal) {
      setFieldError(phoneInput, errorPhone, 'Phone number is required');
      isValid = false;
      if (!firstInvalid) firstInvalid = phoneInput;
    } else if (phoneVal.length < 10) {
      setFieldError(phoneInput, errorPhone, 'Please enter a full 10-digit mobile number');
      isValid = false;
      if (!firstInvalid) firstInvalid = phoneInput;
    } else if (!/^[6-9]/.test(phoneVal)) {
      setFieldError(phoneInput, errorPhone, 'Mobile number must start with 6, 7, 8, or 9');
      isValid = false;
      if (!firstInvalid) firstInvalid = phoneInput;
    } else if (!Rules.isValidPhone(phoneVal)) {
      setFieldError(phoneInput, errorPhone, 'Please enter a valid 10-digit mobile number');
      isValid = false;
      if (!firstInvalid) firstInvalid = phoneInput;
    } else {
      clearFieldError(phoneInput, errorPhone);
    }

    // Validate Message
    if (!Rules.isValidMessage(messageInput?.value)) {
      setFieldError(messageInput, errorMessage, 'Please write a message of at least 5 characters');
      isValid = false;
      if (!firstInvalid) firstInvalid = messageInput;
    } else {
      clearFieldError(messageInput, errorMessage);
    }

    if (!isValid) {
      firstInvalid?.focus();
      return;
    }

    // Success response
    if (successAlert) {
      successAlert.classList.add('visible');
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    contactForm.reset();
    contactForm.querySelectorAll('.contact-input, .contact-textarea').forEach(el => {
      el.classList.remove('is-valid');
    });

    setTimeout(() => {
      successAlert?.classList.remove('visible');
    }, 8000);
  });
});
