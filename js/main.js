/**
 * MAIN.JS - CORE APPLICATION SCRIPTS
 * Project: High Resolution Technologies - E-Commerce Storefront
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 2. Sticky Header Elevation on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 3. Auto-Scrolling Luxury 3D Coverflow Showcase (All 3 Visible, Center Card Prominent)
  const cards = document.querySelectorAll('.showcase-3d-card');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const progressFill = document.getElementById('sliderProgressFill');
  const stage = document.getElementById('showcase3dStage');
  const stageWrapper = document.querySelector('.showcase-3d-stage-wrapper');

  if (cards.length === 3) {
    let activeIndex = 0;
    const slideDuration = 3800; // 3.8s per rotation
    let autoInterval = null;
    let isPaused = false;

    function updateCards(centerIndex) {
      activeIndex = (centerIndex + 3) % 3;

      cards.forEach((card, index) => {
        card.classList.remove('pos-center', 'pos-left', 'pos-right');

        if (index === activeIndex) {
          card.classList.add('pos-center');
        } else if (index === (activeIndex + 1) % 3) {
          card.classList.add('pos-right');
        } else {
          card.classList.add('pos-left');
        }
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });

      resetProgress();
    }

    function nextSlide() {
      updateCards(activeIndex + 1);
    }

    function prevSlide() {
      updateCards(activeIndex - 1);
    }

    function resetProgress() {
      if (progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (!isPaused && progressFill) {
              progressFill.style.transition = `width ${slideDuration}ms linear`;
              progressFill.style.width = '100%';
            }
          }, 30);
        });
      }
    }

    function startAutoScroll() {
      clearInterval(autoInterval);
      autoInterval = setInterval(() => {
        if (!isPaused) {
          nextSlide();
        }
      }, slideDuration);
      resetProgress();
    }

    function stopAutoScroll() {
      clearInterval(autoInterval);
      if (progressFill) {
        progressFill.style.transition = 'none';
      }
    }

    // Direct card click: Clicking either the left or right card smoothly brings it to center
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (index !== activeIndex) {
          updateCards(index);
          startAutoScroll();
        }
      });
    });

    // Prev / Next button listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoScroll();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoScroll();
      });
    }

    // Dot button listeners
    dots.forEach(dot => {
      dot.addEventListener('click', function () {
        const target = parseInt(this.getAttribute('data-slide'), 10);
        updateCards(target);
        startAutoScroll();
      });
    });

    // Pause on mouse hover & resume on leave
    if (stageWrapper) {
      stageWrapper.addEventListener('mouseenter', () => {
        isPaused = true;
        stopAutoScroll();
      });
      stageWrapper.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoScroll();
      });
    }

    // Touch Swipe Support for Mobile/Tablet
    let touchStartX = 0;
    let touchEndX = 0;
    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 40) {
          nextSlide();
          startAutoScroll();
        } else if (touchEndX > touchStartX + 40) {
          prevSlide();
          startAutoScroll();
        }
      }, { passive: true });
    }

    // Initial position & launch
    updateCards(0);
    startAutoScroll();
  }
});
