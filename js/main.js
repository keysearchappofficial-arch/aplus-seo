const navToggle = document.querySelector('.nav-toggle');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });
}

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
  });
});