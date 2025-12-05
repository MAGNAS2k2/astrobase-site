(function () {
  function logWarn(msg) { console.warn('Astrobase:', msg); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  document.addEventListener('DOMContentLoaded', () => {
    /* ---- DOM Elements ---- */
    const header = document.getElementById('main-header');
    const revealElements = document.querySelectorAll('.reveal-card');
    const launchBtn = document.getElementById('launch-button');
    const heroRocket = document.getElementById('hero-rocket-container');
    const heroText = document.getElementById('hero-text-content');
    const overlay = document.getElementById('launch-overlay');
    const seqRocket = document.getElementById('seq-rocket');
    const seqExplosion = document.getElementById('seq-explosion');
    const overlayPanel = document.getElementById('overlay-panel');
    const overlayClose = document.getElementById('overlay-close');

    // Form & Grid Elements inside Overlay
    const overlayServicesGrid = document.getElementById('overlay-services-grid');
    const serviceQuoteForm = document.getElementById('service-quote-form');
    const formBackBtn = document.getElementById('form-back');
    const serviceSelect = document.getElementById('service-select');
    const formSuccess = document.getElementById('form-success');
    const servicesGrid = document.getElementById('services-grid');

    if (!overlay || !overlayPanel) { logWarn('Missing overlay elements.'); return; }

    /* Sticky Header */
    window.addEventListener('scroll', () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    });

    /* Scroll Reveal Animation */
    if (revealElements && 'IntersectionObserver' in window) {
      const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('reveal'); obs.unobserve(entry.target); }
        });
      }, revealOptions);
      revealElements.forEach(el => observer.observe(el));
    }

    /* Overlay State Helpers */
    function openOverlay() {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overlay-active');
    }

    function closeOverlay() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overlay-active');
      if (seqExplosion) seqExplosion.classList.remove('boom');
      if (seqRocket) { seqRocket.classList.remove('launching'); seqRocket.style.opacity = '1'; }
      setTimeout(resetFormAndView, 300);
    }

    function showOverlayPanel() { overlayPanel.classList.add('show'); }

    if (overlayClose) overlayClose.addEventListener('click', () => closeOverlay());

    /* Launch Button Sequence (Header/Hero Button) */
    if (launchBtn) {
      launchBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (launchBtn.disabled) return;
        launchBtn.disabled = true;

        heroText && heroText.classList.add('fade-out');
        heroRocket && heroRocket.classList.add('fly-away');

        openOverlay();
        resetFormAndView(); // Show grid by default for launch button

        if (seqRocket) { seqRocket.style.opacity = '1'; seqRocket.classList.add('launching'); }
        if (seqExplosion) seqExplosion.classList.remove('boom');

        await sleep(1200); // Fly time

        if (seqRocket) seqRocket.style.opacity = '0';
        if (seqExplosion) seqExplosion.classList.add('boom');

        await sleep(700);
        showOverlayPanel();
        launchBtn.disabled = false;
        heroText && heroText.classList.remove('fade-out'); // Reset hero state behind
        heroRocket && heroRocket.classList.remove('fly-away');
      });
    }

    /* --- FORM LOGIC --- */

    function showFormForService(serviceName) {
      if (!overlayServicesGrid || !serviceQuoteForm) return;
      overlayServicesGrid.hidden = true;
      serviceQuoteForm.hidden = false;
      overlayPanel.scrollTop = 0; // Scroll to top of modal

      if (serviceName && serviceSelect) {
        const options = Array.from(serviceSelect.options);
        const match = options.find(opt => opt.value === serviceName);
        if (match) {
          serviceSelect.value = serviceName;
        } else {
          serviceSelect.value = ""; // Default
        }
      }
      if (formSuccess) formSuccess.hidden = true;
    }

    function resetFormAndView() {
      if (!serviceQuoteForm || !overlayServicesGrid) return;
      try { serviceQuoteForm.reset(); } catch (e) { }
      serviceQuoteForm.hidden = true;
      overlayServicesGrid.hidden = false;
      if (formSuccess) formSuccess.hidden = true;
    }

    // Click on Overlay Services Grid (modal)
    if (overlayServicesGrid) {
      overlayServicesGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.overlay-card');
        if (!card) return;
        const serviceName = card.getAttribute('data-service') || card.querySelector('h3')?.innerText;
        showFormForService(serviceName);
      });
    }

    // Click on Page Services Grid (main)
    if (servicesGrid) {
      servicesGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.reveal-card');
        if (!card) return;
        const serviceName = card.getAttribute('data-service') || card.querySelector('h3')?.innerText;
        openOverlay();
        showOverlayPanel();
        showFormForService(serviceName);
      });
    }

    // Back Button in Form (if exists)
    if (formBackBtn) formBackBtn.addEventListener('click', () => resetFormAndView());

    // ---- Google Forms Submission ----
    if (serviceQuoteForm) {
      serviceQuoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = serviceQuoteForm.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : 'Submit';
        if (btn) { btn.textContent = 'Transmitting...'; btn.disabled = true; }

        // Collect values
        const firstName = document.getElementById('firstName')?.value?.trim() || '';
        const lastName = document.getElementById('lastName')?.value?.trim() || '';
        const businessEmail = document.getElementById('businessEmail')?.value?.trim() || '';
        const service = document.getElementById('service-select')?.value || '';
        const address = document.getElementById('address')?.value?.trim() || '';
        const countryCode = document.querySelector('.country-select')?.value || '+91';
        const mobileNumber = document.getElementById('mobileNumber')?.value?.trim() || '';
        const message = document.getElementById('message')?.value?.trim() || '';

        // Basic validation
        if (!firstName || !businessEmail || !service || !address || !mobileNumber || !message) {
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
          alert('Please fill all required fields before submitting.');
          return;
        }

        // ---------------------------------------------------------
        // TODO: REPLACE THESE VALUES WITH YOUR GOOGLE FORM DETAILS
        // ---------------------------------------------------------
        const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdpFitRIus_W9LbWq2oSNRV-9_-bPCt5mSpMqdZ4KxLPVI88A/formResponse";

        // Map your form fields to Google Form Entry IDs
        const formData = new FormData();
        formData.append("entry.1354207388", firstName);      // Replace with actual ID for First Name
        formData.append("entry.625538273", lastName);       // Replace with actual ID for Last Name
        formData.append("entry.1731737916", businessEmail);  // Replace with actual ID for Email
        formData.append("entry.165269441", service);        // Replace with actual ID for Service
        formData.append("entry.1416573462", address);        // Replace with actual ID for Address
        formData.append("entry.1162682067", countryCode + "entry.1939211863" + mobileNumber); // Combine or use separate ID
        formData.append("entry.859093392", message);        // Replace with actual ID for Message
        // ---------------------------------------------------------
        try {
          // Google Forms doesn't support CORS for direct fetch, so we use 'no-cors' mode.
          // This means we won't get a readable response (status will be 0), but the form will submit.
          await fetch(GOOGLE_FORM_ACTION_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
          });

          // Since we can't check resp.ok in no-cors, we assume success if no network error occurred.
          console.log('Quote transmitted to Google Forms');

          // Show success UI
          serviceQuoteForm.hidden = true;
          if (formSuccess) formSuccess.hidden = false;

          // Auto close after success
          setTimeout(() => closeOverlay(), 3000);

        } catch (err) {
          console.error('Submit error:', err);
          alert('Transmission failed. Please check your connection and try again.');
        } finally {
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
        }
      });
    }

    /* Flame alignment (Visuals) */
    (function alignFlameToNozzle() {
      const heroContainer = document.getElementById('hero-rocket-container');
      if (!heroContainer) return;
      const rocketImg = heroContainer.querySelector('.rocket-img');
      const rocketFire = heroContainer.querySelector('.rocket-fire');
      if (!rocketImg || !rocketFire) return;

      function onImgReady(cb) {
        if (rocketImg.complete && rocketImg.naturalWidth) cb();
        else rocketImg.addEventListener('load', cb, { once: true });
      }
      function alignFlame() {
        const imgRect = rocketImg.getBoundingClientRect();
        const containerRect = heroContainer.getBoundingClientRect();
        const leftPx = (imgRect.left + imgRect.width * 0.5) - containerRect.left;
        const topPx = (imgRect.top + imgRect.height * 0.94) - containerRect.top;

        rocketFire.style.left = leftPx + 'px';
        rocketFire.style.top = topPx + 'px';
        rocketFire.style.transform = `translate(-50%, -10%) rotate(45deg)`;
      }

      onImgReady(() => {
        alignFlame();
        window.addEventListener('resize', alignFlame);
      });
    })();

  });
})();
