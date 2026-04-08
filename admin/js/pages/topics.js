document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "topics",
    "題庫管理",
    "管理自動產文使用的主題與關鍵字題庫"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card__body">
        <h3 class="card__title">新增題目</h3>

        <div style="display:grid;gap:12px;max-width:720px;">
          <input id="topic-input" class="input" type="text" placeholder="例如：AI SEO 是什麼" />
          <input id="topic-sort" class="input" type="number" placeholder="排序（數字越小越前面）" value="0" />
          <button id="add-topic-btn" class="btn btn--primary" type="button">新增題目</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__body">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>題目</th>
                <th>啟用</th>
                <th>排序</th>
                <th>上次生成</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="topics-table"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const supabase = window.supabaseClient;
  const table = document.getElementById("topics-table");
  const topicInput = document.getElementById("topic-input");
  const topicSort = document.getElementById("topic-sort");
  const addBtn = document.getElementById("add-topic-btn");

  async function loadTopics() {
    const { data, error } = await supabase
      .from("auto_generate_topics")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      root.innerHTML = `
        <div class="card">
          <div class="card__body">
            載入題庫失敗：${AdminCommon.escapeHtml(error.message)}
          </div>
        </div>
      `;
      return;
    }

    render(data || []);
  }

  function render(list) {
    if (!list.length) {
      table.innerHTML = `<tr><td colspan="5">目前沒有題目</td></tr>`;
      return;
    }

    table.innerHTML = list.map(item => `
      <tr>
        <td>${AdminCommon.escapeHtml(item.topic)}</td>
        <td>
          <input
            type="checkbox"
            ${item.is_active ? "checked" : ""}
            onchange="toggleTopic('${item.id}', this.checked)"
          />
        </td>
        <td>
          <input
            type="number"
            value="${item.sort_order ?? 0}"
            class="input"
            style="width:90px;padding:8px 10px;"
            onchange="updateSort('${item.id}', this.value)"
          />
        </td>
        <td>${formatDate(item.last_generated_at)}</td>
        <td>
          <button class="btn btn--soft" onclick="deleteTopic('${item.id}')">刪除</button>
        </td>
      </tr>
    `).join("");
  }

  addBtn.addEventListener("click", async () => {
    const topic = (topicInput.value || "").trim();
    const sort_order = Number(topicSort.value || 0);

    if (!topic) {
      alert("請輸入題目");
      return;
    }

    const { error } = await supabase
      .from("auto_generate_topics")
      .insert([{ topic, sort_order, is_active: true }]);

    if (error) {
      alert("新增失敗：" + error.message);
      return;
    }

    topicInput.value = "";
    topicSort.value = "0";
    loadTopics();
  });

  window.toggleTopic = async (id, is_active) => {
    const { error } = await supabase
      .from("auto_generate_topics")
      .update({ is_active })
      .eq("id", id);

    if (error) {
      alert("更新失敗：" + error.message);
    }
  };

  window.updateSort = async (id, value) => {
    const sort_order = Number(value || 0);

    const { error } = await supabase
      .from("auto_generate_topics")
      .update({ sort_order })
      .eq("id", id);

    if (error) {
      alert("更新排序失敗：" + error.message);
    }
  };

  window.deleteTopic = async (id) => {
    if (!confirm("確定刪除這個題目？")) return;

    const { error } = await supabase
      .from("auto_generate_topics")
      .delete()
      .eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

    loadTopics();
  };

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("zh-TW");
  }

  loadTopics();
});