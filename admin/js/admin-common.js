function renderLayout(pageKey, pageTitle, pageDesc = "") {
  const active = (key) => (key === pageKey ? "is-active" : "");

  document.body.classList.add("admin-body");
  document.body.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand__badge">A</div>
          <div class="brand__text">
            <strong>Aplus Admin</strong>
            <span>內容獲客後台</span>
          </div>
        </div>

        <nav>
          <a class="nav-link ${active("dashboard")}" href="./index.html">總覽 Dashboard</a>
          <a class="nav-link ${active("content")}" href="./content.html">內容管理</a>
          <a class="nav-link ${active("analytics")}" href="./analytics.html">成效分析</a>
          <a class="nav-link ${active("leads")}" href="./leads.html">詢問名單</a>
          <a class="nav-link ${active("generate")}" href="./ai-generate.html">AI 內容生成</a>
          <a class="nav-link ${active("auto-generate")}" href="./auto-generate.html">自動產文</a>
        </nav>

        <div class="nav-footer">
          前台預覽：<a href="../blog.html" target="_blank">blog.html</a>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="topbar__title">
            <h1>${pageTitle}</h1>
            <p>${pageDesc}</p>
          </div>

          <div class="topbar__actions">
            <span class="badge badge--soft">zh-TW</span>
            <a class="btn btn--line" href="../blog.html" target="_blank">前台預覽</a>
            <button id="admin-logout-btn" class="btn btn--soft" type="button">登出</button>
          </div>
        </header>

        <main class="content" id="page-root"></main>
      </div>
    </div>

    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal" id="modal">
        <div class="modal__header">
          <div>
            <h3 id="modal-title" style="margin:0;font-size:24px;"></h3>
            <p id="modal-subtitle" style="margin:8px 0 0;color:var(--muted)"></p>
          </div>
          <button class="close-btn" id="modal-close" type="button">✕</button>
        </div>
        <div class="modal__body" id="modal-body"></div>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn && window.AdminAuth?.signOutAdmin) {
    logoutBtn.addEventListener("click", async () => {
      await window.AdminAuth.signOutAdmin();
    });
  }

  bindModalClose();
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(text = "") {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function statusBadge(status) {
  const map = {
  draft: ['草稿', 'badge--muted'],
  published: ['已發布', 'badge--success'],
  scheduled: ['排程中', 'badge--warning'],
  archived: ['已封存', 'badge--warning'],
  new: ['未處理', 'badge--muted'],
  contacted: ['已聯絡', 'badge--soft'],
  negotiating: ['成交中', 'badge--warning'],
  won: ['已成交', 'badge--success'],
  lost: ['未成交', 'badge--danger']
};

  const [label, cls] = map[status] || [status || "-", "badge--muted"];
  return `<span class="badge ${cls}">${label}</span>`;
}

function openModal({ title = "", subtitle = "", body = "" }) {
  const titleEl = document.getElementById("modal-title");
  const subtitleEl = document.getElementById("modal-subtitle");
  const bodyEl = document.getElementById("modal-body");
  const backdrop = document.getElementById("modal-backdrop");

  if (!titleEl || !subtitleEl || !bodyEl || !backdrop) return;

  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  bodyEl.innerHTML = body;
  backdrop.classList.add("is-open");
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
}

function bindModalClose() {
  document.getElementById("modal-close")?.addEventListener("click", closeModal);

  document.getElementById("modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") {
      closeModal();
    }
  });
}

window.AdminCommon = {
  renderLayout,
  formatDate,
  escapeHtml,
  statusBadge,
  openModal,
  closeModal
};