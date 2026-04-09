const OLLAMA_PROXY_API = "http://localhost:3000/api/ollama/generate";

async function generateWithOllama({
  industry = "",
  location = "",
  topic = "",
  tone = "專業",
  cta = "",
  category = ""
}) {
  const response = await fetch(OLLAMA_PROXY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      industry,
      region: location,         // 後端吃 region，不是 location
      topic,
      tone,
      service: category || cta || "", // 先用 category 或 cta 補 service
      keywords: "",
      audience: ""
    })
  });

  if (!response.ok) {
    let message = `Node API 錯誤：${response.status}`;

    try {
      const err = await response.json();
      if (err?.detail) {
        message += ` - ${err.detail}`;
      } else if (err?.message) {
        message += ` - ${err.message}`;
      } else if (err?.error) {
        message += ` - ${err.error}`;
      }
    } catch (_) {}

    throw new Error(message);
  }

  const parsed = await response.json();
  const article = parsed?.article || null;

  if (
    !article ||
    !article.title ||
    !article.summary ||
    !article.body ||
    !article.seoTitle ||
    !article.seoDescription
  ) {
    console.error("Node API 原始回傳：", parsed);
    throw new Error("Node API 回傳欄位不完整");
  }

  return {
    title: String(article.title).trim(),
    summary: String(article.summary).trim(),
    content: String(article.body).trim(),
    seoTitle: String(article.seoTitle).trim(),
    seoDescription: String(article.seoDescription).trim()
  };
}

window.OllamaClient = {
  generateWithOllama
};
