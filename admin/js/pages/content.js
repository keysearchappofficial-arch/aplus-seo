document.addEventListener("DOMContentLoaded", async () => {
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
      alert("載入失敗：" + error.message);
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
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.category || "-")}</td>
        <td>${a.status}</td>
        <td>${formatDate(a.created_at)}</td>
        <td>
  <button onclick="editArticle('${a.id}')">編輯</button>
  ${
    a.status !== "published"
      ? `<button onclick="publish('${a.id}')">發布</button>`
      : ""
  }
  <button onclick="deleteArticle('${a.id}')">刪除</button>
</td>
      </tr>
    `).join("");
  }

  window.publish = async (id) => {
    if (!confirm("確定發布？")) return;

    const { error } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert("發布失敗：" + error.message);
      return;
    }

    alert("已發布");
    loadArticles();
  };
  
  window.editArticle = (id) => {
  window.location.href = `./edit.html?id=${id}`;
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

  function escapeHtml(str = "") {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  loadArticles();
});