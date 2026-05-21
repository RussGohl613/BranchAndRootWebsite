/* =========================================================================
   Branch and Root Consulting — Site JS
   Vanilla, no dependencies. Loaded as type="module".
   ========================================================================= */

// --- Sticky header shadow on scroll ----------------------------------------
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// --- Mobile nav toggle -----------------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const mobilePanel = document.querySelector('.mobile-panel');
if (navToggle && mobilePanel) {
  const setOpen = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    mobilePanel.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });
  mobilePanel.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

// --- Smooth scroll for in-page anchors -------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// --- FAQ accordion ---------------------------------------------------------
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const btn = item.querySelector('.faq-q');
  const panel = item.querySelector('.faq-a');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close every other panel for single-open behaviour
    faqItems.forEach((other) => {
      if (other === item) return;
      const ob = other.querySelector('.faq-q');
      const op = other.querySelector('.faq-a');
      if (ob && op) {
        ob.setAttribute('aria-expanded', 'false');
        op.style.maxHeight = '0px';
      }
    });
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
  });
});

// --- Contact form validation ----------------------------------------------
const form = document.querySelector('.contact-form');
if (form) {
  const fields = form.querySelectorAll('[data-required]');
  const setError = (field, hasError) => {
    field.closest('.field')?.classList.toggle('is-invalid', hasError);
  };
  const validateField = (field) => {
    const value = (field.value || '').trim();
    let valid = value.length > 0;
    if (valid && field.type === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (valid && field.type === 'tel') {
      const digits = value.replace(/\D/g, '');
      valid = digits.length >= 7;
    }
    setError(field, !valid);
    return valid;
  };
  fields.forEach((f) => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => {
      if (f.closest('.field')?.classList.contains('is-invalid')) {
        validateField(f);
      }
    });
  });
  form.addEventListener('submit', (e) => {
    let allValid = true;
    fields.forEach((f) => {
      if (!validateField(f)) allValid = false;
    });
    if (!allValid) {
      e.preventDefault();
      const firstInvalid = form.querySelector('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea');
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // If form action is "#" (placeholder), prevent reload and route to thank-you for demo.
    if (allValid && form.getAttribute('action') === '#') {
      e.preventDefault();
      window.location.href = 'thank-you.html';
    }
  });
}

// --- Active nav link highlight --------------------------------------------
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('[data-nav]').forEach((link) => {
  if (link.getAttribute('data-nav') === path.replace('.html', '')) {
    link.classList.add('is-active');
  }
});
