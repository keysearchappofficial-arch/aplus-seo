async function generateWithOllama({ industry, location, topic, tone, cta }) {
  const systemPrompt = `
你是一位台灣企業內容行銷編輯。
你只能輸出 JSON，不能輸出任何說明、註解、前言、後記。
禁止輸出 markdown。
禁止輸出程式碼區塊。
禁止輸出重複欄位。
所有內容必須使用繁體中文（台灣用語）。
`.trim();

  const userPrompt = `
請根據以下資訊，產出一篇適合台灣企業官網的 SEO 文章。

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

規則：
1. title 必須與主題高度相關，不可偏題
2. summary 為 80 到 120 字
3. content 必須是單一字串，內容為 HTML
4. content 必須包含：
   - 一個開頭段落 <p>
   - 三個以上 <h2>
   - 每個 <h2> 下至少一個 <p>
5. seoTitle 長度控制在 35 字內
6. seoDescription 長度控制在 120 字內
7. 不可輸出 JSON 以外的內容
8. 不可重複欄位名稱
9. 主題必須是「${topic}」，不可改寫成其他主題
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
      stream: false
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

  return {
    title: String(parsed.title).trim(),
    summary: String(parsed.summary).trim(),
    content: String(parsed.content).trim(),
    seoTitle: String(parsed.seoTitle).trim(),
    seoDescription: String(parsed.seoDescription).trim()
  };
}

window.OllamaClient = {
  generateWithOllama
};