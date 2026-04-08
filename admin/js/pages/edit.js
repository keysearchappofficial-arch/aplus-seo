document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout("content", "編輯文章", "修改內容後發布");

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
    loadArticle();
  }

  function loadFromAI() {
    const raw = localStorage.getItem("ai_draft");

    if (!raw) {
      alert("沒有 AI 資料");
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
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    titleEl.value = data.title || "";
    slugEl.value = data.slug || "";
    categoryEl.value = data.category || "";
    summaryEl.value = data.summary || "";
    seoTitleEl.value = data.seo_title || "";
    seoDescEl.value = data.seo_description || "";
    contentEl.value = data.content || "";

    renderPreview();
  }

  document.getElementById("save-draft-btn").onclick = () => save("draft");
  document.getElementById("save-publish-btn").onclick = () => save("published");

  async function save(status) {
    const payload = {
      title: titleEl.value,
      slug: slugEl.value,
      category: categoryEl.value,
      summary: summaryEl.value,
      content: contentEl.value,
      seo_title: seoTitleEl.value,
      seo_description: seoDescEl.value,
      status,
      updated_at: new Date().toISOString(),
      published_at: status === "published" ? new Date().toISOString() : null
    };

    if (mode === "ai") {
      const { error } = await supabase.from("articles").insert([payload]);

      if (error) {
        alert(error.message);
        return;
      }

      localStorage.removeItem("ai_draft");

    } else {
      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", id);

      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("完成！");
    window.location.href = "./content.html";
  }

  contentEl.addEventListener("input", renderPreview);

  function renderPreview() {
    previewEl.innerHTML = contentEl.value || "<p>預覽</p>";
  }

  function slugify(text = "") {
    return text.toLowerCase().replace(/\s+/g, "-");
  }
});