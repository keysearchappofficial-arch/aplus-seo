document.addEventListener("DOMContentLoaded", async () => {

  // ✅ 一定要先載入 layout
  await window.loadAdminLayout();

  // ✅ 再做登入驗證
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  // ✅ 再 render layout
  AdminCommon.renderLayout(
    "dashboard",
    "Dashboard",
    "掌握文章、流量、名單與轉換表現。"
  );

  const root = document.getElementById("page-root");
  if (!root) {
    console.error("❌ page-root 不存在");
    return;
  }

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

  // ✅ 等 DOM render 完再抓元素（關鍵）
  requestAnimationFrame(initDashboard);

  async function initDashboard() {
    const statsGrid = document.getElementById("stats-grid");
    const topArticlesEl = document.getElementById("top-articles");
    const latestLeadsEl = document.getElementById("latest-leads");
    const tableBody = document.getElementById("article-table-body");

    if (!statsGrid || !topArticlesEl || !latestLeadsEl || !tableBody) {
      console.warn("⚠️ Dashboard DOM 尚未準備好");
      return;
    }

    try {
      const stats = await ArticleStore.getDashboardStats();

      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-card__label">總文章數</div>
          <div class="stat-card__value">${stats.articles.length}</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label">已發布</div>
          <div class="stat-card__value">${stats.published.length}</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label">總 PV</div>
          <div class="stat-card__value">${stats.totalPv}</div>
        </div>

        <div class="stat-card">
          <div class="stat-card__label">名單數</div>
          <div class="stat-card__value">${stats.totalLeads}</div>
        </div>
      `;

      topArticlesEl.innerHTML = stats.topArticles.length
        ? stats.topArticles.map(item => `
            <div>
              ${AdminCommon.escapeHtml(item.article.title)} (${item.analytics.pv})
            </div>
          `).join("")
        : "沒有資料";

      latestLeadsEl.innerHTML = stats.leads.slice(0, 5).map(l => `
        <div>${AdminCommon.escapeHtml(l.name || "-")}</div>
      `).join("");

      tableBody.innerHTML = stats.articles.map(a => `
        <tr>
          <td>${AdminCommon.escapeHtml(a.title)}</td>
          <td>${AdminCommon.escapeHtml(a.category || "-")}</td>
          <td>${a.status}</td>
          <td>${new Date(a.createdAt).toLocaleString()}</td>
        </tr>
      `).join("");

    } catch (error) {
      console.error("Dashboard error:", error);
      root.innerHTML = `<p>載入失敗：${error.message}</p>`;
    }
  }
});
