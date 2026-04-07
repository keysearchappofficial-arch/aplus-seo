document.addEventListener("DOMContentLoaded", async () => {
  
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  
  AdminCommon.renderLayout(
    "leads",
    "詢問名單",
    "管理從文章導入的表單名單與狀態。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  await render();

  async function render() {
    let leads = [];

    try {
      leads = await ArticleStore.getLeads();
    } catch (error) {
      console.error("載入名單失敗：", error);
      root.innerHTML = `
        <div class="card">
          <div class="card__body">載入失敗：${error.message}</div>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="toolbar">
        <div class="toolbar__left">
          <input
            id="lead-search"
            class="input"
            style="width:280px"
            placeholder="搜尋姓名或來源文章"
          >
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>聯絡方式</th>
                  <th>需求內容</th>
                  <th>來源文章</th>
                  <th>狀態</th>
                  <th>時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="lead-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const tbody = document.getElementById("lead-tbody");

    const draw = (list) => {
      tbody.innerHTML =
        list
          .map(
            (lead) => `
              <tr>
                <td><strong>${escapeHtml(lead.name || "-")}</strong></td>
                <td>${escapeHtml(lead.contact || "-")}</td>
                <td>${escapeHtml(lead.message || "-")}</td>
                <td>${escapeHtml(lead.sourceArticleTitle || "-")}</td>
                <td>${AdminCommon.statusBadge(lead.status || "new")}</td>
                <td>${AdminCommon.formatDate(lead.createdAt)}</td>
                <td>
                  <select class="select" data-id="${lead.id}" style="width:140px">
                    <option value="new" ${lead.status === "new" ? "selected" : ""}>未處理</option>
                    <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>已聯絡</option>
                    <option value="negotiating" ${lead.status === "negotiating" ? "selected" : ""}>成交中</option>
                    <option value="won" ${lead.status === "won" ? "selected" : ""}>已成交</option>
                    <option value="lost" ${lead.status === "lost" ? "selected" : ""}>未成交</option>
                  </select>
                </td>
              </tr>
            `
          )
          .join("") || `<tr><td colspan="7">目前尚無詢問名單</td></tr>`;
    };

    draw(leads);

    document.getElementById("lead-search").addEventListener("input", (e) => {
      const keyword = e.target.value.trim().toLowerCase();

      const filtered = leads.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(keyword) ||
          (item.sourceArticleTitle || "").toLowerCase().includes(keyword)
      );

      draw(filtered);
    });

    tbody.addEventListener("change", async (e) => {
      if (!e.target.matches("select[data-id]")) return;

      const id = e.target.dataset.id;
      const status = e.target.value;

      try {
        await ArticleStore.updateLeadStatus(id, status);
        await render();
      } catch (error) {
        console.error("更新名單狀態失敗：", error);
        alert(`更新失敗：${error.message}`);
      }
    });
  }
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}