document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "content",
    "文章管理",
    "管理所有文章（草稿 / 已發布 / 排程）"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__body">

        <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <select id="filter-status" class="input" style="max-width:220px;">
            <option value="all">全部</option>
            <option value="published">已發布</option>
            <option value="draft">草稿</option>
            <option value="scheduled">排程中</option>
            <option value="deleted">已刪除</option>
          </select>

          <a href="./generate.html" class="btn btn--primary">新增文章</a>
        </div>

        <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <span id="selected-count" style="color:#64748b;font-size:14px;">已選 0 篇</span>
          <button id="bulk-publish-btn" class="btn btn--primary" type="button">批次發布</button>
          <button id="bulk-delete-btn" class="btn btn--soft" type="button">批次刪除</button>
          <button id="bulk-clear-btn" class="btn btn--ghost" type="button">清除選取</button>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:52px;">
                  <input id="select-all" type="checkbox" />
                </th>
                <th>標題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="article-table"></tbody>
          </table>
        </div>

      </div>
    </div>
  `;

  const supabase = window.supabaseClient;
  const table = document.getElementById("article-table");
  const filter = document.getElementById("filter-status");
  const selectAllEl = document.getElementById("select-all");
  const selectedCountEl = document.getElementById("selected-count");
  const bulkPublishBtn = document.getElementById("bulk-publish-btn");
  const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
  const bulkClearBtn = document.getElementById("bulk-clear-btn");

  let articles = [];
  let selectedIds = new Set();

  async function loadArticles() {
    try {
      articles = await ArticleStore.getArticles();
      cleanupSelection();
      render();
    } catch (error) {
      root.innerHTML = `
        <div class="card">
          <div class="card__body">
            載入失敗：${AdminCommon.escapeHtml(error.message)}
          </div>
        </div>
      `;
    }
  }

  function getFilteredArticles() {
    const status = filter.value;

    return status === "all"
      ? articles
      : articles.filter(a => a.status === status);
  }

  function cleanupSelection() {
    const validIds = new Set(articles.map(a => a.id));
    selectedIds = new Set([...selectedIds].filter(id => validIds.has(id)));
  }

  function updateSelectionUi() {
    const filtered = getFilteredArticles();
    const visibleIds = filtered.map(a => a.id);
    const visibleSelectedCount = visibleIds.filter(id => selectedIds.has(id)).length;

    if (selectedCountEl) {
      selectedCountEl.textContent = `已選 ${selectedIds.size} 篇`;
    }

    if (selectAllEl) {
      if (!visibleIds.length) {
        selectAllEl.checked = false;
        selectAllEl.indeterminate = false;
        return;
      }

      selectAllEl.checked = visibleSelectedCount === visibleIds.length;
      selectAllEl.indeterminate =
        visibleSelectedCount > 0 && visibleSelectedCount < visibleIds.length;
    }
  }

  function render() {
    const filtered = getFilteredArticles();

    if (!filtered.length) {
      table.innerHTML = `
        <tr>
          <td colspan="6">沒有資料</td>
        </tr>
      `;
      updateSelectionUi();
      return;
    }

    table.innerHTML = filtered.map(a => `
      <tr>
        <td>
          <input
            type="checkbox"
            class="row-check"
            data-id="${a.id}"
            ${selectedIds.has(a.id) ? "checked" : ""}
          />
        </td>
        <td>${AdminCommon.escapeHtml(a.title)}</td>
        <td>${AdminCommon.escapeHtml(a.category || "-")}</td>
        <td><span class="badge">${AdminCommon.escapeHtml(a.status || "-")}</span></td>
        <td>${formatDate(a.publishedAt || a.createdAt)}</td>
        <td style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn--soft" onclick="editArticle('${a.id}')">編輯</button>
          ${
            a.status !== "published" && a.status !== "deleted"
              ? `<button class="btn btn--primary" onclick="publish('${a.id}')">發布</button>`
              : ""
          }
          ${
            a.status !== "deleted"
              ? `<button class="btn btn--soft" onclick="deleteArticle('${a.id}')">刪除</button>`
              : ""
          }
        </td>
      </tr>
    `).join("");

    bindRowCheckboxes();
    updateSelectionUi();
  }

  function bindRowCheckboxes() {
    const rowChecks = table.querySelectorAll(".row-check");

    rowChecks.forEach(check => {
      check.addEventListener("change", (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }

        updateSelectionUi();
      });
    });
  }

  async function publishOne(id) {
    const { error } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) throw error;
  }

  async function deleteOne(id) {
    await ArticleStore.deleteArticleSoft(id);
  }

  window.editArticle = (id) => {
    window.location.href = `./edit.html?id=${id}`;
  };

  window.publish = async (id) => {
    if (!confirm("確定發布？")) return;

    try {
      await publishOne(id);
      alert("已發布");
      await loadArticles();
    } catch (error) {
      alert("發布失敗：" + error.message);
    }
  };

  window.deleteArticle = async (id) => {
    if (!confirm("確定刪除？")) return;

    try {
      await deleteOne(id);
      selectedIds.delete(id);
      alert("已刪除");
      await loadArticles();
    } catch (error) {
      alert("刪除失敗：" + error.message);
    }
  };

  selectAllEl.addEventListener("change", () => {
    const filtered = getFilteredArticles();
    const visibleIds = filtered.map(a => a.id);

    if (selectAllEl.checked) {
      visibleIds.forEach(id => selectedIds.add(id));
    } else {
      visibleIds.forEach(id => selectedIds.delete(id));
    }

    render();
  });

  bulkClearBtn.addEventListener("click", () => {
    selectedIds.clear();
    render();
  });

  bulkPublishBtn.addEventListener("click", async () => {
    const ids = [...selectedIds];
    if (!ids.length) {
      alert("請先選取文章");
      return;
    }

    if (!confirm(`確定要批次發布 ${ids.length} 篇文章嗎？`)) return;

    try {
      for (const id of ids) {
        const article = articles.find(a => a.id === id);
        if (!article) continue;
        if (article.status === "published" || article.status === "deleted") continue;
        await publishOne(id);
      }

      alert("批次發布完成");
      selectedIds.clear();
      await loadArticles();
    } catch (error) {
      alert("批次發布失敗：" + error.message);
    }
  });

  bulkDeleteBtn.addEventListener("click", async () => {
    const ids = [...selectedIds];
    if (!ids.length) {
      alert("請先選取文章");
      return;
    }

    if (!confirm(`確定要批次刪除 ${ids.length} 篇文章嗎？`)) return;

    try {
      for (const id of ids) {
        const article = articles.find(a => a.id === id);
        if (!article) continue;
        if (article.status === "deleted") continue;
        await deleteOne(id);
      }

      alert("批次刪除完成");
      selectedIds.clear();
      await loadArticles();
    } catch (error) {
      alert("批次刪除失敗：" + error.message);
    }
  });

  filter.addEventListener("change", () => {
    render();
  });

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-TW");
  }

  loadArticles();
});