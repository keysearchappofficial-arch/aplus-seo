document.addEventListener("DOMContentLoaded", async () => {
  const statsRoot = document.getElementById("analytics-stats");
  const table = document.getElementById("analytics-table");

  try {
    const stats = await window.ArticleStore.getDashboardStats();

    statsRoot.innerHTML = `
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
      table.innerHTML = `<tr><td colspan="4">目前沒有成效資料</td></tr>`;
      return;
    }

    table.innerHTML = stats.topArticles.map(item => `
      <tr>
        <td>${escapeHtml(item.article.title)}</td>
        <td>${item.analytics.pv}</td>
        <td>${item.analytics.leads}</td>
        <td>${item.analytics.conversionRate}%</td>
      </tr>
    `).join("");
  } catch (error) {
    alert("載入分析失敗：" + error.message);
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
});