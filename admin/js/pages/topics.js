document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://api.keysearch-app.com";

  const API_KEY = "aplus_seo_admin_2026_secure_token";

  try {
    if (window.__adminGuardPromise) {
      const session = await window.__adminGuardPromise;
      if (!session) return;
    }

    if (typeof window.loadAdminLayout === "function") {
      await window.loadAdminLayout();
    }

    AdminCommon.renderLayout(
      "topics",
      "題庫管理",
      "建立、查看與管理 AI 自動產生的 SEO 主題。"
    );

    const root = document.getElementById("page-root");
    if (!root) return;

    root.innerHTML = 
      `<section class="card">
        <div class="card__body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
            <div>
              <label class="form-label">產業</label>
              <input id="topic-industry" class="input" type="text" value="企業服務" />
            </div>

            <div>
              <label class="form-label">地區</label>
              <input id="topic-location" class="input" type="text" value="台灣" />
            </div>

            <div>
              <label class="form-label">語氣</label>
              <select id="topic-tone" class="select">
                <option value="專業">專業</option>
                <option value="商務">商務</option>
                <option value="清楚易懂">清楚易懂</option>
              </select>
            </div>

            <div>
              <label class="form-label">分類</label>
              <input id="topic-category" class="input" type="text" value="AI SEO" />
            </div>

            <div style="grid-column:1 / -1;">
              <label class="form-label">CTA</label>
              <input id="topic-cta" class="input" type="text" value="預約 AI SEO 系統展示" />
            </div>

            <div>
              <label class="form-label">主題數量</label>
              <input id="topic-count" class="input" type="number" min="1" max="20" value="10" />
            </div>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
            <button id="generate-topics-btn" class="btn btn--primary">AI 自動產主題</button>
            <button id="clear-topics-btn" class="btn btn--ghost">清空題庫</button>
          </div>
        </div>
      </section>

      <section class="card" style="margin-top:20px;">
        <div class="card__body">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
            <div>
              <h3 style="margin:0;font-size:18px;">主題列表</h3>
              <p style="margin:6px 0 0;color:#64748b;font-size:14px;">AI 生成的主題會直接存進題庫。</p>
            </div>
            <div id="topic-total" style="font-size:14px;color:#64748b;">共 0 筆</div>
          </div>

          <div id="topic-list"></div>
        </div>
      </section>
      `;

    // =========================
    // API 基礎工具
    // =========================
    async function apiFetch(url, options = {}) {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          ...(options.headers || {})
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {}

      if (!response.ok) {
        throw new Error(data?.message || `API 錯誤：${response.status}`);
      }

      return data;
    }

    // =========================
    // API Methods
    // =========================
    async function fetchTopics() {
      const data = await apiFetch(`${API_BASE}/api/topics`);
      return Array.isArray(data.topics) ? data.topics : [];
    }

    async function generateTopics(payload) {
      const data = await apiFetch(`${API_BASE}/api/topics/generate`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      return Array.isArray(data.topics) ? data.topics : [];
    }

    async function deleteTopic(id) {
      await apiFetch(`${API_BASE}/api/topics/${id}`, {
        method: "DELETE"
      });
    }

    async function clearTopics() {
      await apiFetch(`${API_BASE}/api/topics`, {
        method: "DELETE"
      });
    }

    // =========================
    // UI & Render（原本保留）
    // =========================

    function escapeHtml(str = "") {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    async function renderTopics() {
      const list = document.getElementById("topic-list");
      const total = document.getElementById("topic-total");

      const topics = await fetchTopics();

      if (total) {
        total.textContent = `共 ${topics.length} 筆`;
      }

      if (!topics.length) {
        list.innerHTML = `
          <div style="padding:20px;border:1px dashed #cbd5e1;border-radius:16px;">
            目前還沒有主題
          </div>
        `;
        return;
      }

      list.innerHTML = topics.map(item => `
        <article style="border:1px solid #e2e8f0;padding:16px;">
          <h4>${escapeHtml(item.topic)}</h4>

          <button class="delete-topic-btn" data-id="${item.id}">
            刪除
          </button>
        </article>
      `).join("");

      list.querySelectorAll(".delete-topic-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          await deleteTopic(btn.dataset.id);
          await renderTopics();
        });
      });
    }

    // =========================
    // Generate 按鈕
    // =========================
    document.getElementById("generate-topics-btn")
      ?.addEventListener("click", async () => {

      const industry = document.getElementById("topic-industry")?.value || "";
      const location = document.getElementById("topic-location")?.value || "";
      const tone = document.getElementById("topic-tone")?.value || "";
      const category = document.getElementById("topic-category")?.value || "";
      const cta = document.getElementById("topic-cta")?.value || "";
      const count = Number(document.getElementById("topic-count")?.value) || 10;

      const topics = await generateTopics({
        industry,
        location,
        tone,
        category,
        cta,
        count
      });

      await renderTopics();
      alert(`新增 ${topics.length} 筆`);
    });

    // =========================
    // Clear
    // =========================
    document.getElementById("clear-topics-btn")
      ?.addEventListener("click", async () => {
      if (!confirm("確定清空？")) return;
      await clearTopics();
      await renderTopics();
    });

    await renderTopics();

  } catch (error) {
    console.error("[topics] error:", error);
  }
});
