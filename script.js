// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    hamburger.setAttribute('aria-expanded', String(!isOpen));
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.add('hidden');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Nav shadow on scroll
const nav = document.getElementById('site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
    } else {
      nav.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
    }
  }, { passive: true });
}


// Service card carousels
document.querySelectorAll('.card-carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-btn-prev');
  const nextBtn = carousel.querySelector('.carousel-btn-next');
  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('carousel-dot-active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Mobile: sync dots to scroll position
  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / track.offsetWidth);
    dots.forEach((d, i) => d.classList.toggle('carousel-dot-active', i === index));
  }, { passive: true });
});


// ─────────────────────────────────────────────────────────────
// Cookie consent banner + conditional analytics loading
//
// Storage: browser cookie `alphamatic_consent` = 'accepted' | 'declined'
// Cookie attrs: max-age=31536000 (365 days), path=/, SameSite=Lax, Secure
//
// Behaviour:
//   - On every page load: read cookie. If 'accepted' → load GA4 + Clarity.
//     If 'declined' or absent → do NOT load them.
//   - If cookie absent: show banner after 0.8s (slide up from below).
//   - On Accept: store cookie, load scripts, hide banner.
//   - On Decline: store cookie, hide banner.
// ─────────────────────────────────────────────────────────────

(function cookieConsent() {
  const COOKIE_NAME = 'alphamatic_consent';
  const COOKIE_MAX_AGE = 31536000; // 365 days
  const GA4_MEASUREMENT_ID = 'G-L0VZY799C0';
  const CLARITY_PROJECT_ID = 'x5e6q73lqu';

  function getConsentCookie() {
    const match = document.cookie.match(
      new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([^;]+)')
    );
    return match ? match[1] : null;
  }

  function setConsentCookie(value) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      COOKIE_NAME + '=' + value +
      '; max-age=' + COOKIE_MAX_AGE +
      '; path=/; SameSite=Lax' + secure;
  }

  function loadGA4() {
    const id = GA4_MEASUREMENT_ID;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id);
  }

  function loadClarity() {
    const id = CLARITY_PROJECT_ID;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', id);
  }

  function hideBanner(banner) {
    banner.classList.remove('is-visible');
    document.body.classList.remove('cookie-banner-visible');
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      banner.style.display = 'none';
    } else {
      setTimeout(() => { banner.style.display = 'none'; }, 320);
    }
  }

  function showBanner(banner) {
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    banner.style.display = '';
    document.body.classList.add('cookie-banner-visible');
    if (prefersReduced) {
      banner.classList.add('is-visible');
    } else {
      // Force a reflow so the transform transition runs from translateY(100%).
      void banner.offsetWidth;
      banner.classList.add('is-visible');
    }
  }

  function init() {
    const consent = getConsentCookie();
    const banner = document.getElementById('cookie-banner');

    if (consent === 'accepted') {
      loadGA4();
      loadClarity();
      if (banner) banner.style.display = 'none';
      return;
    }

    if (consent === 'declined') {
      if (banner) banner.style.display = 'none';
      return;
    }

    // No cookie present → show banner after a brief delay.
    if (!banner) return;
    // Start hidden, wait 0.8s, then slide up.
    banner.style.display = '';
    setTimeout(() => { showBanner(banner); }, 800);

    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        setConsentCookie('accepted');
        loadGA4();
        loadClarity();
        hideBanner(banner);
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        setConsentCookie('declined');
        hideBanner(banner);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
