document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "topics",
    "題庫管理",
    "集中管理 AI SEO 主題，建立可持續產文的內容題庫。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <section class="card">
      <div class="card__body">
        <div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          <div>
            <label class="form-label">產業</label>
            <input id="topic-industry" class="input" type="text" value="企業服務" placeholder="例如：企業服務" />
          </div>

          <div>
            <label class="form-label">地區</label>
            <input id="topic-location" class="input" type="text" value="台灣" placeholder="例如：台灣" />
          </div>

          <div>
            <label class="form-label">主題數量</label>
            <input id="topic-count" class="input" type="number" min="1" max="20" value="10" />
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
          <button id="generate-topics-btn" class="btn btn--primary">自動產主題</button>
          <button id="clear-topics-btn" class="btn btn--ghost">清空題庫</button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:20px;">
      <div class="card__body">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:18px;">主題列表</h3>
            <p style="margin:6px 0 0;color:#64748b;font-size:14px;">AI 生成的主題會直接加入這裡。</p>
          </div>
          <div id="topic-count-badge" style="font-size:14px;color:#64748b;">共 0 筆</div>
        </div>

        <div id="topic-library-list"></div>
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

  async function generateTopicsWithAI({ industry, location, count }) {
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

    const parsed = await response.json();
    return Array.isArray(parsed.topics) ? parsed.topics : [];
  }

  async function renderTopicLibrary() {
    const container = document.getElementById("topic-library-list");
    const badge = document.getElementById("topic-count-badge");
    if (!container) return;

    const topics = readTopics();

    if (badge) {
      badge.textContent = `共 ${topics.length} 筆`;
    }

    if (!topics.length) {
      container.innerHTML = `
        <div class="empty-state" style="padding:24px;border:1px dashed #cbd5e1;border-radius:16px;color:#64748b;">
          目前還沒有題目，點上方「自動產主題」開始建立題庫。
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid;gap:14px;">
        ${topics.map(item => `
          <article class="topic-card" data-id="${escapeHtml(item.id)}" style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
              <div style="flex:1;min-width:240px;">
                <h4 style="margin:0 0 8px;font-size:18px;line-height:1.5;color:#0f172a;">
                  ${escapeHtml(item.topic)}
                </h4>
                <div style="display:flex;gap:10px;flex-wrap:wrap;color:#64748b;font-size:13px;">
                  <span>${escapeHtml(item.location || "台灣")}</span>
                  <span>｜</span>
                  <span>${escapeHtml(item.industry || "企業服務")}</span>
                  <span>｜</span>
                  <span>${escapeHtml(item.source || "ai")}</span>
                </div>
              </div>

              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn--ghost use-topic-btn" data-topic="${escapeHtml(item.topic)}">拿去產文</button>
                <button class="btn btn--ghost delete-topic-btn" data-id="${escapeHtml(item.id)}">刪除</button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;

    container.querySelectorAll(".delete-topic-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const topics = readTopics().filter(item => item.id !== id);
        writeTopics(topics);
        await renderTopicLibrary();
      };
    });

    container.querySelectorAll(".use-topic-btn").forEach(btn => {
      btn.onclick = () => {
        const topic = btn.dataset.topic || "";
        localStorage.setItem("selected_ai_topic", topic);
        window.location.href = "./generate.html";
      };
    });
  }

  document.getElementById("generate-topics-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("generate-topics-btn");

    try {
      btn.disabled = true;
      btn.textContent = "生成中...";

      const industry = document.getElementById("topic-industry")?.value?.trim() || "企業服務";
      const location = document.getElementById("topic-location")?.value?.trim() || "台灣";
      const count = Number(document.getElementById("topic-count")?.value) || 10;

      const newTopics = await generateTopicsWithAI({
        industry,
        location,
        count
      });

      const current = readTopics();
      const merged = [...newTopics, ...current];

      writeTopics(merged);
      await renderTopicLibrary();

      alert(`已新增 ${newTopics.length} 個主題到題庫`);
    } catch (error) {
      console.error("自動產主題失敗：", error);
      alert(error.message || "自動產主題失敗");
    } finally {
      btn.disabled = false;
      btn.textContent = "自動產主題";
    }
  });

  document.getElementById("clear-topics-btn")?.addEventListener("click", async () => {
    const yes = confirm("確定要清空整個題庫嗎？");
    if (!yes) return;

    writeTopics([]);
    await renderTopicLibrary();
  });

  await renderTopicLibrary();
});
