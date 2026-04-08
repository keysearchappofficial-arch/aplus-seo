const TOPIC_STORAGE_KEY = "ai_topic_library";

function readTopics() {
  try {
    const raw = localStorage.getItem(TOPIC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("讀取題庫失敗：", error);
    return [];
  }
}

function writeTopics(topics) {
  localStorage.setItem(TOPIC_STORAGE_KEY, JSON.stringify(topics));
}

const TopicStore = {
  async getAll() {
    return readTopics();
  },

  async addMany(newTopics) {
    const current = readTopics();

    const merged = [...newTopics, ...current];

    writeTopics(merged);
    return merged;
  },

  async remove(id) {
    const current = readTopics();
    const next = current.filter(item => item.id !== id);
    writeTopics(next);
    return next;
  }
};

window.TopicStore = TopicStore;
