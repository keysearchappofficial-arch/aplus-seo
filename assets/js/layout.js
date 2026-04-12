const GA_MEASUREMENT_ID = "G-ZWC50XN0X0";

function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  // 避免重複插入
  if (window.__ga_initialized__) return;
  window.__ga_initialized__ = true;

  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
  );

  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}


async function loadComponent(selector, path) {
  const mountNode = document.querySelector(selector);
  if (!mountNode) return null;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load component: ${path}`);
    }

    const html = await response.text();
    mountNode.innerHTML = html;
    return mountNode;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getComponentPath(fileName) {
  return `./components/${fileName}`;
}

function getCurrentPageKey() {
  const fileName = window.location.pathname.split("/").pop() || "index.html";
  return fileName.replace(".html", "");
}

function isEnglishPage() {
  return window.location.pathname.includes("/en/");
}

function isBlogLikePage() {
  const currentKey = getCurrentPageKey();
  return currentKey === "blog" || currentKey === "article";
}

function toggleBlogNav(headerRoot) {
  if (!headerRoot) return;

  const blogLink = headerRoot.querySelector("[data-blog-link]");
  if (!blogLink) return;

  // 英文站隱藏文章
  if (isEnglishPage()) {
    blogLink.style.display = "none";
  } else {
    blogLink.style.display = "";
  }
}

function setActiveNav(headerRoot) {
  if (!headerRoot) return;

  const currentKey = getCurrentPageKey();
  const navLinks = headerRoot.querySelectorAll(".site-nav a[data-nav]");

  navLinks.forEach((link) => {
    const key = link.dataset.nav;
    const isActive = key === currentKey;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function bindMobileNav(headerRoot) {
  if (!headerRoot) return;

  const navToggle = headerRoot.querySelector(".nav-toggle");
  const siteNav = headerRoot.querySelector(".site-nav");

  if (!navToggle || !siteNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindLangSwitcher(headerRoot) {
  if (!headerRoot) return;

  const langLink = headerRoot.querySelector("[data-lang-switch]");
  if (!langLink) return;

  const body = document.body;
  const englishPage = isEnglishPage();
  const blogPage = isBlogLikePage();

  if (englishPage) {
    const zhUrl = body.dataset.zhUrl || "../index.html";
    langLink.setAttribute("href", zhUrl);
    langLink.textContent = "中文";
    langLink.setAttribute("aria-label", "Switch to Traditional Chinese");
    return;
  }

  // 中文文章頁 / 文章列表頁 → 切英文直接回英文首頁
  if (blogPage) {
    const blogEnFallback = body.dataset.blogEnFallback || "./en/index.html";
    langLink.setAttribute("href", blogEnFallback);
    langLink.textContent = "EN";
    langLink.setAttribute("aria-label", "Switch to English");
    return;
  }

  // 中文一般頁 → 正常切英文對應頁
  const enUrl = body.dataset.enUrl || "./en/index.html";
  langLink.setAttribute("href", enUrl);
  langLink.textContent = "EN";
  langLink.setAttribute("aria-label", "Switch to English");
}

function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  const toggleVisibility = () => {
    if (window.scrollY > 360) {
      backToTopButton.classList.add("is-visible");
    } else {
      backToTopButton.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  toggleVisibility();
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

async function initSharedHeader() {
  await loadComponent("#site-header", getComponentPath("header.html"));

  const headerRoot = document.querySelector("#site-header");
  if (!headerRoot) return;

  toggleBlogNav(headerRoot);
  setActiveNav(headerRoot);
  bindMobileNav(headerRoot);
  bindLangSwitcher(headerRoot);
}

async function initSharedFooter() {
  await loadComponent("#site-footer", getComponentPath("footer.html"));
}

async function initSharedLayout() {
  initGoogleAnalytics();

  await initSharedHeader();
  await initSharedFooter();

  initBackToTop();
  initHeaderScroll();
}

document.addEventListener("DOMContentLoaded", initSharedLayout);