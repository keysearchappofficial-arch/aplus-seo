const OLLAMA_PROXY_API =
  (window.API_BASE || (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://recall-alternatively-harper-nickel.trycloudflare.com"
  )) + "/api/ollama/generate";

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
      region: location,
      topic,
      tone,
      service: category || cta || "",
      keywords: "",
      audience: ""
    })
  });

  let parsed = {};
  try {
    parsed = await response.json();
  } catch (error) {
    throw new Error("API 回傳格式錯誤，請稍後再試。");
  }

  if (!response.ok) {
    let message = `Node API 錯誤：${response.status}`;

    if (parsed?.detail) {
      message += ` - ${parsed.detail}`;
    } else if (parsed?.message) {
      message += ` - ${parsed.message}`;
    } else if (parsed?.error) {
      message += ` - ${parsed.error}`;
    }

    throw new Error(message);
  }

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
    seoDescription: String(article.seoDescription).trim(),
    industryCategory: String(article.industryCategory || "").trim()
  };
}

window.OllamaClient = {
  generateWithOllama
};