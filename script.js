(function () {
  function logWarn(msg) { console.warn('Astrobase:', msg); }

  // ---- Sticky Header ----
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ---- Mobile Navigation Toggle ----
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    // Close menu when clicking a regular link
    const navLinks = mobileNav.querySelectorAll('a:not(.mobile-dropdown-toggle)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });

    // Handle Mobile Dropdowns Toggle
    const mobileDropdownToggles = mobileNav.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = toggle.nextElementSibling;
        const icon = toggle.querySelector('.toggle-icon');

        if (submenu) {
          submenu.classList.toggle('open');
        }
        if (icon) {
          icon.classList.toggle('rotated');
        }
      });
    });
  }

  // ---- Scroll Reveals ----
  const reveals = document.querySelectorAll('.reveal-card');
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  reveals.forEach(el => revealOnScroll.observe(el));

  // ---- Theme Toggle Logic ----
  const themeToggleBase = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('mobile-theme-toggle');
  const themeIconBase = document.getElementById('theme-icon');
  const themeIconMobile = document.getElementById('mobile-theme-icon');

  function updateThemeIcon(isLight) {
    const icon = isLight ? '🌙' : '☀️';
    if (themeIconBase) themeIconBase.textContent = icon;
    if (themeIconMobile) themeIconMobile.textContent = icon;
  }

  function toggleTheme() {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    updateThemeIcon(isLightMode);
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  if (themeToggleBase) themeToggleBase.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);


  // ---- Service Form Pre-Select logic ----
  // If user clicks a service card or "Discover More", we can smoothly scroll to contact
  // and optionally pre-fill the dropdown if we pass a parameter.
  // For now, standard smooth scrolling handles anchor links naturally.


  // ---- Form Submission ----
  const form = document.getElementById('service-quote-form');
  const formSuccess = document.getElementById('form-success');
  const btn = document.getElementById('submit-quote-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const firstName = formData.get('firstName');
      const lastName = formData.get('lastName');
      const businessEmail = formData.get('businessEmail');
      const service = formData.get('service');
      const countryCode = formData.get('countryCode');
      const mobileNumber = formData.get('mobileNumber');
      const message = formData.get('message');

      const fullMobile = countryCode + ' ' + mobileNumber;

      // Basic Validation
      if (!firstName || !businessEmail || !mobileNumber || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      let originalText = "";
      if (btn) {
        originalText = btn.textContent;
        btn.textContent = 'Transmitting...';
        btn.disabled = true;
      }

      try {
        // Construct URLSearchParams for Google Forms POST
        const bodyParams = new URLSearchParams();
        // Replace with actual Google Forms Entry IDs
        bodyParams.append("entry.68533157", firstName);
        bodyParams.append("entry.1481137021", lastName || "");
        bodyParams.append("entry.289452837", businessEmail);
        bodyParams.append("entry.1011382414", service || "Not specified");
        bodyParams.append("entry.821010377", fullMobile);
        bodyParams.append("entry.859093392", message);

        // Submit (no-cors)
        await fetch("https://docs.google.com/forms/d/e/1FAIpQLSfrsE2hJ1XmNq7t9O-H_8Dk8i__W9LbWq2oSNRV-9_-M_87ig/formResponse", {
          method: 'POST',
          mode: 'no-cors',
          body: bodyParams
        });

        form.reset();
        if (formSuccess) {
          formSuccess.style.display = 'block';
          setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
        }
      } catch (err) {
        console.error('Submit error:', err);
        alert('Transmission failed. Please check your connection and try again.');
      } finally {
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }
    });
  }

})();
