document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;
  const table = document.getElementById("lead-table");

  async function loadLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("載入失敗：" + error.message);
      return;
    }

    render(data || []);
  }

  function render(leads) {
    if (!leads.length) {
      table.innerHTML = `
        <tr><td colspan="6">目前沒有名單</td></tr>
      `;
      return;
    }

    table.innerHTML = leads.map(lead => `
      <tr>
        <td>${escapeHtml(lead.name)}</td>
        <td>${escapeHtml(lead.contact)}</td>
        <td>${escapeHtml(lead.source_article_title || "-")}</td>
        <td>
          <select onchange="updateStatus('${lead.id}', this.value)">
            <option value="new" ${lead.status === "new" ? "selected" : ""}>新名單</option>
            <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>已聯絡</option>
            <option value="closed" ${lead.status === "closed" ? "selected" : ""}>已成交</option>
          </select>
        </td>
        <td>${formatDate(lead.created_at)}</td>
        <td>
          <button onclick="deleteLead('${lead.id}')">刪除</button>
        </td>
      </tr>
    `).join("");
  }

  window.updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("更新失敗：" + error.message);
    }
  };

  window.deleteLead = async (id) => {
    if (!confirm("確定刪除？")) return;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

    loadLeads();
  };

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-TW");
  }

  function escapeHtml(str = "") {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  loadLeads();
});