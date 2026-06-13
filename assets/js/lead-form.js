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
    const field = form.elements.namedItem(name);
    if (!field) return;
    // Find or lazily create the inline error span immediately after the input.
    const errorId = (field.id || name) + '-error';
    let span = document.getElementById(errorId);
    if (!span) {
      span = document.createElement('span');
      span.className = 'lead-field-error';
      span.setAttribute('role', 'alert');
      span.setAttribute('aria-live', 'polite');
      span.id = errorId;
      field.insertAdjacentElement('afterend', span);
    }
    span.textContent = msg;
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
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

  // Kick off a download of a same-origin file without navigating the page.
  // The `download` attribute tells the browser to save rather than open, and
  // the click-on-detached-anchor pattern works across modern browsers. Wrapped
  // in try/catch so a failure here never blocks the success flow — the
  // thank-you page carries a visible backup link regardless.
  function triggerDownload(url) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', '');
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      // Swallow — the backup link on thank-you.html covers this case.
    }
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

      // Lead magnet: hand the PDF over immediately on success. The lead is
      // already captured in GHL above; this guarantees the visitor gets the
      // checklist even before the GHL nurture email fires (and regardless of
      // whether that workflow is live). Same-origin asset, so `download` works.
      const pdf = form.dataset.magnetPdf;
      if (pdf) triggerDownload(pdf);

      form.style.display = 'none';
      const ok = form.parentNode.querySelector('[data-success]');
      if (ok) { ok.hidden = false; ok.style.display = ''; }
      // Give the download a beat to start before navigating away.
      setTimeout(() => {
        window.location = 'thank-you.html?source=' + encodeURIComponent(payload.source);
      }, pdf ? 2400 : 1500);
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
