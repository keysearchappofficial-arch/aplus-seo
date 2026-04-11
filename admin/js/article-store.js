function mapArticleRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    summary: row.summary || "",
    body: row.body || "",
    content: row.content || row.body || "",
    category: row.category || "",
    industryCategory: row.industry_category || "",
    status: row.status || "draft",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    scheduledAt: row.scheduled_at || null,
    publishedAt: row.published_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    views: row.views || 0,
    social_facebook: row.social_facebook || "",
    social_x: row.social_x || "",
    social_linkedin: row.social_linkedin || "",
    social_threads: row.social_threads || "",
    social_line: row.social_line || ""
  };
}

function mapLeadRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name || "",
    contact: row.contact || row.contact_value || "",
    message: row.message || "",
    sourceArticleId: row.source_article_id || "",
    sourceArticleTitle: row.source_article_title || "",
    sourceChannel: row.source_channel || "",
    status: row.status || "new",
    note: row.note || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

/* =========================
   🔥 Articles
========================= */

async function getArticles() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapArticleRow);
}

/* 🔥 真刪除（會從 DB 消失） */
async function deleteArticle(id) {
  const supabase = window.supabaseClient;

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

/* 🔥 軟刪除（推薦 SEO 用） */
async function deleteArticleSoft(id) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .update({
      status: "deleted",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  if (!data || !data.length) {
    throw new Error("文章未更新（可能被 RLS 擋住）");
  }

  return true;
}

/* =========================
   🔥 Leads
========================= */

async function getLeads() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapLeadRow);
}

async function createLead({
  name,
  contactValue,
  message = "",
  sourceArticleId = null,
  sourceArticleTitle = "",
  sourceChannel = "direct"
}) {
  const supabase = window.supabaseClient;

  const payload = {
    name: String(name || "").trim(),
    contact_value: String(contactValue || "").trim(),
    message: String(message || "").trim(),
    source_article_id: sourceArticleId,
    source_article_title: String(sourceArticleTitle || "").trim(),
    source_channel: String(sourceChannel || "direct").trim(),
    status: "new",
    created_at: new Date().toISOString()
  };

  if (!payload.name) throw new Error("缺少姓名");
  if (!payload.contact_value) throw new Error("缺少聯絡方式");

  const { data, error } = await supabase
    .from("leads")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapLeadRow(data);
}

async function updateLeadStatus(id, status) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  if (!data || !data.length) {
    throw new Error("沒有任何資料被更新（RLS問題）");
  }

  return data[0];
}

async function updateLeadNote(id, note) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .update({
      note: String(note || "").trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  if (!data || !data.length) {
    throw new Error("沒有任何資料被更新（RLS問題）");
  }

  return data[0];
}

/* =========================
   🔥 Tracking
========================= */

async function getTrackingEvents() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function trackEvent({
  articleId,
  eventType,
  source = "direct"
}) {
  const supabase = window.supabaseClient;

  const payload = {
    article_id: articleId,
    event_type: eventType,
    source,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("tracking_events")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* =========================
   🔥 Dashboard
========================= */

async function getDashboardStats() {
  const [articles, leads, events] = await Promise.all([
    getArticles(),
    getLeads(),
    getTrackingEvents()
  ]);

  const published = articles.filter(a => a.status === "published");
  const drafts = articles.filter(a => a.status === "draft");

  const totalPv = events.filter(e => e.event_type === "page_view").length;
  const totalLeads = leads.length;

  return {
    articles,
    published,
    drafts,
    leads,
    events,
    totalPv,
    totalLeads
  };
}

/* =========================
   🔥 Export
========================= */

window.ArticleStore = {
  getArticles,
  deleteArticle,        // 真刪
  deleteArticleSoft,    // 軟刪
  getLeads,
  createLead,
  updateLeadStatus,
  updateLeadNote,
  getTrackingEvents,
  trackEvent,
  getDashboardStats
};