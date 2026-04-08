window.AdminCommon = {
  renderLayout(pageKey, title, desc) {
    const pageTitle = document.getElementById("page-title");
    const pageDesc = document.getElementById("page-desc");

    if (pageTitle) pageTitle.textContent = title || "Dashboard";
    if (pageDesc) pageDesc.textContent = desc || "";

    const navLinks = document.querySelectorAll(".admin-nav a");
    navLinks.forEach(link => {
      link.classList.remove("is-active");
      if (link.dataset.page === pageKey) {
        link.classList.add("is-active");
      }
    });
  },

  formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  },

  escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
};