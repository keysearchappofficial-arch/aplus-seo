async function requireAdminAuth() {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase client 未載入");
    window.location.href = "./login.html";
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("取得 session 失敗：", error);
    window.location.href = "./login.html";
    return null;
  }

  if (!data.session) {
    window.location.href = "./login.html";
    return null;
  }

  return data.session;
}

async function signOutAdmin() {
  const supabase = window.supabaseClient;
  if (!supabase) return;

  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

window.AdminAuth = {
  requireAdminAuth,
  signOutAdmin
};