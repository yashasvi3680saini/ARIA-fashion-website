/* =========================================================
   ARIA — DARK MODE
   Self-contained: injects its own CSS and the toggle button.
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'ariaTheme';
  var root = document.documentElement;

  function getSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }
  function isDark() {
    return root.classList.contains('aria-dark');
  }

  function apply(theme) {
    root.classList.toggle('aria-dark', theme === 'dark');
    root.setAttribute('data-theme', theme);

    document.querySelectorAll('.theme-switch').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  /* Apply the saved theme immediately (prevents a white flash) */
  apply(getSaved() === 'dark' ? 'dark' : 'light');

  /* ---------- CSS ---------- */
  var css = `
    /* Dark mode = invert the page, then un-invert images and photo banners */
    html.aria-dark {
      background: #fff;
      filter: invert(1) hue-rotate(180deg) brightness(.9) contrast(.95);
    }
    html.aria-dark img,
    html.aria-dark video,
    html.aria-dark picture,
    html.aria-dark iframe,
    html.aria-dark canvas,
    html.aria-dark .hero,
    html.aria-dark .page-banner,
    html.aria-dark .ethnic-hero,
    html.aria-dark .footwear-hero,
    html.aria-dark .ethnic-quote,
    html.aria-dark .footwear-quote,
    html.aria-dark .western-quote,
    html.aria-dark .accessories-quote,
    html.aria-dark .auth-visual,
    html.aria-dark [style*="background-image"] {
      filter: invert(1) hue-rotate(180deg);
    }

    /* old unfinished toggle on western.html */
    .theme-toggle-label { display: none !important; }

    /* the switch */
    .theme-switch {
      position: relative;
      flex: none;
      width: 54px;
      height: 28px;
      margin: 0 4px;
      padding: 0;
      border: 1px solid rgba(34, 34, 34, 0.2);
      border-radius: 999px;
      background: #f1ece6;
      cursor: pointer;
      transition: background-color .3s ease;
    }
    .theme-switch:focus-visible { outline: 2px solid #f57c7c; outline-offset: 2px; }
    .theme-switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #222;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .3s ease;
    }
    .theme-switch__thumb svg { width: 13px; height: 13px; }
    .theme-switch .ts-moon { display: none; }
    html.aria-dark .theme-switch__thumb { transform: translateX(26px); }
    html.aria-dark .theme-switch .ts-sun { display: none; }
    html.aria-dark .theme-switch .ts-moon { display: block; }

    /* on pages with no navbar (login) */
    .theme-switch--floating {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2000;
      margin: 0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- Toggle button ---------- */
  var SUN = '<svg class="ts-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
  var MOON = '<svg class="ts-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>';

  function buildToggle() {
    if (document.querySelector('.theme-switch')) return;
    if (document.querySelector('.loader-container')) return; /* loading screen */

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switch';
    btn.innerHTML = '<span class="theme-switch__thumb">' + SUN + MOON + '</span>';

    var holder = document.querySelector('.navbar__icons');
    if (holder) {
      holder.insertBefore(btn, holder.firstChild);
    } else {
      btn.classList.add('theme-switch--floating');
      document.body.appendChild(btn);
    }

    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      apply(next);
      save(next);
    });

    apply(isDark() ? 'dark' : 'light');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToggle);
  } else {
    buildToggle();
  }

  /* keep other open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(e.newValue === 'dark' ? 'dark' : 'light');
  });
})();