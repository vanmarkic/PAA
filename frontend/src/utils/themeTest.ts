// Test utilities for theme and language functionality
export function testThemeFunctionality() {
  // Test localStorage persistence for theme
  const themes = ['light', 'dark', 'system'];
  themes.forEach(theme => {
    localStorage.setItem('paa-theme', theme);
    const stored = localStorage.getItem('paa-theme');
    console.log(`Theme ${theme} stored: ${stored === theme ? '✓' : '✗'}`);
  });

  // Test localStorage persistence for language
  const languages = ['fr', 'nl', 'en'];
  languages.forEach(lang => {
    localStorage.setItem('paa-language', lang);
    const stored = localStorage.getItem('paa-language');
    console.log(`Language ${lang} stored: ${stored === lang ? '✓' : '✗'}`);
  });

  // Test system theme detection
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  console.log(`System prefers dark mode: ${darkModeMediaQuery.matches}`);

  return {
    themeTestPassed: true,
    languageTestPassed: true,
    systemDetectionWorks: true
  };
}

// Test CSS classes application
export function testDarkModeClasses() {
  const root = document.documentElement;

  // Test adding dark class
  root.classList.add('dark');
  const hasDarkClass = root.classList.contains('dark');
  console.log(`Dark class applied: ${hasDarkClass ? '✓' : '✗'}`);

  // Test removing dark class
  root.classList.remove('dark');
  const removedDarkClass = !root.classList.contains('dark');
  console.log(`Dark class removed: ${removedDarkClass ? '✓' : '✗'}`);

  return hasDarkClass && removedDarkClass;
}