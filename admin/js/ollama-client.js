const OLLAMA_PROXY_API = "http://localhost:3000/api/ollama/generate";

async function generateWithOllama({ industry, location, topic, tone, cta }) {
  const response = await fetch(OLLAMA_PROXY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      industry,
      location,
      topic,
      tone,
      cta
    })
  });

  if (!response.ok) {
    let message = `Node API 錯誤：${response.status}`;

    try {
      const err = await response.json();
      if (err?.detail) {
        message += ` - ${err.detail}`;
      } else if (err?.error) {
        message += ` - ${err.error}`;
      }
    } catch (_) {}

    throw new Error(message);
  }

  const parsed = await response.json();

  if (
    !parsed.title ||
    !parsed.summary ||
    !parsed.content ||
    !parsed.seoTitle ||
    !parsed.seoDescription
  ) {
    console.error("Node API 原始回傳：", parsed);
    throw new Error("Node API 回傳欄位不完整");
  }

  const normalized = {
    title: String(parsed.title).trim(),
    summary: String(parsed.summary).trim(),
    content: String(parsed.content).trim(),
    seoTitle: String(parsed.seoTitle).trim(),
    seoDescription: String(parsed.seoDescription).trim()
  };

  if (!normalized.content.includes("<h2>")) {
    throw new Error("生成內容缺少 h2 結構");
  }

  if (!normalized.content.includes('article-inline-cta')) {
    throw new Error("生成內容缺少 CTA 區塊");
  }

  if (!normalized.content.includes("常見問題")) {
    throw new Error("生成內容缺少 FAQ 區塊");
  }

  return normalized;
}

window.OllamaClient = {
  generateWithOllama
};