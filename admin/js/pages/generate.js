document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "generate",
    "AI SEO 文章生成",
    "使用 Ollama 生成 SEO 結構文章，並可編輯後發布"
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

  fillGenerateFormFromTopicLibrary();

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
      <h2>生成中...</h2>
    `;

    try {
      const res = await window.OllamaClient.generateWithOllama(params);

      generated = {
        ...res,
        category: fd.get("category"),
        slug: slugify(res.title)
      };

      preview.innerHTML = `
        <h2>${escape(generated.title)}</h2>
        <p>${escape(generated.summary)}</p>

        <div>${generated.content}</div>

        <div style="margin-top:20px;">
          <button id="go-edit-draft" class="btn btn--soft">編輯草稿</button>
          <button id="go-edit-publish" class="btn btn--primary">編輯後發布</button>
        </div>
      `;

      document.getElementById("go-edit-draft")
        .addEventListener("click", () => goEdit("draft"));

      document.getElementById("go-edit-publish")
        .addEventListener("click", () => goEdit("published"));

    } catch (err) {
      preview.innerHTML = `<p>錯誤：${escape(err.message)}</p>`;
    }

    btn.disabled = false;
    btn.textContent = "生成內容";
  });

  function fillGenerateFormFromTopicLibrary() {
    const raw = localStorage.getItem("selected_topic_for_generate");
    if (!raw || !form) return;

    try {
      const data = JSON.parse(raw);

      if (form.elements.industry) {
        form.elements.industry.value = data.industry || "企業服務";
      }

      if (form.elements.location) {
        form.elements.location.value = data.location || "台灣";
      }

      if (form.elements.topic) {
        form.elements.topic.value = data.topic || "";
      }

      if (form.elements.tone) {
        form.elements.tone.value = data.tone || "專業";
      }

      if (form.elements.category) {
        form.elements.category.value = data.category || "AI SEO";
      }

      if (form.elements.cta) {
        form.elements.cta.value = data.cta || "預約 AI SEO 系統展示";
      }

      localStorage.removeItem("selected_topic_for_generate");
    } catch (error) {
      console.error("帶入題庫資料失敗：", error);
    }
  }

  function goEdit(status) {
    if (!generated) return;

    const payload = {
      ...generated,
      status
    };

    localStorage.setItem("ai_draft", JSON.stringify(payload));

    window.location.href = "./edit.html?mode=ai";
  }

  function slugify(text = "") {
    return text.toLowerCase().replace(/\s+/g, "-");
  }

  function escape(str = "") {
    return String(str)
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
});