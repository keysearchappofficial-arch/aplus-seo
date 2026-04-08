document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "topics",
    "題庫管理",
    "建立、查看與管理 AI 自動產生的 SEO 主題。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <section class="card">
      <div class="card__body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          <div>
            <label class="form-label">產業</label>
            <input id="topic-industry" class="input" type="text" placeholder="例如：企業服務" value="企業服務" />
          </div>

          <div>
            <label class="form-label">地區</label>
            <input id="topic-location" class="input" type="text" placeholder="例如：台灣" value="台灣" />
          </div>

          <div>
            <label class="form-label">主題數量</label>
            <input id="topic-count" class="input" type="number" min="1" max="20" value="10" />
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
          <button id="generate-topics-btn" class="btn btn--primary">AI 自動產主題</button>
          <button id="clear-topics-btn" class="btn btn--ghost">清空列表</button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:20px;">
      <div class="card__body">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:18px;">主題列表</h3>
            <p style="margin:6px 0 0;color:#64748b;font-size:14px;">這裡會顯示 AI 產出的主題。</p>
          </div>
          <div id="topic-total" style="font-size:14px;color:#64748b;">共 0 筆</div>
        </div>

        <div id="topic-list"></div>
      </div>
    </section>
  `;

  const STORAGE_KEY = "ai_topic_library";

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readTopics() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("讀取題庫失敗：", error);
      return [];
    }
  }

  function writeTopics(topics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }

  function renderTopics() {
    const list = document.getElementById("topic-list");
    const total = document.getElementById("topic-total");
    if (!list) return;

    const topics = readTopics();

    if (total) {
      total.textContent = `共 ${topics.length} 筆`;
    }

    if (!topics.length) {
      list.innerHTML = `
        <div style="padding:20px;border:1px dashed #cbd5e1;border-radius:16px;color:#64748b;">
          目前還沒有主題，請先點「AI 自動產主題」。
        </div>
      `;
      return;
    }

    list.innerHTML = `
      <div style="display:grid;gap:14px;">
        ${topics.map(item => `
          <article style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
              <div style="flex:1;min-width:240px;">
                <h4 style="margin:0 0 8px;font-size:18px;line-height:1.5;color:#0f172a;">
                  ${escapeHtml(item.topic)}
                </h4>
                <div style="font-size:13px;color:#64748b;">
                  ${escapeHtml(item.location || "台灣")}｜${escapeHtml(item.industry || "企業服務")}｜${escapeHtml(item.source || "ai")}
                </div>
              </div>

              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn--ghost delete-topic-btn" data-id="${escapeHtml(item.id)}">刪除</button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;

    list.querySelectorAll(".delete-topic-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const next = readTopics().filter(item => item.id !== id);
        writeTopics(next);
        renderTopics();
      });
    });
  }

  async function requestTopicsFromApi({ industry, location, count }) {
    const response = await fetch("http://localhost:3000/api/topics/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        industry,
        location,
        count
      })
    });

    if (!response.ok) {
      let message = `主題生成失敗：${response.status}`;

      try {
        const err = await response.json();
        if (err?.detail) {
          message += ` - ${err.detail}`;
        } else if (err?.error) {
          message += ` - ${err.error}`;
        }
      } catch (_) {}

      throw new Error(message);
    }

    const data = await response.json();

    if (!Array.isArray(data.topics)) {
      throw new Error("API 回傳格式錯誤，缺少 topics");
    }

    return data.topics;
  }

  document.getElementById("generate-topics-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("generate-topics-btn");

    try {
      btn.disabled = true;
      btn.textContent = "生成中...";

      const industry = document.getElementById("topic-industry")?.value?.trim() || "企業服務";
      const location = document.getElementById("topic-location")?.value?.trim() || "台灣";
      const count = Number(document.getElementById("topic-count")?.value) || 10;

      const topics = await requestTopicsFromApi({
        industry,
        location,
        count
      });

      writeTopics(topics);
      renderTopics();

      alert(`已生成 ${topics.length} 個主題`);
    } catch (error) {
      console.error("AI 自動產主題失敗：", error);
      alert(error.message || "AI 自動產主題失敗");
    } finally {
      btn.disabled = false;
      btn.textContent = "AI 自動產主題";
    }
  });

  document.getElementById("clear-topics-btn")?.addEventListener("click", () => {
    writeTopics([]);
    renderTopics();
  });

  renderTopics();
});
