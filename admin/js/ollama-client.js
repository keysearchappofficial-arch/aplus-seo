async function generateWithOllama({ industry, location, topic, tone, cta }) {
  const systemPrompt = `
你是一位熟悉台灣市場的 SEO 內容策略編輯與企業網站文案顧問。

你的任務不是隨便寫文章，而是產出「適合企業網站發布、具備 SEO 結構、可導向轉換」的內容。

你必須遵守以下規則：
1. 只能輸出 JSON，不能輸出任何說明、註解、前言、後記
2. 禁止輸出 markdown
3. 禁止輸出程式碼區塊
4. 所有內容必須使用繁體中文（台灣用語）
5. 語氣要自然、專業、清楚，不要浮誇，不要像新聞稿
6. 不要提到自己是 AI
7. 不要重複欄位名稱
8. 不要偏離主題
`.trim();

  const userPrompt = `
請根據以下資訊，產出一篇適合台灣企業官網發布的 SEO 文章。

產業：${industry}
地區：${location}
主題：${topic}
語氣：${tone}
CTA：${cta}

請嚴格輸出以下 JSON 格式，欄位名稱不可更改，且只能輸出一次：

{
  "title": "字串",
  "summary": "字串",
  "content": "完整 HTML 字串",
  "seoTitle": "字串",
  "seoDescription": "字串"
}

請遵守以下內容規則：

【title 規則】
1. 必須與主題高度相關
2. 必須像企業網站文章標題，不要太口語
3. 可自然加入「企業網站、SEO、流量、內容」等詞，但不要硬塞

【summary 規則】
1. 80 到 120 字
2. 要能快速說明這篇文章的核心重點
3. 要讓讀者知道這篇與企業網站流量、SEO 或內容策略有關

【content 規則】
1. 必須是單一 HTML 字串
2. 不能包含 <html>、<body>、<head>
3. 文章結構必須固定如下：

- 先輸出一段前言 <p>，直接回答主題問題，控制在 80~140 字
- 接著至少輸出 4 個 <h2>
- 每個 <h2> 下至少要有 1 個 <p>
- 至少有 1 個 <h2> 段落底下要包含 <ul><li> 條列整理
- 最後一定要有一個 <h2>常見問題</h2>
- FAQ 底下至少有 3 組問答，每題用 <h3>，回答用 <p>
- 最後一定要加上 CTA 區塊，格式固定如下：

<div class="article-inline-cta">
  <h3>${cta}</h3>
  <p>如果你希望把關鍵字策略、內容生成與網站轉換整合成一套流程，Aplus AI SEO 系統可協助你更有效率地建立內容獲客機制。</p>
</div>

【文章寫作規則】
1. 不要空話
2. 不要太常出現「首先、其次、最後」
3. 不要寫成新聞稿
4. 文章要有實際資訊密度
5. 主題必須維持為「${topic}」
6. 可自然融入以下概念詞：企業網站、自然流量、潛在客戶、內容策略、搜尋曝光
7. 不要輸出任何 JSON 以外的內容

【seoTitle 規則】
1. 控制在 35 字內
2. 必須與主題高度相關
3. 要像可用於搜尋結果的標題

【seoDescription 規則】
1. 控制在 120 字內
2. 要清楚描述文章價值
3. 需自然提到 SEO、內容或流量概念
`.trim();

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gemma3:4b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      format: "json",
      stream: false,
      options: {
        temperature: 0.6
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API 錯誤：${response.status}`);
  }

  const result = await response.json();
  const text = result?.message?.content?.trim();

  if (!text) {
    throw new Error("Ollama 沒有回傳內容");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Ollama 原始回傳：", text);
    throw new Error("Ollama 回傳不是有效 JSON");
  }

  if (
    !parsed.title ||
    !parsed.summary ||
    !parsed.content ||
    !parsed.seoTitle ||
    !parsed.seoDescription
  ) {
    console.error("Ollama 原始回傳：", parsed);
    throw new Error("Ollama 回傳欄位不完整");
  }

  const normalized = {
    title: String(parsed.title).trim(),
    summary: String(parsed.summary).trim(),
    content: String(parsed.content).trim(),
    seoTitle: String(parsed.seoTitle).trim(),
    seoDescription: String(parsed.seoDescription).trim()
  };

  // 基本檢查，避免模型偷懶
  if (!normalized.content.includes("<h2>")) {
    throw new Error("生成內容缺少 h2 結構");
  }

  if (!normalized.content.includes("<div class=\"article-inline-cta\">")) {
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