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
                <th>行業分類</th>
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

    <div id="share-modal" style="display:none;position:fixed;inset:0;z-index:9999;">
      <div id="share-overlay" style="position:absolute;inset:0;background:rgba(15,23,42,.45);"></div>
      <div style="
        position:relative;
        max-width:560px;
        margin:80px auto 0;
        background:#fff;
        border-radius:20px;
        box-shadow:0 24px 60px rgba(15,23,42,.18);
        padding:24px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:22px;color:#0f172a;">分享文章</h3>
            <p id="share-modal-title" style="margin:6px 0 0;color:#64748b;font-size:14px;"></p>
          </div>
          <button id="share-close" class="btn btn--ghost" type="button">關閉</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
          <button class="btn btn--soft share-btn" type="button" data-platform="facebook">Facebook</button>
          <button class="btn btn--soft share-btn" type="button" data-platform="x">X</button>
          <button class="btn btn--soft share-btn" type="button" data-platform="linkedin">LinkedIn</button>
          <button class="btn btn--soft share-btn" type="button" data-platform="threads">Threads</button>
          <button class="btn btn--soft share-btn" type="button" data-platform="line">LINE</button>
          <button class="btn btn--soft share-btn" type="button" data-platform="full">複製全文</button>
          <button class="btn btn--primary share-btn" type="button" data-platform="copy">複製連結</button>
        </div>

        <div style="margin-top:16px;">
          <label style="display:block;margin-bottom:8px;font-size:13px;color:#64748b;">文章連結</label>
          <input id="share-url" class="input" type="text" readonly />
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

  const shareModal = document.getElementById("share-modal");
  const shareOverlay = document.getElementById("share-overlay");
  const shareClose = document.getElementById("share-close");
  const shareModalTitle = document.getElementById("share-modal-title");
  const shareUrlInput = document.getElementById("share-url");

  const SITE_ORIGIN = "https://www.keysearch-app.com";

  let articles = [];
  let selectedIds = new Set();
  let currentShareArticle = null;

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

    selectedCountEl.textContent = `已選 ${selectedIds.size} 篇`;

    if (!visibleIds.length) {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = false;
      return;
    }

    selectAllEl.checked = visibleSelectedCount === visibleIds.length;
    selectAllEl.indeterminate =
      visibleSelectedCount > 0 && visibleSelectedCount < visibleIds.length;
  }

  function getArticleUrl(article) {
    return `${SITE_ORIGIN}/article.html?slug=${encodeURIComponent(article.slug || "")}`;
  }

  function stripMarkdownToPlainText(text = "") {
    return String(text)
      .replace(/^##\s+/gm, "")
      .replace(/^###\s+/gm, "")
      .replace(/^-\s+/gm, "• ")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n{2,}/g, "\n")
      .trim();
  }

  function generateFallbackFullText(article) {
    const title = article.title || "";
    const body = stripMarkdownToPlainText(article.content || article.body || "");
    return `${title}\n\n${body}`.trim();
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      alert(successMessage);
    } catch (error) {
      prompt("請手動複製以下內容：", text);
    }
  }

  function openPlatform(name) {
    const map = {
      facebook: "https://www.facebook.com/",
      linkedin: "https://www.linkedin.com/feed/",
      x: "https://x.com/compose/post",
      threads: "https://www.threads.net/",
      line: "https://line.me/"
    };

    const target = map[name];
    if (!target) return;

    window.open(target, "_blank", "width=900,height=720");
  }

  function openShareModal(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    currentShareArticle = article;
    shareModalTitle.textContent = article.title || "";
    shareUrlInput.value = getArticleUrl(article);
    shareModal.style.display = "block";
  }

  function closeShareModal() {
    currentShareArticle = null;
    shareModal.style.display = "none";
  }

  async function handleShare(platform) {
    if (!currentShareArticle) return;

    const article = currentShareArticle;
    const articleUrl = getArticleUrl(article);

    const socialTextMap = {
      facebook: article.social_facebook || article.summary || article.title || "",
      x: article.social_x || article.summary || article.title || "",
      linkedin: article.social_linkedin || article.summary || article.title || "",
      threads: article.social_threads || article.summary || article.title || "",
      line: article.social_line || article.summary || article.title || ""
    };

    if (platform === "copy") {
      await copyText(articleUrl, "已複製文章連結");
      return;
    }

    if (platform === "full") {
      const fullText = generateFallbackFullText(article);
      await copyText(fullText, "已複製全文");
      return;
    }

    const socialText = socialTextMap[platform] || "";
    if (!socialText) {
      alert("這篇文章目前沒有可用的社群文案");
      return;
    }

    await copyText(socialText, `已複製 ${platform.toUpperCase()} 貼文`);
    openPlatform(platform);
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
        <td>${AdminCommon.escapeHtml(a.industryCategory || a.industry_category || "-")}</td>
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
          ${
            a.status === "published"
              ? `<button class="btn btn--soft" onclick="shareArticle('${a.id}')">分享</button>`
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

  window.shareArticle = (id) => {
    openShareModal(id);
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

  shareOverlay.addEventListener("click", closeShareModal);
  shareClose.addEventListener("click", closeShareModal);

  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const platform = btn.dataset.platform;
      await handleShare(platform);
    });
  });

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-TW");
  }

  loadArticles();
});