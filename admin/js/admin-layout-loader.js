async function loadAdminLayout() {
  const mount = document.getElementById("admin-layout-mount");
  if (!mount) return;

  try {
    const res = await fetch("./components/layout.html");
    if (!res.ok) {
      throw new Error(`layout 載入失敗：${res.status}`);
    }

    const html = await res.text();
    mount.innerHTML = html;
  } catch (error) {
    console.error("載入 admin layout 失敗：", error);
    mount.innerHTML = `
      <div style="padding:24px;color:#b91c1c;">
        後台框架載入失敗：${escapeHtml(error.message)}
      </div>
    `;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

window.loadAdminLayout = loadAdminLayout;