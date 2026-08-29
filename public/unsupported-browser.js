





(function () {
  'use strict';

  function isSupported() {
    var lastError;

    var hasCssHas = false;
    try {
      hasCssHas = !!(window.CSS && window.CSS.supports && window.CSS.supports('selector(:has(*))'));
    } catch (e) {
      lastError = e;
      hasCssHas = false;
    }

    var hasModuleScripts = false;
    try {
      hasModuleScripts = 'noModule' in document.createElement('script');
    } catch (e) {
      lastError = e;
      hasModuleScripts = false;
    }

    void lastError;
    return hasCssHas && hasModuleScripts;
  }

  function alreadyOnFallbackPage() {
    return window.location.pathname.indexOf('unsupported-browser') !== -1;
  }

  if (!isSupported() && !alreadyOnFallbackPage()) {
    window.location.replace('/unsupported-browser.html');
  }
})();
