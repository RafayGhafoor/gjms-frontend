(function () {
  var html = document.documentElement;
  var stored = localStorage.getItem('theme');
  // Default to light theme
  var theme = stored || 'light';

  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  window.toggleTheme = function () {
    var isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateToggleIcon(isDark);
  };

  function updateToggleIcon(isDark) {
    var sunIcons = document.querySelectorAll('.theme-icon-sun');
    var moonIcons = document.querySelectorAll('.theme-icon-moon');
    sunIcons.forEach(function (el) { el.style.display = isDark ? 'none' : 'block'; });
    moonIcons.forEach(function (el) { el.style.display = isDark ? 'block' : 'none'; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateToggleIcon(html.classList.contains('dark'));

    // Scroll-triggered fade-in animations
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  });
})();
