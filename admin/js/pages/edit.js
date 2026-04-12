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
          <input id="edit-category" class="input" type="text" placeholder="分類（內容分類）" />

          <select id="edit-industry-category" class="input">
            <option value="企業服務">企業服務</option>
            <option value="醫美診所">醫美診所</option>
            <option value="法律顧問">法律顧問</option>
            <option value="室內設計">室內設計</option>
            <option value="製造業">製造業</option>
            <option value="教育培訓">教育培訓</option>
            <option value="品牌電商">品牌電商</option>
            <option value="房地產">房地產</option>
            <option value="金融保險">金融保險</option>
            <option value="科技服務">科技服務</option>
          </select>

          <textarea id="edit-summary" class="textarea" placeholder="摘要"></textarea>
          <input id="edit-seo-title" class="input" type="text" placeholder="SEO Title" />
          <textarea id="edit-seo-description" class="textarea" placeholder="SEO Description"></textarea>
          <textarea id="edit-content" class="textarea" style="min-height:360px;" placeholder="文章內容"></textarea>

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
  const industryCategoryEl = document.getElementById("edit-industry-category");
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
    slugEl.value = data.slug || slugify(data.title || "");
    categoryEl.value = data.category || "";
    industryCategoryEl.value = data.industryCategory || "企業服務";
    summaryEl.value = data.summary || "";
    seoTitleEl.value = data.seoTitle || "";
    seoDescEl.value = data.seoDescription || "";
    contentEl.value = data.content || data.body || "";

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
    industryCategoryEl.value = data.industry_category || "企業服務";
    summaryEl.value = data.summary || "";
    seoTitleEl.value = data.seo_title || "";
    seoDescEl.value = data.seo_description || "";
    contentEl.value = data.content || data.body || "";

    renderPreview();
  }

  document.getElementById("save-draft-btn").addEventListener("click", () => save("draft"));
  document.getElementById("save-publish-btn").addEventListener("click", () => save("published"));
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "./content.html";
  });

  titleEl.addEventListener("input", () => {
    if (!slugEl.value.trim()) {
      slugEl.value = slugify(titleEl.value);
    }
  });

  contentEl.addEventListener("input", renderPreview);

  async function save(status) {
    const nowIso = new Date().toISOString();

    const payload = {
      title: titleEl.value.trim(),
      slug: slugEl.value.trim(),
      category: categoryEl.value.trim(),
      industry_category: industryCategoryEl.value.trim(),
      summary: summaryEl.value.trim(),
      body: contentEl.value,
      content: contentEl.value,
      seo_title: seoTitleEl.value.trim(),
      seo_description: seoDescEl.value.trim(),
      status,
      updated_at: nowIso,
      published_at: status === "published" ? nowIso : null
    };

    if (!payload.title) {
      alert("請輸入文章標題");
      return;
    }

    if (!payload.slug) {
      payload.slug = slugify(payload.title);
    }

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
    const raw = contentEl.value || "";

    if (!raw.trim()) {
      previewEl.innerHTML = "<p>尚無內容預覽</p>";
      return;
    }

    const html = raw
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^\- (.*)$/gm, "<li>$1</li>")
      .replace(/(?:<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`)
      .replace(/\n{2,}/g, "</p><p>");

    previewEl.innerHTML = `<p>${html}</p>`;
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