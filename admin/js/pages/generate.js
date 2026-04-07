document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "generate",
    "AI SEO 文章生成",
    "使用 Ollama 生成具備 SEO 結構的文章草稿，並可直接套用為草稿或發布。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  const supabase = window.supabaseClient;

  if (!supabase) {
    root.innerHTML = `
      <div class="card">
        <div class="card__body">Supabase 尚未設定完成。</div>
      </div>
    `;
    return;
  }

  if (!window.OllamaClient?.generateWithOllama) {
    root.innerHTML = `
      <div class="card">
        <div class="card__body">OllamaClient 尚未載入，請確認 ollama-client.js。</div>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <section class="generate-layout">
      <div class="card">
        <div class="card__body">
          <h3 class="card__title">生成條件</h3>

          <form id="generate-form" class="form-grid">
            <div>
              <label>產業</label>
              <input class="input" name="industry" value="企業服務" required />
            </div>

            <div>
              <label>目標地區</label>
              <input class="input" name="location" value="台灣" required />
            </div>

            <div class="full">
              <label>文章主題 / 關鍵字</label>
              <input class="input" name="topic" value="AI SEO 是什麼" required />
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
              <input class="input" name="category" value="AI SEO" />
            </div>

            <div class="full">
              <label>CTA 文案</label>
              <input class="input" name="cta" value="預約 AI SEO 系統展示" />
            </div>

            <div class="full">
              <button class="btn btn--primary" id="generate-btn" type="submit">生成內容</button>
            </div>
          </form>
        </div>
      </div>

      <div class="preview-card">
        <div class="preview-card__body" id="generate-preview">
          <div class="preview__placeholder">
            <div class="preview__eyebrow">AI PREVIEW</div>
            <h2 class="preview__title">尚未生成內容</h2>
            <p class="preview__summary">
              填寫左側欄位後，這裡會顯示文章標題、摘要、內文與 SEO 欄位預覽。
            </p>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = document.getElementById("generate-form");
  const preview = document.getElementById("generate-preview");
  const generateBtn = document.getElementById("generate-btn");

  let generated = null;
  let isGenerating = false;
  let isSubmitting = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isGenerating) return;
    isGenerating = true;

    generateBtn.disabled = true;
    generateBtn.textContent = "生成中...";

    const fd = new FormData(form);
    const topic = String(fd.get("topic") || "").trim();
    const industry = String(fd.get("industry") || "").trim();
    const location = String(fd.get("location") || "").trim();
    const tone = String(fd.get("tone") || "專業").trim();
    const category = String(fd.get("category") || "文章").trim();
    const cta = String(fd.get("cta") || "預約 AI SEO 系統展示").trim();

    preview.innerHTML = `
      <div class="preview__eyebrow">AI PREVIEW</div>
      <h2 class="preview__title">生成中...</h2>
      <p class="preview__summary">正在向本機 API 取得內容，請稍候。</p>
    `;

    try {
      const result = await window.OllamaClient.generateWithOllama({
        industry,
        location,
        topic,
        tone,
        cta
      });

      generated = {
        title: result.title,
        slug: slugify(result.title),
        summary: result.summary,
        content: result.content,
        category,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        ctaText: cta
      };

      preview.innerHTML = `
        <div class="preview__eyebrow">AI PREVIEW</div>
        <h2 class="preview__title">${escapeHtml(generated.title)}</h2>
        <p class="preview__summary">${escapeHtml(generated.summary)}</p>

        <div class="preview__meta">
          <span>Slug：${escapeHtml(generated.slug)}</span>
          <span>分類：${escapeHtml(generated.category)}</span>
        </div>

        <div class="preview__content">${generated.content}</div>

        <div class="preview__footer">
          <div class="preview__seo">
            <strong>SEO Title：</strong>${escapeHtml(generated.seoTitle)}<br />
            <strong>SEO Description：</strong>${escapeHtml(generated.seoDescription)}
          </div>

          <div class="preview__actions">
            <button class="btn btn--primary" id="apply-draft" type="button">套用為草稿</button>
            <button class="btn btn--soft" id="apply-publish" type="button">直接發布</button>
          </div>
        </div>
      `;

      document.getElementById("apply-draft")
        .addEventListener("click", () => applyGenerated("draft"));

      document.getElementById("apply-publish")
        .addEventListener("click", () => applyGenerated("published"));
    } catch (error) {
      console.error("AI 生成失敗：", error);
      preview.innerHTML = `
        <div class="preview__eyebrow">AI PREVIEW</div>
        <h2 class="preview__title">生成失敗</h2>
        <p class="preview__summary">${escapeHtml(error.message)}</p>
      `;
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.textContent = "生成內容";
    }
  });

  async function applyGenerated(status) {
    if (!generated || isSubmitting) return;
    isSubmitting = true;

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

    try {
      const { error } = await supabase
        .from("articles")
        .insert([payload]);

      if (error) {
        alert(`新增文章失敗：${error.message}`);
        return;
      }

      alert(
        status === "published"
          ? "文章已發布，前台 blog 可看到。"
          : "已建立草稿。"
      );

      window.location.href = "./index.html";
    } catch (error) {
      console.error("寫入 Supabase 失敗：", error);
      alert(`寫入失敗：${error.message}`);
    } finally {
      isSubmitting = false;
    }
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

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});