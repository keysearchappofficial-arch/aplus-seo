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
          <h3 class="card__title">關鍵字流量分析</h3>
          <div id="keyword-analytics"></div>
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
                  <th>行業</th>
                  <th>關鍵字策略</th>
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

  requestAnimationFrame(initDashboard);

  async function initDashboard() {
    const statsGrid = document.getElementById("stats-grid");
    const topArticlesEl = document.getElementById("top-articles");
    const latestLeadsEl = document.getElementById("latest-leads");
    const keywordAnalyticsEl = document.getElementById("keyword-analytics");
    const tableBody = document.getElementById("article-table-body");

    if (!statsGrid || !topArticlesEl || !latestLeadsEl || !keywordAnalyticsEl || !tableBody) {
      console.warn("⚠️ Dashboard DOM 尚未準備好");
      return;
    }

    try {
      const stats = await ArticleStore.getDashboardStats();
      const keywordStats = buildKeywordAnalytics(stats);

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
            <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
              <div style="font-weight:700;color:#0f172a;">
                ${AdminCommon.escapeHtml(item.article.title)}
              </div>
              <div style="font-size:13px;color:#64748b;margin-top:4px;">
                PV：${item.analytics.pv} ｜ 名單：${item.analytics.leads}
              </div>
            </div>
          `).join("")
        : `<div style="color:#64748b;">沒有資料</div>`;

      latestLeadsEl.innerHTML = stats.leads.length
        ? stats.leads.slice(0, 5).map(l => `
            <div style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
              <div style="font-weight:700;color:#0f172a;">
                ${AdminCommon.escapeHtml(l.name || "-")}
              </div>
              <div style="font-size:13px;color:#64748b;margin-top:4px;">
                ${AdminCommon.escapeHtml(l.contact || "-")}
              </div>
            </div>
          `).join("")
        : `<div style="color:#64748b;">沒有資料</div>`;

      keywordAnalyticsEl.innerHTML = keywordStats.length
        ? `
          <div style="display:grid;gap:12px;">
            ${keywordStats.map((item, index) => `
              <div style="padding:14px 16px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                  <div>
                    <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Top ${index + 1}</div>
                    <div style="font-weight:700;color:#0f172a;line-height:1.7;">
                      ${AdminCommon.escapeHtml(item.keywordStrategy)}
                    </div>
                  </div>
                  <div style="text-align:right;min-width:80px;">
                    <div style="font-size:12px;color:#64748b;">PV</div>
                    <div style="font-size:24px;font-weight:800;color:#0f172a;">${item.pv}</div>
                  </div>
                </div>
                <div style="margin-top:8px;font-size:13px;color:#64748b;">
                  行業：${AdminCommon.escapeHtml(item.industryCategory || "-")} ｜ 文章數：${item.articleCount}
                </div>
              </div>
            `).join("")}
          </div>
        `
        : `<div style="color:#64748b;">目前尚無關鍵字分析資料</div>`;

      tableBody.innerHTML = stats.articles.map(a => `
        <tr>
          <td>${AdminCommon.escapeHtml(a.title)}</td>
          <td>${AdminCommon.escapeHtml(a.industryCategory || "-")}</td>
          <td style="max-width:260px;">
            <div
              title="${AdminCommon.escapeHtml(a.keyword_strategy || "")}"
              style="
                font-size:12px;
                color:#64748b;
                line-height:1.6;
                display:-webkit-box;
                -webkit-line-clamp:2;
                -webkit-box-orient:vertical;
                overflow:hidden;
                cursor:pointer;
              "
            >
              ${AdminCommon.escapeHtml(a.keyword_strategy || "-")}
            </div>
          </td>
          <td>${AdminCommon.escapeHtml(a.status || "-")}</td>
          <td>${formatDate(a.publishedAt || a.createdAt)}</td>
        </tr>
      `).join("");

    } catch (error) {
      console.error("Dashboard error:", error);
      root.innerHTML = `<p>載入失敗：${error.message}</p>`;
    }
  }

  function buildKeywordAnalytics(stats) {
    const publishedArticles = (stats.articles || []).filter(a => a.status === "published");

    const result = publishedArticles.map(article => {
      const pv = (stats.events || []).filter(event =>
        event.article_id === article.id && event.event_type === "page_view"
      ).length;

      return {
        articleId: article.id,
        title: article.title || "",
        industryCategory: article.industryCategory || "",
        keywordStrategy: article.keyword_strategy || "",
        pv
      };
    });

    const grouped = new Map();

    result.forEach(item => {
      const key = item.keywordStrategy || "";
      if (!key) return;

      if (!grouped.has(key)) {
        grouped.set(key, {
          keywordStrategy: key,
          industryCategory: item.industryCategory || "",
          pv: 0,
          articleCount: 0
        });
      }

      const current = grouped.get(key);
      current.pv += item.pv;
      current.articleCount += 1;
    });

    return [...grouped.values()]
      .sort((a, b) => b.pv - a.pv)
      .slice(0, 8);
  }

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-TW");
  }
});