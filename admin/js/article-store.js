function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapArticleRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    summary: row.summary || "",
    content: row.content || "",
    category: row.category || "",
    status: row.status || "draft",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    scheduledAt: row.scheduled_at || null,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLeadRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name || "",
    contact: row.contact || "",
    message: row.message || "",
    sourceArticleId: row.source_article_id || "",
    sourceArticleTitle: row.source_article_title || "",
    status: row.status || "new",
    createdAt: row.created_at
  };
}

async function createArticle(payload) {
  const supabase = window.supabaseClient;
  const now = new Date().toISOString();

  const status = payload.status || "draft";
  const scheduledAt = payload.scheduledAt || payload.scheduled_at || null;

  const insertData = {
    title: payload.title || "未命名文章",
    slug: payload.slug || slugify(payload.title || "article"),
    summary: payload.summary || "",
    content: payload.content || "",
    category: payload.category || "文章",
    status,
    seo_title: payload.seoTitle || payload.title || "未命名文章",
    seo_description: payload.seoDescription || payload.summary || "",
    scheduled_at: status === "scheduled" ? scheduledAt : null,
    published_at: status === "published" ? now : null,
    updated_at: now
  };

  const { data, error } = await supabase
    .from("articles")
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;

  return mapArticleRow(data);
}

async function updateArticle(id, patch = {}) {
  const supabase = window.supabaseClient;
  const now = new Date().toISOString();

  const updateData = {
    updated_at: now
  };

  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.slug !== undefined) {
    updateData.slug = patch.slug || slugify(patch.title || "");
  }
  if (patch.summary !== undefined) updateData.summary = patch.summary;
  if (patch.content !== undefined) updateData.content = patch.content;
  if (patch.category !== undefined) updateData.category = patch.category;
  if (patch.seoTitle !== undefined) updateData.seo_title = patch.seoTitle;
  if (patch.seoDescription !== undefined) updateData.seo_description = patch.seoDescription;

  if (patch.scheduledAt !== undefined || patch.scheduled_at !== undefined) {
    updateData.scheduled_at = patch.scheduledAt ?? patch.scheduled_at ?? null;
  }

  if (patch.status !== undefined) {
    updateData.status = patch.status;

    if (patch.status === "published") {
      updateData.published_at = now;
      updateData.scheduled_at = null;
    } else if (patch.status === "scheduled") {
      if (patch.scheduledAt !== undefined || patch.scheduled_at !== undefined) {
        updateData.scheduled_at = patch.scheduledAt ?? patch.scheduled_at ?? null;
      }
      // scheduled 不改 published_at
    } else if (patch.status === "draft") {
      updateData.published_at = null;
      if (patch.scheduledAt === null || patch.scheduled_at === null) {
        updateData.scheduled_at = null;
      }
    }
  }

  const { data, error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapArticleRow(data);
}

async function updateArticleStatus(id, status) {
  return updateArticle(id, { status });
}

async function deleteArticle(id) {
  const supabase = window.supabaseClient;

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

async function getArticles() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapArticleRow);
}

async function getArticleById(id) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return mapArticleRow(data);
}

async function getArticleBySlug(slug) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return mapArticleRow(data);
}

async function getPublishedArticles() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapArticleRow);
}

async function createLead(payload) {
  const supabase = window.supabaseClient;

  const insertData = {
    name: payload.name || "",
    contact: payload.contactValue || payload.contact || "",
    message: payload.message || "",
    source_article_id: payload.sourceArticleId || null,
    source_article_title: payload.sourceArticleTitle || "",
    status: payload.status || "new"
  };

  const { data, error } = await supabase
    .from("leads")
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;

  return mapLeadRow(data);
}

async function getLeads() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapLeadRow);
}

async function trackEvent(payload) {
  const supabase = window.supabaseClient;

  const insertData = {
    article_id: payload.articleId || null,
    event_type: payload.eventType || "page_view",
    source: payload.source || "direct"
  };

  const { data, error } = await supabase
    .from("tracking_events")
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function getTrackingEvents() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

async function updateLeadStatus(id, status) {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function getDashboardStats() {
  const [articles, leads, events] = await Promise.all([
    getArticles(),
    getLeads(),
    getTrackingEvents()
  ]);

  const published = articles.filter((article) => article.status === "published");

  const totalPv = events.filter((event) => event.event_type === "page_view").length;
  const totalLeads = leads.length;

  const conversionRate =
    totalPv > 0 ? Number(((totalLeads / totalPv) * 100).toFixed(2)) : 0;

  const topArticles = published
    .map((article) => {
      const pv = events.filter(
        (event) =>
          event.article_id === article.id &&
          event.event_type === "page_view"
      ).length;

      const articleLeads = leads.filter(
        (lead) => lead.sourceArticleId === article.id
      ).length;

      return {
        article,
        analytics: {
          pv,
          leads: articleLeads,
          conversionRate: pv > 0 ? Number(((articleLeads / pv) * 100).toFixed(2)) : 0
        }
      };
    })
    .sort((a, b) => b.analytics.pv - a.analytics.pv)
    .slice(0, 5);

  return {
    articles,
    published,
    leads,
    events,
    totalPv,
    totalLeads,
    avgStaySeconds: 0,
    conversionRate,
    topArticles
  };
}

window.ArticleStore = {
  slugify,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  getArticles,
  getArticleById,
  getArticleBySlug,
  getPublishedArticles,
  createLead,
  getLeads,
  getDashboardStats,
  trackEvent,
  getTrackingEvents,
  updateLeadStatus
};