document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "leads",
    "名單管理",
    "查看網站收集到的潛在客戶"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__body">

        <div style="margin-bottom:16px;display:flex;gap:12px;">
          <select id="filter-status" class="input" style="max-width:200px;">
            <option value="all">全部</option>
            <option value="new">新名單</option>
            <option value="contacted">已聯絡</option>
            <option value="closed">已成交</option>
          </select>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>聯絡方式</th>
                <th>來源文章</th>
                <th>狀態</th>
                <th>時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="lead-table"></tbody>
          </table>
        </div>

      </div>
    </div>
  `;

  const supabase = window.supabaseClient;
  const filter = document.getElementById("filter-status");

  let leads = [];

  // ✅ 等 DOM 真正 render 完再開始
  requestAnimationFrame(() => {
    loadLeads();
  });

  // ===== 載入資料 =====
  async function loadLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      root.innerHTML = `
        <div class="card">
          <div class="card__body">
            載入失敗：${AdminCommon.escapeHtml(error.message)}
          </div>
        </div>
      `;
      return;
    }

    leads = data || [];
    render();
  }

  // ===== 渲染 =====
  function render() {
    const table = document.getElementById("lead-table");

    if (!table) {
      console.warn("⚠️ lead-table 尚未出現");
      return;
    }

    const status = filter.value;

    const filtered =
      status === "all"
        ? leads
        : leads.filter(l => l.status === status);

    if (!filtered.length) {
      table.innerHTML = `
        <tr>
          <td colspan="6">沒有資料</td>
        </tr>
      `;
      return;
    }

    table.innerHTML = filtered.map(l => `
      <tr>
        <td>${AdminCommon.escapeHtml(l.name || "-")}</td>
        <td>${AdminCommon.escapeHtml(l.contact || "-")}</td>
        <td>${AdminCommon.escapeHtml(l.source_article_title || "-")}</td>
        <td><span class="badge">${l.status || "new"}</span></td>
        <td>${formatDate(l.created_at)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn--soft" onclick="setStatus('${l.id}','contacted')">已聯絡</button>
          <button class="btn btn--primary" onclick="setStatus('${l.id}','closed')">成交</button>
        </td>
      </tr>
    `).join("");
  }

  // ===== 更新狀態 =====
  window.setStatus = async (id, status) => {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("更新失敗：" + error.message);
      return;
    }

    loadLeads();
  };

  // ===== 篩選 =====
  filter.addEventListener("change", render);

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("zh-TW");
  }
});
