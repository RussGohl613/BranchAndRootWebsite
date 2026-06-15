/* =========================================================================
   Branch & Root Consulting — privacy / consent engine
   Pairs with the inline "Consent Mode v2 default" block in each page's <head>
   (that block sets the DEFAULT before GTM loads; this file handles UPDATE,
   the public API, and the California notice banner).

   - opt-out state in localStorage('br_privacy_optout'): '1' = out, '0' = in,
     null = undecided.
   - Global Privacy Control (navigator.globalPrivacyControl) FORCES opt-out and
     cannot be overridden from the page (CCPA opt-out preference signal).
   - Google Consent Mode v2 UPDATE on change: ad_storage / ad_user_data /
     ad_personalization. analytics_storage is intentionally left granted —
     CCPA targets the SALE/SHARE of data, not first-party analytics.
   - Injects a non-blocking notice-at-collection banner (no dark patterns).
   - Exposes window.BRPrivacy { getState, optOut, optIn, canTrackAds, onChange }.
   Vanilla JS, no dependencies, loaded with defer.
   ========================================================================= */
(function () {
  'use strict';

  var KEY = 'br_privacy_optout';
  var DISMISS = 'br_notice_dismissed';
  var listeners = [];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function gpcOn() { return navigator.globalPrivacyControl === true; }
  function isOptedOut() { return gpcOn() || lsGet(KEY) === '1'; }
  function source() {
    if (gpcOn()) return 'gpc';
    var v = lsGet(KEY);
    return (v === '1' || v === '0') ? 'user' : 'default';
  }

  function gtagSafe() {
    if (typeof window.gtag === 'function') return window.gtag;
    window.dataLayer = window.dataLayer || [];
    return function () { window.dataLayer.push(arguments); };
  }

  // Push a Consent Mode v2 UPDATE reflecting the current state.
  function syncConsentMode() {
    var v = isOptedOut() ? 'denied' : 'granted';
    gtagSafe()('consent', 'update', {
      ad_storage: v,
      ad_user_data: v,
      ad_personalization: v
      // analytics_storage left granted on purpose (first-party analytics)
    });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'br_consent_update', br_opt_out: isOptedOut() ? 1 : 0 });
  }

  function notify() {
    var st = BRPrivacy.getState();
    listeners.forEach(function (fn) { try { fn(st); } catch (e) {} });
  }

  var BRPrivacy = {
    getState: function () {
      return { optedOut: isOptedOut(), source: source(), gpc: gpcOn() };
    },
    optOut: function () {
      lsSet(KEY, '1'); syncConsentMode(); notify(); return this.getState();
    },
    optIn: function () {
      // GPC present → cannot opt back in from the page; keep denied.
      if (gpcOn()) { notify(); return this.getState(); }
      lsSet(KEY, '0'); syncConsentMode(); notify(); return this.getState();
    },
    // Gate used by thank-you.html before firing Ads/Meta conversion pixels.
    canTrackAds: function () { return !isOptedOut(); },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };
  window.BRPrivacy = BRPrivacy;

  // Reconcile on load (the inline default already applied synchronously).
  syncConsentMode();
  // If GPC is on, make storage agree so the opt-out is visible everywhere.
  if (gpcOn() && lsGet(KEY) !== '1') lsSet(KEY, '1');

  // ----- California notice-at-collection banner (non-blocking) -------------
  function bannerNeeded() {
    if (lsGet(DISMISS) === '1') return false;   // already acknowledged
    if (gpcOn()) return false;                  // GPC users: honored silently
    var v = lsGet(KEY);
    if (v === '0' || v === '1') return false;   // already chose
    return true;
  }

  function mountBanner() {
    if (!bannerNeeded() || document.querySelector('.br-privacy-banner')) return;
    var el = document.createElement('div');
    el.className = 'br-privacy-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Privacy notice');
    el.innerHTML =
      '<div class="br-pb-inner">' +
        '<p class="br-pb-text">We use cookies for analytics and — only if you opt in — ' +
          'advertising measurement. We don’t sell your information for money, but under ' +
          'California law some ad-related sharing may count as a “sale” or “share.” ' +
          '<a href="/privacy-policy">Privacy Policy</a> · ' +
          '<a href="/your-privacy-choices">Your Privacy Choices</a></p>' +
        '<div class="br-pb-actions">' +
          '<button type="button" class="btn btn-ghost br-pb-btn" data-br="optout">Opt out of sharing</button>' +
          '<button type="button" class="btn btn-primary br-pb-btn" data-br="ok">OK</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-br]');
      if (!t) return;
      if (t.getAttribute('data-br') === 'optout') BRPrivacy.optOut();
      lsSet(DISMISS, '1');                       // acknowledged either way
      el.classList.add('is-hiding');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    });
    requestAnimationFrame(function () { el.classList.add('is-in'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountBanner);
  } else {
    mountBanner();
  }
})();
