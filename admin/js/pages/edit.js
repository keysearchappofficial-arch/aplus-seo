document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "content",
    "編輯文章",
    "修改內容、SEO 欄位與發布狀態"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__body">
        <div style="display:grid;gap:14px;max-width:960px;">
          <input id="edit-title" class="input" type="text" placeholder="文章標題" />
          <input id="edit-slug" class="input" type="text" placeholder="Slug" />
          <input id="edit-category" class="input" type="text" placeholder="分類" />
          <textarea id="edit-summary" class="textarea" placeholder="摘要"></textarea>
          <input id="edit-seo-title" class="input" type="text" placeholder="SEO Title" />
          <textarea id="edit-seo-description" class="textarea" placeholder="SEO Description"></textarea>
          <textarea id="edit-content" class="textarea" style="min-height:360px;" placeholder="HTML 內容"></textarea>

          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button id="save-draft-btn" class="btn btn--soft" type="button">儲存草稿</button>
            <button id="save-publish-btn" class="btn btn--primary" type="button">儲存並發布</button>
            <button id="back-btn" class="btn btn--soft" type="button">返回列表</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="card__body">
        <h3 class="card__title">文章預覽</h3>
        <div id="article-preview" style="line-height:1.8;color:#334155;"></div>
      </div>
    </div>
  `;

  const supabase = window.supabaseClient;
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");
  const mode = params.get("mode");

  const titleEl = document.getElementById("edit-title");
  const slugEl = document.getElementById("edit-slug");
  const categoryEl = document.getElementById("edit-category");
  const summaryEl = document.getElementById("edit-summary");
  const seoTitleEl = document.getElementById("edit-seo-title");
  const seoDescEl = document.getElementById("edit-seo-description");
  const contentEl = document.getElementById("edit-content");
  const previewEl = document.getElementById("article-preview");

  if (mode === "ai") {
    loadFromAI();
  } else {
    if (!id) {
      alert("缺少文章 id");
      window.location.href = "./content.html";
      return;
    }
    await loadArticle();
  }

  function loadFromAI() {
    const raw = localStorage.getItem("ai_draft");

    if (!raw) {
      alert("沒有 AI 資料");
      window.location.href = "./generate.html";
      return;
    }

    const data = JSON.parse(raw);

    titleEl.value = data.title || "";
    slugEl.value = slugify(data.title || "");
    categoryEl.value = data.category || "";
    summaryEl.value = data.summary || "";
    seoTitleEl.value = data.seoTitle || "";
    seoDescEl.value = data.seoDescription || "";
    contentEl.value = data.content || "";

    renderPreview();
  }

  async function loadArticle() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("載入文章失敗：" + error.message);
      window.location.href = "./content.html";
      return;
    }

    titleEl.value = data.title || "";
    slugEl.value = data.slug || "";
    categoryEl.value = data.category || "";
    summaryEl.value = data.summary || "";
    seoTitleEl.value = data.seo_title || "";
    seoDescEl.value = data.seo_description || "";
    contentEl.value = data.content || "";

    renderPreview();
  }

  document.getElementById("save-draft-btn").addEventListener("click", () => save("draft"));
  document.getElementById("save-publish-btn").addEventListener("click", () => save("published"));
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "./content.html";
  });

  contentEl.addEventListener("input", renderPreview);

  async function save(status) {
    const payload = {
      title: titleEl.value.trim(),
      slug: slugEl.value.trim(),
      category: categoryEl.value.trim(),
      summary: summaryEl.value.trim(),
      content: contentEl.value,
      seo_title: seoTitleEl.value.trim(),
      seo_description: seoDescEl.value.trim(),
      status,
      updated_at: new Date().toISOString(),
      published_at: status === "published" ? new Date().toISOString() : null
    };

    if (mode === "ai") {
      const { error } = await supabase
        .from("articles")
        .insert([payload]);

      if (error) {
        alert("新增失敗：" + error.message);
        return;
      }

      localStorage.removeItem("ai_draft");
    } else {
      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", id);

      if (error) {
        alert("更新失敗：" + error.message);
        return;
      }
    }

    alert(status === "published" ? "已儲存並發布" : "草稿已儲存");
    window.location.href = "./content.html";
  }

  function renderPreview() {
    previewEl.innerHTML = contentEl.value || "<p>尚無內容預覽</p>";
  }

  function slugify(text = "") {
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
});