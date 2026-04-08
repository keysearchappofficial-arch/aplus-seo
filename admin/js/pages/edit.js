document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const titleEl = document.getElementById("edit-title");
  const slugEl = document.getElementById("edit-slug");
  const categoryEl = document.getElementById("edit-category");
  const summaryEl = document.getElementById("edit-summary");
  const seoTitleEl = document.getElementById("edit-seo-title");
  const seoDescriptionEl = document.getElementById("edit-seo-description");
  const contentEl = document.getElementById("edit-content");
  const previewEl = document.getElementById("article-preview");

  const saveDraftBtn = document.getElementById("save-draft-btn");
  const savePublishBtn = document.getElementById("save-publish-btn");
  const backBtn = document.getElementById("back-btn");

  if (!id) {
    alert("缺少文章 id");
    window.location.href = "./content.html";
    return;
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
    seoDescriptionEl.value = data.seo_description || "";
    contentEl.value = data.content || "";

    renderPreview();
  }

  function renderPreview() {
    previewEl.innerHTML = contentEl.value || "<p>尚無內容預覽</p>";
  }

  async function saveArticle(status) {
    const payload = {
      title: titleEl.value.trim(),
      slug: slugEl.value.trim(),
      category: categoryEl.value.trim(),
      summary: summaryEl.value.trim(),
      seo_title: seoTitleEl.value.trim(),
      seo_description: seoDescriptionEl.value.trim(),
      content: contentEl.value,
      updated_at: new Date().toISOString()
    };

    if (status) {
      payload.status = status;
      if (status === "published") {
        payload.published_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from("articles")
      .update(payload)
      .eq("id", id);

    if (error) {
      alert("儲存失敗：" + error.message);
      return;
    }

    alert(status === "published" ? "已儲存並發布" : "草稿已儲存");
    renderPreview();
  }

  saveDraftBtn.addEventListener("click", () => saveArticle("draft"));
  savePublishBtn.addEventListener("click", () => saveArticle("published"));
  backBtn.addEventListener("click", () => {
    window.location.href = "./content.html";
  });

  contentEl.addEventListener("input", renderPreview);

  loadArticle();
});