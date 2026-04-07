document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  initPage();
});

async function initPage() {
  AdminCommon.renderLayout(
    "content",
    "內容管理",
    "管理文章欄位、SEO 設定、排程發佈與發布狀態。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  await render();

  async function render() {
    let articles = [];
    let leads = [];

    try {
      [articles, leads] = await Promise.all([
        ArticleStore.getArticles(),
        ArticleStore.getLeads()
      ]);
    } catch (error) {
      console.error("載入文章資料失敗：", error);
      root.innerHTML = `
        <div class="card">
          <div class="card__body">
            <p>載入內容管理資料失敗：${error.message}</p>
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="toolbar" style="gap:12px;flex-wrap:wrap;">
        <div class="toolbar__left" style="display:flex;gap:12px;flex-wrap:wrap;">
          <input id="search-input" class="input" style="width:280px" placeholder="搜尋文章標題">
          <select id="status-filter" class="select" style="width:180px">
            <option value="all">全部狀態</option>
            <option value="draft">草稿</option>
            <option value="scheduled">排程中</option>
            <option value="published">已發布</option>
          </select>
        </div>
        <div class="toolbar__right">
          <a class="btn btn--primary" href="./ai-generate.html">新增文章</a>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>標題</th>
                  <th>狀態</th>
                  <th>分類</th>
                  <th>排程時間</th>
                  <th>PV</th>
                  <th>Leads</th>
                  <th>更新時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="article-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const tbody = document.getElementById("article-tbody");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");

    const drawRows = (list) => {
      tbody.innerHTML =
        list
          .map((article) => {
            const articleLeads = leads.filter(
              (lead) => lead.sourceArticleId === article.id
            ).length;

            return `
              <tr>
                <td>
                  <strong>${escapeHtml(article.title)}</strong>
                  <div class="inline-meta">
                    <span>slug: ${escapeHtml(article.slug)}</span>
                  </div>
                </td>
                <td>${AdminCommon.statusBadge(article.status)}</td>
                <td>${escapeHtml(article.category || "-")}</td>
                <td>${AdminCommon.formatDate(article.scheduledAt)}</td>
                <td>0</td>
                <td>${articleLeads}</td>
                <td>${AdminCommon.formatDate(article.updatedAt)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn--soft" data-action="view" data-id="${article.id}">查看</button>
                    <button class="btn btn--line" data-action="edit" data-id="${article.id}">編輯</button>
                    <button class="btn btn--primary" data-action="publish" data-id="${article.id}">
                      ${article.status === "published" ? "下架" : "發布"}
                    </button>
                    <button class="btn btn--danger" data-action="delete" data-id="${article.id}">刪除</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("") || `<tr><td colspan="8">目前沒有文章</td></tr>`;
    };

    function applyFilters() {
      const keyword = (searchInput?.value || "").trim().toLowerCase();
      const status = statusFilter?.value || "all";

      const filtered = articles.filter((item) => {
        const matchKeyword =
          (item.title || "").toLowerCase().includes(keyword) ||
          (item.summary || "").toLowerCase().includes(keyword);

        const matchStatus =
          status === "all" ? true : item.status === status;

        return matchKeyword && matchStatus;
      });

      drawRows(filtered);
    }

    drawRows(articles);

    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);

    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      const article = articles.find((item) => item.id === id);
      if (!article) return;

      if (action === "view") {
        viewArticle(article, leads);
        return;
      }

      if (action === "edit") {
        editArticle(article);
        return;
      }

      if (action === "publish") {
        try {
          if (article.status === "published") {
            await ArticleStore.updateArticle(id, {
              status: "draft",
              scheduledAt: null
            });
          } else {
            await ArticleStore.updateArticle(id, {
              status: "published",
              scheduledAt: null
            });
          }

          await render();
        } catch (error) {
          console.error("更新發布狀態失敗：", error);
          alert(`更新失敗：${error.message}`);
        }
        return;
      }

      if (action === "delete") {
        if (!confirm(`確定刪除「${article.title}」？`)) return;

        try {
          await ArticleStore.deleteArticle(id);
          await render();
        } catch (error) {
          console.error("刪除文章失敗：", error);
          alert(`刪除失敗：${error.message}`);
        }
      }
    });
  }

  function viewArticle(article, leads) {
    const articleLeads = leads.filter(
      (lead) => lead.sourceArticleId === article.id
    ).length;

    const scheduledInfo =
      article.scheduledAt
        ? `<span>排程時間：${AdminCommon.formatDate(article.scheduledAt)}</span>`
        : `<span>排程時間：-</span>`;

    AdminCommon.openModal({
      title: article.title,
      subtitle: `狀態：${article.status}｜Slug：${article.slug}`,
      body: `
        <div class="grid grid--2">
          <div>
            <strong>摘要</strong>
            <p>${escapeHtml(article.summary || "-")}</p>
          </div>
          <div>
            <strong>SEO</strong>
            <p>
              SEO Title：${escapeHtml(article.seoTitle || "-")}<br>
              SEO Description：${escapeHtml(article.seoDescription || "-")}
            </p>
          </div>
        </div>

        <div class="inline-meta" style="margin:12px 0 16px;">
          <span>PV：0</span>
          <span>Leads：${articleLeads}</span>
          <span>轉換率：-</span>
          ${scheduledInfo}
        </div>

        <div style="line-height:1.85;color:#334155">${article.content || ""}</div>

        <div style="margin-top:18px">
          <a class="btn btn--line" href="../article.html?slug=${article.slug}" target="_blank">前台預覽</a>
        </div>
      `
    });
  }

  function editArticle(article) {
    AdminCommon.openModal({
      title: "編輯文章",
      subtitle: article.title,
      body: `
        <form id="edit-form" class="form-grid">
          <div class="full">
            <label>標題</label>
            <input class="input" name="title" value="${escapeAttr(article.title)}">
          </div>

          <div>
            <label>分類</label>
            <input class="input" name="category" value="${escapeAttr(article.category || "")}">
          </div>

          <div>
            <label>Slug</label>
            <input class="input" name="slug" value="${escapeAttr(article.slug)}">
          </div>

          <div class="full">
            <label>摘要</label>
            <textarea class="textarea" name="summary">${escapeHtml(article.summary || "")}</textarea>
          </div>

          <div class="full">
            <label>內容</label>
            <textarea class="textarea" name="content" style="min-height:220px">${escapeHtml(article.content || "")}</textarea>
          </div>

          <div class="full">
            <label>SEO Title</label>
            <input class="input" name="seoTitle" value="${escapeAttr(article.seoTitle || "")}">
          </div>

          <div class="full">
            <label>SEO Description</label>
            <textarea class="textarea" name="seoDescription">${escapeHtml(article.seoDescription || "")}</textarea>
          </div>

          <div>
            <label>狀態</label>
            <select class="select" name="status" id="article-status-select">
              <option value="draft" ${article.status === "draft" ? "selected" : ""}>草稿</option>
              <option value="scheduled" ${article.status === "scheduled" ? "selected" : ""}>排程中</option>
              <option value="published" ${article.status === "published" ? "selected" : ""}>已發布</option>
            </select>
          </div>

          <div>
            <label>排程發佈時間</label>
            <input
              class="input"
              type="datetime-local"
              name="scheduledAt"
              id="scheduled-at-input"
              value="${formatDateTimeLocal(article.scheduledAt)}"
            >
          </div>

          <div class="full" style="padding:12px 14px;border-radius:12px;background:#f8fafc;color:var(--muted);line-height:1.8;">
            <strong style="color:#0f172a;">使用說明：</strong><br>
            1. 若狀態選擇 <strong>排程中</strong>，請務必填寫排程發佈時間。<br>
            2. 若狀態為 <strong>已發布</strong>，系統會忽略排程時間並立即視為已上線。<br>
            3. 若狀態為 <strong>草稿</strong>，排程時間可留空。
          </div>

          <div style="display:flex;align-items:end">
            <button class="btn btn--primary" type="submit">儲存變更</button>
          </div>
        </form>
      `
    });

    const form = document.getElementById("edit-form");
    const statusSelect = document.getElementById("article-status-select");
    const scheduledInput = document.getElementById("scheduled-at-input");

    if (!form) return;

    function syncScheduledField() {
      if (!statusSelect || !scheduledInput) return;

      if (statusSelect.value === "scheduled") {
        scheduledInput.required = true;
        scheduledInput.disabled = false;
      } else if (statusSelect.value === "published") {
        scheduledInput.required = false;
        scheduledInput.disabled = true;
      } else {
        scheduledInput.required = false;
        scheduledInput.disabled = false;
      }
    }

    statusSelect?.addEventListener("change", syncScheduledField);
    syncScheduledField();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(e.target);
      const patch = Object.fromEntries(fd.entries());

      if (patch.status === "scheduled" && !patch.scheduledAt) {
        alert("請先設定排程發佈時間");
        return;
      }

      if (patch.status === "published") {
        patch.scheduledAt = null;
      }

      if (patch.status === "draft" && !patch.scheduledAt) {
        patch.scheduledAt = null;
      }

      try {
        await ArticleStore.updateArticle(article.id, patch);
        AdminCommon.closeModal();
        await render();
      } catch (error) {
        console.error("更新文章失敗：", error);
        alert(`儲存失敗：${error.message}`);
      }
    });
  }
}

function formatDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}