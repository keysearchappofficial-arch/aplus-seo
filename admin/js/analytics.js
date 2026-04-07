document.addEventListener("DOMContentLoaded", async () => {
  AdminCommon.renderLayout(
    "analytics",
    "成效分析",
    "查看單篇文章的 PV、Leads 與轉換率。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  let articles = [];
  let leads = [];
  let events = [];

  try {
    [articles, leads, events] = await Promise.all([
      ArticleStore.getArticles(),
      ArticleStore.getLeads(),
      ArticleStore.getTrackingEvents()
    ]);
  } catch (error) {
    console.error(error);
    root.innerHTML = `
      <div class="card">
        <div class="card__body">載入失敗：${error.message}</div>
      </div>
    `;
    return;
  }

  if (!articles.length) {
    root.innerHTML = `
      <div class="card">
        <div class="card__body">目前尚無文章可分析。</div>
      </div>
    `;
    return;
  }

  const options = articles
    .map((item) => `<option value="${item.id}">${escapeHtml(item.title)}</option>`)
    .join("");

  root.innerHTML = `
    <div class="card">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <select id="article-select" class="select" style="width:420px">
              ${options}
            </select>
          </div>
        </div>

        <div id="analytics-view"></div>
      </div>
    </div>
  `;

  const select = document.getElementById("article-select");
  const view = document.getElementById("analytics-view");

  function renderArticleAnalytics(id) {
    const article = articles.find((item) => item.id === id);

    if (!article) {
      view.innerHTML = `<div class="empty">找不到文章</div>`;
      return;
    }

    const articleEvents = events.filter(
      (item) => item.article_id === id && item.event_type === "page_view"
    );

    const articleLeads = leads.filter(
      (item) => item.sourceArticleId === id
    );

    const pv = articleEvents.length;
    const uv = 0; // 目前尚未做 visitor/session 去重，先保留 0
    const formSubmits = articleLeads.length;
    const leadCount = articleLeads.length;
    const conversionRate =
      pv > 0 ? Number(((leadCount / pv) * 100).toFixed(2)) : 0;

    view.innerHTML = `
      <div class="grid grid--4">
        <div class="card">
          <div class="card__body kpi">
            <div class="kpi__label">PV</div>
            <div class="kpi__value">${pv}</div>
          </div>
        </div>

        <div class="card">
          <div class="card__body kpi">
            <div class="kpi__label">UV</div>
            <div class="kpi__value">${uv}</div>
          </div>
        </div>

        <div class="card">
          <div class="card__body kpi">
            <div class="kpi__label">表單送出</div>
            <div class="kpi__value">${formSubmits}</div>
          </div>
        </div>

        <div class="card">
          <div class="card__body kpi">
            <div class="kpi__label">轉換率</div>
            <div class="kpi__value">${conversionRate}%</div>
          </div>
        </div>
      </div>

      <div class="grid grid--2" style="margin-top:20px;">
        <div class="card">
          <div class="card__body">
            <h3 class="card__title">文章資訊</h3>
            <div class="stat-list">
              <div class="stat-item"><strong>標題</strong><span>${escapeHtml(article.title)}</span></div>
              <div class="stat-item"><strong>狀態</strong><span>${escapeHtml(article.status)}</span></div>
              <div class="stat-item"><strong>Slug</strong><span>${escapeHtml(article.slug)}</span></div>
              <div class="stat-item"><strong>SEO</strong><span>${escapeHtml(article.seoTitle || "-")}</span></div>
              <div class="stat-item"><strong>前台連結</strong><span><a href="../article.html?slug=${encodeURIComponent(article.slug)}" target="_blank">查看文章</a></span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <h3 class="card__title">來源名單</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>聯絡方式</th>
                    <th>需求</th>
                    <th>時間</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    articleLeads.length
                      ? articleLeads
                          .map(
                            (lead) => `
                              <tr>
                                <td>${escapeHtml(lead.name || "-")}</td>
                                <td>${escapeHtml(lead.contact || "-")}</td>
                                <td>${escapeHtml(lead.message || "-")}</td>
                                <td>${escapeHtml(formatDate(lead.createdAt))}</td>
                              </tr>
                            `
                          )
                          .join("")
                      : `<tr><td colspan="4">目前尚無名單</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderArticleAnalytics(select.value);
  select.addEventListener("change", () => {
    renderArticleAnalytics(select.value);
  });
});

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}