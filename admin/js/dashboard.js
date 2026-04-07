document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "dashboard",
    "總覽 Dashboard",
    "掌握文章、流量、名單、排程與轉換成效。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  let stats;

  try {
    stats = await ArticleStore.getDashboardStats();
  } catch (error) {
    console.error("載入 dashboard 失敗：", error);
    root.innerHTML = `<div class="card"><div class="card__body">載入失敗：${error.message}</div></div>`;
    return;
  }

  const allArticles = stats.articles || [];
  const publishedArticles = stats.published || [];
  const latestLeads = (stats.leads || []).slice(0, 6);

  const publishedCount = publishedArticles.length;
  const draftCount = allArticles.filter((item) => item.status === "draft").length;
  const scheduledArticles = allArticles
    .filter((item) => item.status === "scheduled")
    .sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return aTime - bTime;
    });

  const scheduledCount = scheduledArticles.length;
  const upcomingScheduled = scheduledArticles.slice(0, 5);

  const topRows =
    (stats.topArticles || [])
      .map(({ article, analytics }, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(article.title)}</strong></td>
          <td>${analytics.pv || 0}</td>
          <td>${analytics.leads || 0}</td>
          <td>${analytics.conversionRate || 0}%</td>
        </tr>
      `)
      .join("") || `<tr><td colspan="5">目前尚無資料</td></tr>`;

  const leadRows =
    latestLeads
      .map(
        (lead) => `
        <tr>
          <td>${escapeHtml(lead.name || "-")}</td>
          <td>${escapeHtml(lead.contact || "-")}</td>
          <td>${escapeHtml(lead.sourceArticleTitle || "-")}</td>
          <td>${AdminCommon.statusBadge(lead.status || "new")}</td>
          <td>${AdminCommon.formatDate(lead.createdAt)}</td>
        </tr>
      `
      )
      .join("") || `<tr><td colspan="5">目前尚無名單</td></tr>`;

  const upcomingRows =
    upcomingScheduled
      .map(
        (article) => `
        <tr>
          <td><strong>${escapeHtml(article.title)}</strong></td>
          <td>${escapeHtml(article.category || "-")}</td>
          <td>${AdminCommon.formatDate(article.scheduledAt)}</td>
          <td>
            <a class="btn btn--line" href="./content.html">查看</a>
          </td>
        </tr>
      `
      )
      .join("") || `<tr><td colspan="4">目前沒有排程中的文章</td></tr>`;

  // 目前先用 published 文章的詢問數做簡單圖表
  const chartData = publishedArticles.slice(0, 6).map((article) => {
    const leadCount = (stats.leads || []).filter(
      (l) => l.sourceArticleId === article.id
    ).length;

    return {
      article,
      analytics: {
        pv: 0,
        leads: leadCount
      }
    };
  });

  const maxValue = Math.max(
    ...(chartData.map((item) => Number(item.analytics.leads) || 0)),
    10
  );

  const bars =
    chartData
      .map((item) => {
        const value = Number(item.analytics.leads) || 0;
        const height = Math.max(18, Math.round((value / maxValue) * 200));
        const short =
          item.article.title.length > 8
            ? item.article.title.slice(0, 8) + "…"
            : item.article.title;

        return `
          <div class="chart-bar">
            <div class="chart-bar__fill" style="height:${height}px"></div>
            <div class="chart-bar__label">${escapeHtml(short)}</div>
          </div>
        `;
      })
      .join("") ||
    '<div class="empty">發布文章後，這裡會顯示熱門文章趨勢。</div>';

  root.innerHTML = `
    <section class="grid grid--4">
      <div class="card">
        <div class="card__body kpi">
          <div class="kpi__label">總瀏覽量（PV）</div>
          <div class="kpi__value">${stats.totalPv || 0}</div>
          <div class="kpi__sub">已發布文章 ${publishedCount} 篇</div>
        </div>
      </div>

      <div class="card">
        <div class="card__body kpi">
          <div class="kpi__label">總詢問數（Leads）</div>
          <div class="kpi__value">${stats.totalLeads || 0}</div>
          <div class="kpi__sub">最新內容可持續導入名單</div>
        </div>
      </div>

      <div class="card">
        <div class="card__body kpi">
          <div class="kpi__label">排程中文章</div>
          <div class="kpi__value">${scheduledCount}</div>
          <div class="kpi__sub">等待系統自動發布</div>
        </div>
      </div>

      <div class="card">
        <div class="card__body kpi">
          <div class="kpi__label">轉換率</div>
          <div class="kpi__value">${stats.conversionRate || 0}%</div>
          <div class="kpi__sub">Leads / PV</div>
        </div>
      </div>
    </section>

    <section class="grid grid--2" style="margin-top:20px;">
      <div class="card">
        <div class="card__body">
          <h3 class="card__title">熱門文章（依詢問數）</h3>
          <div class="chart-bars">${bars}</div>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="toolbar">
            <h3 class="card__title" style="margin:0;">熱門文章 Top 5</h3>
            <a href="./content.html" class="link-muted">查看全部</a>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>文章</th>
                  <th>PV</th>
                  <th>Leads</th>
                  <th>轉換率</th>
                </tr>
              </thead>
              <tbody>${topRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid--2" style="margin-top:20px;">
      <div class="card">
        <div class="card__body">
          <div class="toolbar">
            <h3 class="card__title" style="margin:0;">最新詢問名單</h3>
            <a href="./leads.html" class="link-muted">名單管理</a>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>聯絡方式</th>
                  <th>來源文章</th>
                  <th>狀態</th>
                  <th>時間</th>
                </tr>
              </thead>
              <tbody>${leadRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="toolbar">
            <h3 class="card__title" style="margin:0;">即將發布文章</h3>
            <a href="./content.html" class="link-muted">內容管理</a>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>標題</th>
                  <th>分類</th>
                  <th>排程時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>${upcomingRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section style="margin-top:20px;">
      <div class="card">
        <div class="card__body">
          <h3 class="card__title">管理建議</h3>
          <div class="stat-list">
            <div class="stat-item"><strong>內容數量</strong><span>${allArticles.length} 篇</span></div>
            <div class="stat-item"><strong>已發布</strong><span>${publishedCount} 篇</span></div>
            <div class="stat-item"><strong>草稿</strong><span>${draftCount} 篇</span></div>
            <div class="stat-item"><strong>排程中</strong><span>${scheduledCount} 篇</span></div>
            <div class="stat-item"><strong>下一步</strong><span>檢查草稿品質並安排發布節奏</span></div>
          </div>
        </div>
      </div>
    </section>
  `;
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}