document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "settings",
    "系統設定",
    "設定 AI 自動產文邏輯與預設參數"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__body">

        <h3 class="card__title">內容生成預設</h3>

        <div class="form-grid" style="max-width:720px;gap:14px;margin-top:12px;">
          <input id="setting-industry" class="input" placeholder="預設產業（例：企業服務）" />
          <input id="setting-location" class="input" placeholder="預設地區（例：台灣）" />
          <input id="setting-tone" class="input" placeholder="預設語氣（例：專業）" />
          <input id="setting-cta" class="input" placeholder="預設 CTA（例：預約系統展示）" />
        </div>

      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="card__body">

        <h3 class="card__title">自動產文設定</h3>

        <div class="form-grid" style="max-width:720px;gap:14px;margin-top:12px;">

          <select id="setting-frequency" class="input">
            <option value="daily">每日一篇</option>
            <option value="every_2_days">每兩天</option>
            <option value="weekly">每週</option>
            <option value="unlimited">不限（高頻）</option>
          </select>

          <select id="setting-default-status" class="input">
            <option value="draft">先存草稿</option>
            <option value="published">直接發布</option>
          </select>

          <label style="display:flex;gap:10px;align-items:center;margin-top:6px;">
            <input id="setting-enabled" type="checkbox" />
            啟用自動產文
          </label>

          <button id="save-settings-btn" class="btn btn--primary">
            儲存設定
          </button>

        </div>

      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="card__body">

        <h3 class="card__title">手動觸發</h3>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;">
          <button id="run-once-btn" class="btn btn--soft">立即產文一次</button>
        </div>

      </div>
    </div>
  `;

  const supabase = window.supabaseClient;

  const industryEl = document.getElementById("setting-industry");
  const locationEl = document.getElementById("setting-location");
  const toneEl = document.getElementById("setting-tone");
  const ctaEl = document.getElementById("setting-cta");
  const freqEl = document.getElementById("setting-frequency");
  const statusEl = document.getElementById("setting-default-status");
  const enabledEl = document.getElementById("setting-enabled");

  // ===== 載入設定 =====
  async function loadSettings() {
    const { data, error } = await supabase
      .from("auto_generate_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      alert("讀取設定失敗：" + error.message);
      return;
    }

    if (!data) return;

    industryEl.value = data.industry || "";
    locationEl.value = data.location || "";
    toneEl.value = data.tone || "";
    ctaEl.value = data.cta || "";
    freqEl.value = data.frequency || "daily";
    statusEl.value = data.default_status || "draft";
    enabledEl.checked = data.is_enabled || false;
  }

  // ===== 儲存設定 =====
  document.getElementById("save-settings-btn").onclick = async () => {
    const payload = {
      industry: industryEl.value,
      location: locationEl.value,
      tone: toneEl.value,
      cta: ctaEl.value,
      frequency: freqEl.value,
      default_status: statusEl.value,
      is_enabled: enabledEl.checked,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("auto_generate_settings")
      .upsert([payload]);

    if (error) {
      alert("儲存失敗：" + error.message);
      return;
    }

    alert("設定已儲存");
  };

  // ===== 手動觸發 =====
  document.getElementById("run-once-btn").onclick = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/scheduler/run-once", {
      method: "POST"
    });

    const data = await res.json();
    console.log("scheduler 回傳：", data);

    if (!res.ok || !data.ok) {
      throw new Error(data.message || "觸發失敗");
    }

    alert("已觸發產文成功");

    if (typeof loadArticles === "function") {
      await loadArticles();
    }
  } catch (err) {
    console.error("run-once error:", err);
    alert(`無法觸發：${err.message}`);
  }
};

  loadSettings();
});
