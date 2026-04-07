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
    publishedAt: row.published_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
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
    createdAt: row.created_at || null
  };
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

async function getLeads() {
  const supabase = window.supabaseClient;

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapLeadRow);
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

async function getDashboardStats() {
  const [articles, leads, events] = await Promise.all([
    getArticles(),
    getLeads(),
    getTrackingEvents()
  ]);

  const published = articles.filter(article => article.status === "published");
  const drafts = articles.filter(article => article.status === "draft");
  const scheduled = articles.filter(article => article.status === "scheduled");

  const totalPv = events.filter(event => event.event_type === "page_view").length;
  const totalLeads = leads.length;

  const conversionRate =
    totalPv > 0 ? Number(((totalLeads / totalPv) * 100).toFixed(2)) : 0;

  const topArticles = published
    .map(article => {
      const pv = events.filter(
        event => event.article_id === article.id && event.event_type === "page_view"
      ).length;

      const articleLeads = leads.filter(
        lead => lead.sourceArticleId === article.id
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
    drafts,
    scheduled,
    leads,
    events,
    totalPv,
    totalLeads,
    conversionRate,
    topArticles,
    latestLeads: leads.slice(0, 5)
  };
}

window.ArticleStore = {
  getArticles,
  getLeads,
  getTrackingEvents,
  getDashboardStats
};