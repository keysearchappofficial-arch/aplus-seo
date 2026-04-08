const TOPIC_API = "http://localhost:3000/api/topics/generate";

async function generateTopicsWithAI({ industry, location, count = 10 }) {
  const response = await fetch(TOPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      industry,
      location,
      count
    })
  });

  if (!response.ok) {
    let message = `主題生成失敗：${response.status}`;

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
  return Array.isArray(parsed.topics) ? parsed.topics : [];
}

window.TopicClient = {
  generateTopicsWithAI
};
