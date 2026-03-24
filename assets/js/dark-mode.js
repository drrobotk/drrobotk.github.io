/* ==========================================================================
   Dark Mode Toggle Script
   Handles theme switching with localStorage persistence
   ========================================================================== */

(function() {
  'use strict';

  const THEME_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // Get stored theme or detect system preference
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  // Apply theme to document
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update toggle button aria-label
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', 
        theme === DARK ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  // Toggle between themes
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    setTheme(next);
  }

  // Initialize theme on page load
  function init() {
    // Apply theme immediately to prevent flash
    setTheme(getPreferredTheme());

    // Set up toggle button
    document.addEventListener('DOMContentLoaded', function() {
      const toggleBtn = document.querySelector('.dark-mode-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
      }
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  init();
})();
