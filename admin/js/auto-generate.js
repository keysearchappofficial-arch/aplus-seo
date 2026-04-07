document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  AdminCommon.renderLayout(
    "auto-generate",
    "自動產文",
    "設定自動產文規則、管理題庫，並可立即測試生成草稿。"
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
        <div class="card__body">OllamaClient 尚未設定完成。</div>
      </div>
    `;
    return;
  }

  await renderPage();

  async function renderPage() {
    let settings = null;
    let topics = [];

    try {
      [settings, topics] = await Promise.all([
        getSettings(),
        getTopics()
      ]);
    } catch (error) {
      console.error(error);
      root.innerHTML = `
        <div class="card">
          <div class="card__body">載入失敗：${error.message}</div>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <section class="grid grid--2">
        <div class="card">
          <div class="card__body">
            <h3 class="card__title">自動產文設定</h3>
            <form id="settings-form" class="form-grid">
              <div>
                <label>啟用狀態</label>
                <select class="select" name="is_enabled">
                  <option value="false" ${!settings?.is_enabled ? "selected" : ""}>停用</option>
                  <option value="true" ${settings?.is_enabled ? "selected" : ""}>啟用</option>
                </select>
              </div>

              <div>
                <label>自動生成頻率</label>
                <select class="select" name="frequency">
                  <option value="unlimited" ${settings?.frequency === "unlimited" ? "selected" : ""}>不設頻率（自由生成）</option>
                  <option value="daily" ${(settings?.frequency || "daily") === "daily" ? "selected" : ""}>每天一篇</option>
                  <option value="every_2_days" ${settings?.frequency === "every_2_days" ? "selected" : ""}>每兩天一篇</option>
                  <option value="weekly" ${settings?.frequency === "weekly" ? "selected" : ""}>每週一篇</option>
                </select>
              </div>

              <div>
                <label>預設產業</label>
                <input class="input" name="industry" value="${escapeAttr(settings?.industry || "虛擬攝影棚")}">
              </div>

              <div>
                <label>預設地區</label>
                <input class="input" name="location" value="${escapeAttr(settings?.location || "台北")}">
              </div>

              <div>
                <label>預設語氣</label>
                <select class="select" name="tone">
                  <option value="專業" ${(settings?.tone || "專業") === "專業" ? "selected" : ""}>專業</option>
                  <option value="商務" ${settings?.tone === "商務" ? "selected" : ""}>商務</option>
                  <option value="親切" ${settings?.tone === "親切" ? "selected" : ""}>親切</option>
                </select>
              </div>

              <div>
                <label>生成後狀態</label>
                <select class="select" name="default_status">
                  <option value="draft" ${(settings?.default_status || "draft") === "draft" ? "selected" : ""}>草稿</option>
                  <option value="published" ${settings?.default_status === "published" ? "selected" : ""}>直接發布</option>
                </select>
              </div>

              <div class="full">
                <label>預設 CTA</label>
                <input class="input" name="cta" value="${escapeAttr(settings?.cta || "立即洽詢 Aplus 攝影棚方案")}">
              </div>

              <div class="full" style="padding:12px 14px;border-radius:12px;background:#f8fafc;color:var(--muted);line-height:1.8;">
                <strong style="color:#0f172a;">使用建議：</strong><br>
                1. 若生成後狀態為 <strong>草稿</strong>，建議可使用「不設頻率（自由生成）」來建立內容池。<br>
                2. 若生成後狀態為 <strong>直接發布</strong>，建議使用「每天一篇 / 每兩天一篇 / 每週一篇」控制發文節奏。<br>
                3. 「立即測試生成一篇」不受頻率限制，適合手動補稿。
              </div>

              <div class="full" style="display:flex;gap:12px;flex-wrap:wrap;">
                <button class="btn btn--primary" type="submit">儲存設定</button>
                <button class="btn btn--soft" type="button" id="run-once-btn">立即測試生成一篇</button>
              </div>
            </form>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <h3 class="card__title">最近狀態</h3>
            <div class="stat-list">
              <div class="stat-item"><strong>啟用狀態</strong><span>${settings?.is_enabled ? "啟用中" : "停用中"}</span></div>
              <div class="stat-item"><strong>生成頻率</strong><span>${formatFrequency(settings?.frequency || "daily")}</span></div>
              <div class="stat-item"><strong>題庫數量</strong><span>${topics.length} 筆</span></div>
              <div class="stat-item"><strong>啟用題目</strong><span>${topics.filter(t => t.is_active).length} 筆</span></div>
            </div>
            <div id="run-result" style="margin-top:16px;color:var(--muted);line-height:1.8;"></div>
          </div>
        </div>
      </section>

      <section class="card" style="margin-top:20px;">
        <div class="card__body">
          <div class="toolbar">
            <h3 class="card__title" style="margin:0;">題庫管理</h3>
          </div>

          <form id="topic-form" class="form-grid" style="margin-bottom:18px;">
            <div class="full">
              <label>新增題目</label>
              <input class="input" name="topic" placeholder="例如：企業直播場地規劃重點" required>
            </div>
            <div>
              <label>排序</label>
              <input class="input" name="sort_order" type="number" value="0">
            </div>
            <div style="display:flex;align-items:end;">
              <button class="btn btn--primary" type="submit">新增題目</button>
            </div>
          </form>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>題目</th>
                  <th>啟用</th>
                  <th>排序</th>
                  <th>上次生成</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="topic-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    bindSettingsForm(settings);
    bindTopicForm();
    renderTopics(topics);
    bindRunOnce(settings, topics);
  }

  function bindSettingsForm(settings) {
    const form = document.getElementById("settings-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const payload = {
        is_enabled: fd.get("is_enabled") === "true",
        frequency: fd.get("frequency"),
        industry: fd.get("industry"),
        location: fd.get("location"),
        tone: fd.get("tone"),
        cta: fd.get("cta"),
        default_status: fd.get("default_status"),
        updated_at: new Date().toISOString()
      };

      try {
        if (settings?.id) {
          const { error } = await supabase
            .from("auto_generate_settings")
            .update(payload)
            .eq("id", settings.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("auto_generate_settings")
            .insert([payload]);

          if (error) throw error;
        }

        alert("設定已儲存");
        await renderPage();
      } catch (error) {
        console.error(error);
        alert(`儲存失敗：${error.message}`);
      }
    });
  }

  function bindTopicForm() {
    const form = document.getElementById("topic-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const payload = {
        topic: String(fd.get("topic") || "").trim(),
        sort_order: Number(fd.get("sort_order") || 0),
        is_active: true
      };

      try {
        const { error } = await supabase
          .from("auto_generate_topics")
          .insert([payload]);

        if (error) throw error;

        form.reset();
        await renderPage();
      } catch (error) {
        console.error(error);
        alert(`新增題目失敗：${error.message}`);
      }
    });
  }

  function renderTopics(topics) {
    const tbody = document.getElementById("topic-tbody");
    if (!tbody) return;

    tbody.innerHTML = topics.map((item) => `
      <tr>
        <td>${escapeHtml(item.topic)}</td>
        <td>${item.is_active ? AdminCommon.statusBadge("published") : AdminCommon.statusBadge("draft")}</td>
        <td>${item.sort_order ?? 0}</td>
        <td>${AdminCommon.formatDate(item.last_generated_at)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--soft" data-action="toggle" data-id="${item.id}">
              ${item.is_active ? "停用" : "啟用"}
            </button>
            <button class="btn btn--danger" data-action="delete" data-id="${item.id}">刪除</button>
          </div>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5">目前尚無題目</td></tr>`;

    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      const topic = topics.find((item) => item.id === id);
      if (!topic) return;

      try {
        if (action === "toggle") {
          const { error } = await supabase
            .from("auto_generate_topics")
            .update({ is_active: !topic.is_active })
            .eq("id", id);

          if (error) throw error;
        }

        if (action === "delete") {
          if (!confirm(`確定刪除「${topic.topic}」？`)) return;

          const { error } = await supabase
            .from("auto_generate_topics")
            .delete()
            .eq("id", id);

          if (error) throw error;
        }

        await renderPage();
      } catch (error) {
        console.error(error);
        alert(`操作失敗：${error.message}`);
      }
    }, { once: true });
  }

  function bindRunOnce(settings, topics) {
    const btn = document.getElementById("run-once-btn");
    const resultEl = document.getElementById("run-result");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const activeTopics = topics.filter((item) => item.is_active);
      if (!activeTopics.length) {
        alert("請先新增並啟用至少一個題目");
        return;
      }

      const nextTopic = [...activeTopics].sort((a, b) => {
        const aTime = a.last_generated_at ? new Date(a.last_generated_at).getTime() : 0;
        const bTime = b.last_generated_at ? new Date(b.last_generated_at).getTime() : 0;
        return aTime - bTime;
      })[0];

      btn.disabled = true;
      btn.textContent = "生成中...";
      resultEl.innerHTML = "正在生成草稿，請稍候...";

      try {
        const generated = await window.OllamaClient.generateWithOllama({
          industry: settings?.industry || "虛擬攝影棚",
          location: settings?.location || "台北",
          topic: nextTopic.topic,
          tone: settings?.tone || "專業",
          cta: settings?.cta || "立即洽詢 Aplus 攝影棚方案"
        });

        const now = new Date().toISOString();
        const payload = {
          title: generated.title,
          slug: `${slugify(generated.title)}-${Date.now()}`,
          summary: generated.summary,
          content: generated.content,
          category: "自動產文",
          status: settings?.default_status || "draft",
          seo_title: generated.seoTitle,
          seo_description: generated.seoDescription,
          created_at: now,
          updated_at: now,
          published_at: (settings?.default_status || "draft") === "published" ? now : null
        };

        const { error: articleError } = await supabase
          .from("articles")
          .insert([payload]);

        if (articleError) throw articleError;

        const { error: topicError } = await supabase
          .from("auto_generate_topics")
          .update({ last_generated_at: now })
          .eq("id", nextTopic.id);

        if (topicError) throw topicError;

        resultEl.innerHTML = `
          <strong>生成成功</strong><br>
          題目：${escapeHtml(nextTopic.topic)}<br>
          標題：${escapeHtml(generated.title)}<br>
          狀態：${escapeHtml(settings?.default_status || "draft")}<br>
          頻率模式：${escapeHtml(formatFrequency(settings?.frequency || "daily"))}
        `;

        await renderPage();
      } catch (error) {
        console.error(error);
        resultEl.innerHTML = `<span style="color:#dc2626;">生成失敗：${escapeHtml(error.message)}</span>`;
      } finally {
        btn.disabled = false;
        btn.textContent = "立即測試生成一篇";
      }
    });
  }

  async function getSettings() {
    const { data, error } = await supabase
      .from("auto_generate_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async function getTopics() {
    const { data, error } = await supabase
      .from("auto_generate_topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  function formatFrequency(value) {
    const map = {
      unlimited: "不設頻率（自由生成）",
      daily: "每天一篇",
      every_2_days: "每兩天一篇",
      weekly: "每週一篇"
    };
    return map[value] || value;
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

  function escapeAttr(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
});