document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  const industryEl = document.getElementById("setting-industry");
  const locationEl = document.getElementById("setting-location");
  const toneEl = document.getElementById("setting-tone");
  const ctaEl = document.getElementById("setting-cta");
  const frequencyEl = document.getElementById("setting-frequency");
  const defaultStatusEl = document.getElementById("setting-default-status");
  const enabledEl = document.getElementById("setting-enabled");
  const saveBtn = document.getElementById("save-settings-btn");

  let currentId = null;

  async function loadSettings() {
    const { data, error } = await supabase
      .from("auto_generate_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      alert("載入設定失敗：" + error.message);
      return;
    }

    if (!data) return;

    currentId = data.id;
    industryEl.value = data.industry || "";
    locationEl.value = data.location || "";
    toneEl.value = data.tone || "";
    ctaEl.value = data.cta || "";
    frequencyEl.value = data.frequency || "daily";
    defaultStatusEl.value = data.default_status || "draft";
    enabledEl.checked = !!data.is_enabled;
  }

  saveBtn.addEventListener("click", async () => {
    const payload = {
      industry: industryEl.value.trim(),
      location: locationEl.value.trim(),
      tone: toneEl.value.trim(),
      cta: ctaEl.value.trim(),
      frequency: frequencyEl.value,
      default_status: defaultStatusEl.value,
      is_enabled: enabledEl.checked,
      updated_at: new Date().toISOString()
    };

    let error;

    if (currentId) {
      ({ error } = await supabase
        .from("auto_generate_settings")
        .update(payload)
        .eq("id", currentId));
    } else {
      ({ error } = await supabase
        .from("auto_generate_settings")
        .insert([payload]));
    }

    if (error) {
      alert("儲存失敗：" + error.message);
      return;
    }

    alert("設定已儲存");
    loadSettings();
  });

  loadSettings();
});