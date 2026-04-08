document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "analytics",
    "成效分析",
    "查看文章流量、名單與轉換率"
  );

  const statsRoot = document.getElementById("analytics-stats");
  const table = document.getElementById("analytics-table");
  const root = document.getElementById("page-root");

  if (!root) return;

  root.innerHTML = `
    <div class="stats-grid" id="analytics-stats" style="margin-bottom:20px;"></div>

    <div class="card">
      <div class="card__body">
        <h3 class="card__title">文章成效</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>文章</th>
                <th>PV</th>
                <th>名單</th>
                <th>轉換率</th>
              </tr>
            </thead>
            <tbody id="analytics-table"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const statsEl = document.getElementById("analytics-stats");
  const tableEl = document.getElementById("analytics-table");

  try {
    const stats = await window.ArticleStore.getDashboardStats();

    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__label">總 PV</div>
        <div class="stat-card__value">${stats.totalPv}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">總名單</div>
        <div class="stat-card__value">${stats.totalLeads}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">已發布文章</div>
        <div class="stat-card__value">${stats.published.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">整體轉換率</div>
        <div class="stat-card__value">${stats.conversionRate}%</div>
      </div>
    `;

    if (!stats.topArticles.length) {
      tableEl.innerHTML = `<tr><td colspan="4">目前沒有成效資料</td></tr>`;
      return;
    }

    tableEl.innerHTML = stats.topArticles.map(item => `
      <tr>
        <td>${AdminCommon.escapeHtml(item.article.title)}</td>
        <td>${item.analytics.pv}</td>
        <td>${item.analytics.leads}</td>
        <td>${item.analytics.conversionRate}%</td>
      </tr>
    `).join("");
  } catch (error) {
    alert("載入分析失敗：" + error.message);
  }
});