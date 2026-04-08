document.addEventListener("DOMContentLoaded", async () => {
  await window.loadAdminLayout();

  AdminCommon.renderLayout(
    "content",
    "文章管理",
    "管理所有文章（草稿 / 已發布 / 排程）"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  root.innerHTML = `
    <div class="card">
      <div class="card__body">

        <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;">
          <select id="filter-status" class="input" style="max-width:220px;">
            <option value="all">全部</option>
            <option value="published">已發布</option>
            <option value="draft">草稿</option>
            <option value="scheduled">排程中</option>
          </select>

          <a href="./generate.html" class="btn btn--primary">新增文章</a>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>標題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="article-table"></tbody>
          </table>
        </div>

      </div>
    </div>
  `;

  const supabase = window.supabaseClient;
  const table = document.getElementById("article-table");
  const filter = document.getElementById("filter-status");

  let articles = [];

  async function loadArticles() {
    const { data, error } = await supabase
      .from("articles")
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

    articles = data || [];
    render();
  }

  function render() {
    const status = filter.value;

    const filtered =
      status === "all"
        ? articles
        : articles.filter(a => a.status === status);

    if (!filtered.length) {
      table.innerHTML = `
        <tr>
          <td colspan="5">沒有資料</td>
        </tr>
      `;
      return;
    }

    table.innerHTML = filtered.map(a => `
      <tr>
        <td>${AdminCommon.escapeHtml(a.title)}</td>
        <td>${AdminCommon.escapeHtml(a.category || "-")}</td>
        <td><span class="badge">${AdminCommon.escapeHtml(a.status || "-")}</span></td>
        <td>${formatDate(a.published_at || a.created_at)}</td>
        <td style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn--soft" onclick="editArticle('${a.id}')">編輯</button>
          ${
            a.status !== "published"
              ? `<button class="btn btn--primary" onclick="publish('${a.id}')">發布</button>`
              : ""
          }
          <button class="btn btn--soft" onclick="deleteArticle('${a.id}')">刪除</button>
        </td>
      </tr>
    `).join("");
  }

  window.editArticle = (id) => {
    window.location.href = `./edit.html?id=${id}`;
  };

  window.publish = async (id) => {
    if (!confirm("確定發布？")) return;

    const { error } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert("發布失敗：" + error.message);
      return;
    }

    alert("已發布");
    loadArticles();
  };

  window.deleteArticle = async (id) => {
    if (!confirm("確定刪除？")) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

    alert("已刪除");
    loadArticles();
  };

  filter.addEventListener("change", render);

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-TW");
  }

  loadArticles();
});