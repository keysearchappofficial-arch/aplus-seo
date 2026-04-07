window.__adminGuardPromise = Promise.resolve(true);

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    alert("之後這裡可接 Supabase Auth 登出，現在先保留入口。");
  });
});