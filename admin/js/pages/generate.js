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

  const progress = window.UIProgress.create({
    render(percent, text) {
      preview.innerHTML = renderGeneratingPreview(percent, text);
    },
    initialPercent: 8,
    steps: [
      { until: 20, text: "正在分析主題與產業..." },
      { until: 38, text: "正在規劃文章結構..." },
      { until: 58, text: "正在生成文章內容..." },
      { until: 76, text: "正在整理摘要與 SEO 欄位..." },
      { until: 90, text: "正在完成最後輸出..." }
    ],
    finishingText: "正在整理輸出內容...",
    finishedText: "生成完成"
  });

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
  cta: fd.get("cta"),
  category: fd.get("category")
};

progress.start();

try {
  const res = await window.OllamaClient.generateWithOllama(params);

generated = {
  title: res.title || "",
  summary: res.summary || "",
  content: res.content || "",
  seoTitle: res.seoTitle || "",
  seoDescription: res.seoDescription || "",
  category: fd.get("category"),
  slug: slugify(res.title || "")
};

  await progress.finishSmooth();

  preview.innerHTML = `
    <h2>${escape(generated.title)}</h2>
    <p>${escape(generated.summary)}</p>

    <div class="generated-article">
  ${renderArticleBody(generated.content)}
</div>

    <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
      <button id="go-edit-draft" class="btn btn--soft">編輯草稿</button>
      <button id="go-edit-publish" class="btn btn--primary">編輯後發布</button>
    </div>
  `;

      document.getElementById("go-edit-draft")
        ?.addEventListener("click", () => goEdit("draft"));

      document.getElementById("go-edit-publish")
        ?.addEventListener("click", () => goEdit("published"));

    } catch (err) {
      progress.stop();

      preview.innerHTML = `
        <div class="preview__eyebrow">AI PREVIEW</div>
        <h2 class="preview__title">生成失敗</h2>
        <p class="preview__summary">錯誤：${escape(err.message)}</p>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "生成內容";
    }
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

  function renderGeneratingPreview(percent, text) {
    return `
      <div class="preview__eyebrow">AI PREVIEW</div>
      <h2 class="preview__title">內容生成中...</h2>
      <p class="preview__summary">${escape(text)}</p>

      <div style="margin-top:18px;">
        <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
          <div
            style="
              width:${percent}%;
              height:100%;
              background:linear-gradient(90deg,#2563eb 0%,#60a5fa 100%);
              border-radius:999px;
              transition:width .35s ease;
            "
          ></div>
        </div>

        <div style="margin-top:10px;font-size:13px;color:#64748b;">
          進度 ${percent}%
        </div>
      </div>
    `;
  }

  function formatInline(text = "") {
  return escape(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function renderArticleBody(content = "") {
  const lines = String(content)
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  let html = "";
  let inList = false;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2 style="margin:28px 0 12px;">${formatInline(line.replace(/^## /, ""))}</h2>`;
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3 style="margin:20px 0 10px;">${formatInline(line.replace(/^### /, ""))}</h3>`;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += `<ul style="padding-left:20px;line-height:1.8;margin:0 0 16px;">`;
        inList = true;
      }
      html += `<li>${formatInline(line.replace(/^[-*] /, ""))}</li>`;
      continue;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }

    html += `<p style="line-height:1.9;margin:0 0 14px;">${formatInline(line)}</p>`;
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

});
