(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function splitName(full) {
    const trimmed = (full || '').trim().replace(/\s+/g, ' ');
    const idx = trimmed.indexOf(' ');
    if (idx === -1) return { firstName: trimmed, lastName: '' };
    return { firstName: trimmed.slice(0, idx), lastName: trimmed.slice(idx + 1) };
  }

  function getField(form, name) {
    const el = form.elements.namedItem(name);
    return el ? (el.value || '').trim() : '';
  }

  function setFieldError(form, name, msg) {
    const el = form.elements.namedItem(name);
    if (!el) return;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function showError(form, name, email, phone, message) {
    const err = form.parentNode.querySelector('[data-error]');
    if (!err) return;
    const link = err.querySelector('a[href^="mailto:"]');
    if (link) {
      const subject = encodeURIComponent('Discovery inquiry from ' + (name || 'website visitor'));
      const body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone +
        '\n\n' + (message || '(no message)')
      );
      const base = link.getAttribute('href').split('?')[0];
      link.setAttribute('href', base + '?subject=' + subject + '&body=' + body);
    }
    err.hidden = false;
    err.style.display = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitBtn = form.querySelector('[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';

    if (getField(form, 'company_website')) {
      form.style.display = 'none';
      const ok = form.parentNode.querySelector('[data-success]');
      if (ok) { ok.hidden = false; ok.style.display = ''; }
      return;
    }

    const name = getField(form, 'name');
    const email = getField(form, 'email');
    const phone = getField(form, 'phone');
    const businessType = getField(form, 'business_type');
    const message = getField(form, 'message');
    const requirePhone = form.dataset.requirePhone === 'true';

    let bad = false;
    if (name.length < 2) { setFieldError(form, 'name', 'Required'); bad = true; } else setFieldError(form, 'name', '');
    if (!EMAIL_RE.test(email)) { setFieldError(form, 'email', 'Required'); bad = true; } else setFieldError(form, 'email', '');
    if (requirePhone && phone.length < 7) { setFieldError(form, 'phone', 'Required'); bad = true; } else setFieldError(form, 'phone', '');
    if (bad) {
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    const { firstName, lastName } = splitName(name);
    const source = form.dataset.source || 'website';
    const customFields = {};
    if (businessType) customFields.business_type = businessType;
    if (message) customFields.message = message;

    // Auto-populate Lead Source (custom field) so the GHL contact record
    // shows where the lead came from without us having to remember to map it.
    // Keep these labels human-readable — they appear in the GHL UI directly.
    if (source === 'discovery') {
      customFields.lead_source = 'Website — Discovery Form';
    } else if (source === 'magnet') {
      customFields.lead_source = 'Website — Lead Magnet';
      customFields.lead_magnet_downloaded = '7-Point Revenue Leak Checklist';
    } else {
      customFields.lead_source = 'Website — ' + source.charAt(0).toUpperCase() + source.slice(1);
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      source: source,
      tags: form.dataset.tag ? [form.dataset.tag] : []
    };
    if (Object.keys(customFields).length) payload.customFields = customFields;

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('upstream');
      form.style.display = 'none';
      const ok = form.parentNode.querySelector('[data-success]');
      if (ok) { ok.hidden = false; ok.style.display = ''; }
      setTimeout(() => {
        window.location = 'thank-you.html?source=' + encodeURIComponent(payload.source);
      }, 1500);
    } catch (err) {
      showError(form, name, email, phone, message);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  }

  function init() {
    document.querySelectorAll('form[data-lead-form]').forEach(f => {
      f.addEventListener('submit', handleSubmit);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
