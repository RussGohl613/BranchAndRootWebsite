/* =========================================================================
   Branch and Root Consulting — Site JS
   Vanilla, no dependencies. Loaded with `defer`.
   ========================================================================= */

// --- Sticky header shadow on scroll ----------------------------------------
// Hysteresis: shrink at >SHRINK_AT, only expand back when scroll drops below
// EXPAND_AT. This avoids the flicker zone where the size change itself shifts
// scrollY across a single threshold.
const header = document.querySelector('.site-header');
if (header) {
  const SHRINK_AT = 48;
  const EXPAND_AT = 8;
  let scrolled = false;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (!scrolled && y > SHRINK_AT) {
      scrolled = true;
      header.classList.add('is-scrolled');
    } else if (scrolled && y < EXPAND_AT) {
      scrolled = false;
      header.classList.remove('is-scrolled');
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };
  update();
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

// --- Reveal-on-scroll ----------------------------------------------------
// Fade elements in as the user scrolls down. Once revealed, they stay
// visible — no re-trigger on scroll up. Above-the-fold content on load
// is marked visible immediately with transitions disabled (no flash).
const REVEAL_SELECTOR = [
  '.hero > .container > *',
  '.page-hero > .container > *',
  '.section > .container > *',
  '.service-block > .container > *',
  '.cta-banner > .container > *',
  '.card',
  '.package-card',
  '.team-member',
  '.faq-item',
  '.about-teaser > *',
  '.footer-grid > *',
].join(',');

/* data-no-reveal is ancestor-aware: tagging a container opts out the container
   AND everything inside it (sitemap-page.html uses this to disable reveal
   animations page-wide). Tag individual elements instead for narrower opt-outs. */
const revealEls = Array.from(document.querySelectorAll(REVEAL_SELECTOR))
  .filter((el, i, arr) => arr.indexOf(el) === i && !el.closest('[data-no-reveal]'));

if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

  const vh = window.innerHeight;
  // Group siblings to compute stagger index per row/group.
  const groups = new Map();
  revealEls.forEach((el) => {
    const key = el.parentElement;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });
  groups.forEach((arr) => {
    arr.forEach((el, i) => {
      el.style.setProperty('--reveal-i', Math.min(i, 6));
    });
  });
  revealEls.forEach((el) => {
    el.classList.add('reveal');
    if (el.getBoundingClientRect().top < vh - 50) {
      el.classList.add('no-anim', 'is-visible');
    } else {
      io.observe(el);
    }
  });
} else {
  revealEls.forEach((el) => el.classList.add('reveal', 'is-visible', 'no-anim'));
}

// --- Horizon mark draw-in (independent observer) --------------------------
const horizonEls = document.querySelectorAll('.horizon');
if ('IntersectionObserver' in window && horizonEls.length) {
  const hio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-drawn');
        hio.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  horizonEls.forEach((el) => hio.observe(el));
}

// --- Scroll progress bar (on long pages) ----------------------------------
const longPagePaths = new Set(['', 'index', 'index.html', 'services', 'services.html', 'bundles', 'bundles.html', 'faq', 'faq.html', 'about', 'about.html', 'contact', 'contact.html', 'book', 'book.html']);
if (longPagePaths.has(path.replace('.html', '')) || longPagePaths.has(path)) {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${pct.toFixed(4)})`;
    bar.classList.toggle('is-active', window.scrollY > 60);
  };
  updateBar();
  window.addEventListener('scroll', updateBar, { passive: true });
}

// --- Gutter numeral parallax ----------------------------------------------
// Subtle vertical drift on decorative numerals as the user scrolls.
const numeralEls = document.querySelectorAll('.gutter-numeral');
if (numeralEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let raf = 0;
  const updateNumerals = () => {
    const vh = window.innerHeight;
    numeralEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Only update when on-screen.
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1 .. 1
      const drift = Math.max(-30, Math.min(30, -progress * 28));
      el.style.setProperty('--parallax', `${drift.toFixed(1)}px`);
    });
    raf = 0;
  };
  const onNumScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(updateNumerals);
  };
  updateNumerals();
  window.addEventListener('scroll', onNumScroll, { passive: true });
  window.addEventListener('resize', onNumScroll);
}
