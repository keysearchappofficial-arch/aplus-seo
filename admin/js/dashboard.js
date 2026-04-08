document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "dashboard",
    "Dashboard",
    "掌握文章、流量、名單與轉換表現。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="dashboard-stack">
      <div class="stats-grid" id="stats-grid"></div>

      <div class="dashboard-row">
        <div class="card">
          <div class="card__body">
            <h3 class="card__title">熱門文章</h3>
            <div id="top-articles"></div>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <h3 class="card__title">最新名單</h3>
            <div id="latest-leads"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <h3 class="card__title">文章總覽</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>標題</th>
                  <th>分類</th>
                  <th>狀態</th>
                  <th>發布時間</th>
                </tr>
              </thead>
              <tbody id="article-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const statsGrid = document.getElementById("stats-grid");
  const topArticlesEl = document.getElementById("top-articles");
  const latestLeadsEl = document.getElementById("latest-leads");
  const tableBody = document.getElementById("article-table-body");

  try {
    const stats = await ArticleStore.getDashboardStats();

    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__label">總文章數</div>
        <div class="stat-card__value">${stats.articles.length}</div>
        <div class="stat-card__hint">含草稿、排程與已發布</div>
      </div>

      <div class="stat-card">
        <div class="stat-card__label">已發布文章</div>
        <div class="stat-card__value">${stats.published.length}</div>
        <div class="stat-card__hint">可在前台看到</div>
      </div>

      <div class="stat-card">
        <div class="stat-card__label">總 PV</div>
        <div class="stat-card__value">${stats.totalPv}</div>
        <div class="stat-card__hint">文章瀏覽總量</div>
      </div>

      <div class="stat-card">
        <div class="stat-card__label">總名單數</div>
        <div class="stat-card__value">${stats.totalLeads}</div>
        <div class="stat-card__hint">轉換率 ${stats.conversionRate}%</div>
      </div>
    `;

    if (!stats.topArticles.length) {
      topArticlesEl.innerHTML = `<div class="empty-state">目前沒有熱門文章資料</div>`;
    } else {
      topArticlesEl.innerHTML = `
        <div class="dashboard-list">
          ${stats.topArticles.map(item => `
            <div class="dashboard-list__item">
              <div>
                <strong>${AdminCommon.escapeHtml(item.article.title)}</strong>
                <span>PV ${item.analytics.pv} ／ Leads ${item.analytics.leads}</span>
              </div>
              <span>${item.analytics.conversionRate}%</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (!stats.latestLeads.length) {
      latestLeadsEl.innerHTML = `<div class="empty-state">目前沒有新名單</div>`;
    } else {
      latestLeadsEl.innerHTML = `
        <div class="dashboard-list">
          ${stats.latestLeads.map(lead => `
            <div class="dashboard-list__item">
              <div>
                <strong>${AdminCommon.escapeHtml(lead.name || "未命名")}</strong>
                <span>${AdminCommon.escapeHtml(lead.sourceArticleTitle || "未知來源")}</span>
              </div>
              <span>${AdminCommon.formatDateTime(lead.createdAt)}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (!stats.articles.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">目前還沒有文章</div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = stats.articles.map(article => `
        <tr>
          <td>${AdminCommon.escapeHtml(article.title)}</td>
          <td>${AdminCommon.escapeHtml(article.category || "-")}</td>
          <td><span class="badge">${AdminCommon.escapeHtml(article.status)}</span></td>
          <td>${AdminCommon.formatDateTime(article.publishedAt || article.createdAt)}</td>
        </tr>
      `).join("");
    }
  } catch (error) {
    console.error("Dashboard 載入失敗：", error);
    root.innerHTML = `
      <div class="card">
        <div class="card__body">
          Dashboard 載入失敗：${AdminCommon.escapeHtml(error.message)}
        </div>
      </div>
    `;
  }
});