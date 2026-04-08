document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "generate",
    "AI SEO 文章生成",
    "使用 Ollama 生成 SEO 結構文章，並可直接發布或編輯"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <section class="split">
      <div class="card">
        <div class="card__body">
          <h3 class="card__title">生成條件</h3>

          <form id="generate-form" class="form-grid">

            <div>
              <label>產業</label>
              <input class="input" name="industry" value="企業服務" required>
            </div>

            <div>
              <label>地區</label>
              <input class="input" name="location" value="台灣" required>
            </div>

            <div class="full">
              <label>主題 / 關鍵字</label>
              <input class="input" name="topic" value="AI SEO 是什麼" required>
            </div>

            <div>
              <label>語氣</label>
              <select class="select" name="tone">
                <option>專業</option>
                <option>商務</option>
                <option>清楚易懂</option>
              </select>
            </div>

            <div>
              <label>分類</label>
              <input class="input" name="category" value="AI SEO">
            </div>

            <div class="full">
              <label>CTA</label>
              <input class="input" name="cta" value="預約 AI SEO 系統展示">
            </div>

            <div class="full">
              <button class="btn btn--primary" id="generate-btn" type="submit">
                生成內容
              </button>
            </div>

          </form>
        </div>
      </div>

      <div class="preview" id="generate-preview">
        <div class="preview__eyebrow">AI PREVIEW</div>
        <h2 class="preview__title">尚未生成內容</h2>
        <p class="preview__summary">填寫條件後開始生成</p>
      </div>
    </section>
  `;

  const form = document.getElementById("generate-form");
  const preview = document.getElementById("generate-preview");
  const btn = document.getElementById("generate-btn");

  let generated = null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = "生成中...";

    const fd = new FormData(form);

    const params = {
      industry: fd.get("industry"),
      location: fd.get("location"),
      topic: fd.get("topic"),
      tone: fd.get("tone"),
      cta: fd.get("cta")
    };

    preview.innerHTML = `
      <div class="preview__eyebrow">AI PREVIEW</div>
      <h2 class="preview__title">生成中...</h2>
      <p class="preview__summary">請稍候</p>
    `;

    try {
      const res = await window.OllamaClient.generateWithOllama(params);

      generated = {
        ...res,
        category: fd.get("category"),
        slug: slugify(res.title)
      };

      preview.innerHTML = `
        <div class="preview__eyebrow">AI PREVIEW</div>

        <h2 class="preview__title">${escape(generated.title)}</h2>
        <p class="preview__summary">${escape(generated.summary)}</p>

        <div class="preview__content">
          ${generated.content}
        </div>

        <div style="margin-top:20px;display:flex;gap:10px;">
          <button class="btn btn--soft" id="save-draft">存草稿</button>
          <button class="btn btn--primary" id="save-publish">直接發布</button>
        </div>
      `;

      document.getElementById("save-draft")
        .addEventListener("click", () => save("draft"));

      document.getElementById("save-publish")
        .addEventListener("click", () => save("published"));

    } catch (err) {
      preview.innerHTML = `
        <h2>生成失敗</h2>
        <p>${escape(err.message)}</p>
      `;
    }

    btn.disabled = false;
    btn.textContent = "生成內容";
  });

  async function save(status) {
    if (!generated) return;

    const supabase = window.supabaseClient;

    const now = new Date().toISOString();

    const payload = {
      title: generated.title,
      slug: generated.slug,
      summary: generated.summary,
      content: generated.content,
      category: generated.category,
      status,
      seo_title: generated.seoTitle,
      seo_description: generated.seoDescription,
      created_at: now,
      updated_at: now,
      published_at: status === "published" ? now : null
    };

    const { error } = await supabase.from("articles").insert([payload]);

    if (error) {
      alert("寫入失敗：" + error.message);
      return;
    }

    alert(status === "published" ? "已發布" : "已存草稿");

    window.location.href = "./content.html";
  }

  function slugify(text = "") {
    return text.toLowerCase().replace(/\s+/g, "-");
  }

  function escape(str = "") {
    return str.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
});