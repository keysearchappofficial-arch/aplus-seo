document.addEventListener("DOMContentLoaded", () => {
  const shell = document.querySelector(".admin-shell");
  const toggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("admin-overlay");
  const navLinks = document.querySelectorAll(".admin-nav a");

  if (!shell || !toggle || !overlay) return;

  function openSidebar() {
    shell.classList.add("is-sidebar-open");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    shell.classList.remove("is-sidebar-open");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    if (shell.classList.contains("is-sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener("click", closeSidebar);

  navLinks.forEach(link => {
    link.addEventListener("click", closeSidebar);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeSidebar();
    }
  });
});