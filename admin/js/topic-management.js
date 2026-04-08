async function renderTopicLibrary() {
  const container = document.getElementById("topic-library-list");
  if (!container) return;

  const topics = await window.TopicStore.getAll();

  if (!topics.length) {
    container.innerHTML = `<div class="card"><div class="card__body">目前還沒有題目</div></div>`;
    return;
  }

  container.innerHTML = topics.map(item => `
    <div class="card topic-card" data-id="${item.id}">
      <div class="card__body">
        <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start;">
          <div>
            <div style="font-weight:700; margin-bottom:8px;">${item.topic}</div>
            <div style="font-size:13px; color:#64748b;">
              ${item.location}｜${item.industry}｜${item.source || "manual"}
            </div>
          </div>
          <button class="topic-delete-btn" data-id="${item.id}">刪除</button>
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".topic-delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      await window.TopicStore.remove(id);
      await renderTopicLibrary();
    };
  });
}

async function bindTopicGenerator() {
  const btn = document.getElementById("generate-topics-btn");
  if (!btn) return;

  btn.onclick = async () => {
    try {
      btn.disabled = true;
      btn.textContent = "生成中...";

      const industry =
        document.getElementById("topic-industry")?.value?.trim() || "企業服務";
      const location =
        document.getElementById("topic-location")?.value?.trim() || "台灣";
      const count =
        Number(document.getElementById("topic-count")?.value) || 10;

      const topics = await window.TopicClient.generateTopicsWithAI({
        industry,
        location,
        count
      });

      await window.TopicStore.addMany(topics);
      await renderTopicLibrary();

      alert(`已新增 ${topics.length} 個主題到題庫`);
    } catch (error) {
      console.error("自動產主題失敗：", error);
      alert(error.message || "自動產主題失敗");
    } finally {
      btn.disabled = false;
      btn.textContent = "自動產主題";
    }
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  await bindTopicGenerator();
  await renderTopicLibrary();
});
