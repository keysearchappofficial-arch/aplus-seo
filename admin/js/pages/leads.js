document.addEventListener("DOMContentLoaded", async () => {
  if (window.__adminGuardPromise) {
    const session = await window.__adminGuardPromise;
    if (!session) return;
  }

  if (typeof window.loadAdminLayout === "function") {
    await window.loadAdminLayout();
  }

  AdminCommon.renderLayout(
    "leads",
    "名單管理",
    "查看網站送出的詢問，更新跟進狀態與備註。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <section class="card">
      <div class="card__body">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;">
          <div>
            <h3 style="margin:0;font-size:18px;">詢問名單</h3>
            <p style="margin:6px 0 0;color:#64748b;font-size:14px;">管理前台 SEO 評估送出的名單。</p>
          </div>

          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <select id="lead-status-filter" class="select">
              <option value="">全部狀態</option>
              <option value="new">新名單</option>
              <option value="contacted">已聯絡</option>
              <option value="qualified">有機會</option>
              <option value="closed">已成交 / 已結束</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:20px;">
      <div class="card__body">
        <div id="leads-list"></div>
      </div>
    </section>
  `;

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getStatusLabel(status) {
    switch (status) {
      case "new":
        return "新名單";
      case "contacted":
        return "已聯絡";
      case "qualified":
        return "有機會";
      case "closed":
        return "已成交 / 已結束";
      default:
        return status || "新名單";
    }
  }

  async function renderLeads() {
    const list = document.getElementById("leads-list");
    const filter = document.getElementById("lead-status-filter")?.value || "";

    if (!list) return;

    try {
      let leads = await window.ArticleStore.getLeads();

      if (filter) {
        leads = leads.filter(item => item.status === filter);
      }

      if (!leads.length) {
        list.innerHTML = `
          <div style="padding:20px;border:1px dashed #cbd5e1;border-radius:16px;color:#64748b;">
            目前沒有符合條件的名單。
          </div>
        `;
        return;
      }

      list.innerHTML = `
        <div style="display:grid;gap:14px;">
          ${leads.map(lead => `
            <article style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#fff;">
              <div style="display:grid;gap:14px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
                  <div style="flex:1;min-width:260px;">
                    <h4 style="margin:0 0 8px;font-size:18px;color:#0f172a;">
                      ${escapeHtml(lead.name)}
                    </h4>

                    <div style="font-size:14px;color:#334155;margin-bottom:8px;">
                      聯絡方式：${escapeHtml(lead.contact)}
                    </div>

                    <div style="font-size:13px;color:#64748b;display:flex;gap:8px;flex-wrap:wrap;">
                      <span>來源文章：${escapeHtml(lead.sourceArticleTitle || "未記錄")}</span>
                      <span>｜</span>
                      <span>來源渠道：${escapeHtml(lead.sourceChannel || "direct")}</span>
                      <span>｜</span>
                      <span>建立時間：${escapeHtml(formatDateTime(lead.createdAt))}</span>
                    </div>
                  </div>

                  <div style="min-width:220px;display:grid;gap:8px;">
                    <label style="font-size:13px;color:#64748b;">狀態</label>
                    <select class="select lead-status-select" data-id="${escapeHtml(lead.id)}">
                      <option value="new" ${lead.status === "new" ? "selected" : ""}>新名單</option>
                      <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>已聯絡</option>
                      <option value="qualified" ${lead.status === "qualified" ? "selected" : ""}>有機會</option>
                      <option value="closed" ${lead.status === "closed" ? "selected" : ""}>已成交 / 已結束</option>
                    </select>

                    <div style="font-size:12px;color:#64748b;">
                      目前狀態：${escapeHtml(getStatusLabel(lead.status))}
                    </div>
                  </div>
                </div>

                <div>
                  <div style="font-size:13px;color:#64748b;margin-bottom:6px;">需求內容</div>
                  <div style="padding:12px 14px;background:#f8fafc;border-radius:12px;color:#334155;white-space:pre-wrap;">
                    ${escapeHtml(lead.message || "無")}
                  </div>
                </div>

                <div>
                  <div style="font-size:13px;color:#64748b;margin-bottom:6px;">內部備註</div>
                  <textarea
                    class="input lead-note-input"
                    data-id="${escapeHtml(lead.id)}"
                    style="min-height:100px;width:100%;resize:vertical;"
                    placeholder="例如：已加 LINE、預計明天回電、對方是電商客戶..."
                  >${escapeHtml(lead.note || "")}</textarea>

                  <div style="margin-top:10px;">
                    <button class="btn btn--primary save-note-btn" data-id="${escapeHtml(lead.id)}">
                      儲存備註
                    </button>
                  </div>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      `;

      list.querySelectorAll(".lead-status-select").forEach(select => {
        select.addEventListener("change", async () => {
          try {
            await window.ArticleStore.updateLeadStatus(select.dataset.id, select.value);
            await renderLeads();
          } catch (error) {
            alert(`更新狀態失敗：${error.message}`);
          }
        });
      });

      list.querySelectorAll(".save-note-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const textarea = list.querySelector(`.lead-note-input[data-id="${id}"]`);
          const note = textarea?.value || "";

          try {
            btn.disabled = true;
            btn.textContent = "儲存中...";
            await window.ArticleStore.updateLeadNote(id, note);
            btn.textContent = "已儲存";
            setTimeout(() => {
              btn.textContent = "儲存備註";
              btn.disabled = false;
            }, 800);
          } catch (error) {
            btn.disabled = false;
            btn.textContent = "儲存備註";
            alert(`儲存備註失敗：${error.message}`);
          }
        });
      });

    } catch (error) {
      list.innerHTML = `
        <div style="padding:20px;border:1px solid #fecaca;border-radius:16px;background:#fff1f2;color:#b91c1c;">
          載入名單失敗：${escapeHtml(error.message)}
        </div>
      `;
    }
  }

  document.getElementById("lead-status-filter")?.addEventListener("change", renderLeads);

  await renderLeads();
});
