const productData = {
  "ue-virtual": {
    category: {
      "zh-TW": "Virtual Production",
      "en": "Virtual Production"
    },
    name: "UE Virtual",
    summary: {
      "zh-TW": "虛擬攝影棚與即時場景引擎，結合綠幕製播、虛擬背景與節目視覺設計，提升內容呈現層次。",
      "en": "A virtual studio and real-time scene engine that combines green screen production, virtual backgrounds, and program visual design to elevate content presentation."
    },
    highlights: {
      "zh-TW": ["虛擬場景", "即時合成", "綠幕製播", "多場景切換"],
      "en": ["Virtual Scenes", "Real-Time Compositing", "Green Screen Production", "Multi-Scene Switching"]
    },
    features: [
      {
        title: { "zh-TW": "即時虛擬場景", "en": "Real-Time Virtual Scenes" },
        desc: { "zh-TW": "支援虛擬背景與節目場景設計，提升畫面層次與內容質感。", "en": "Supports virtual backgrounds and program scene design to enhance visual depth and content quality." }
      },
      {
        title: { "zh-TW": "綠幕合成流程", "en": "Green Screen Compositing Workflow" },
        desc: { "zh-TW": "可搭配綠幕製播環境，建立穩定的虛擬製作流程。", "en": "Works with green screen production environments to build a stable virtual production workflow." }
      },
      {
        title: { "zh-TW": "多場景切換", "en": "Multi-Scene Switching" },
        desc: { "zh-TW": "依節目段落、品牌內容或活動主題切換不同場景。", "en": "Switch between scenes according to show segments, branded content, or event themes." }
      },
      {
        title: { "zh-TW": "與其他模組整合", "en": "Integration with Other Modules" },
        desc: { "zh-TW": "可配合 U-Show、U-CG、U-TP 與其他設備整體運作。", "en": "Integrates with U-Show, U-CG, U-TP, and other devices as part of a complete workflow." }
      }
    ],
    useCases: {
      "zh-TW": ["虛擬訪談節目", "企業品牌節目", "線上課程錄製", "活動主視覺場景製播"],
      "en": ["Virtual interview programs", "Corporate branded shows", "Online course recording", "Event visual scene production"]
    },
    integration: {
      "zh-TW": [
        "可搭配 U-Show 作為節目控制與輸出核心",
        "可整合 U-CG 建立圖文與字幕包裝",
        "可配合攝影機系統與綠幕環境使用",
        "可與錄製、直播流程結合"
      ],
      "en": [
        "Can work with U-Show as the show control and output core",
        "Can integrate with U-CG for graphics and lower-third packaging",
        "Can be used with camera systems and green screen environments",
        "Can be combined with recording and streaming workflows"
      ]
    },
    values: {
      "zh-TW": [
        "提升節目與品牌內容的視覺專業度",
        "讓內容製作更具彈性與延伸性",
        "適合建立可重複使用的虛擬製播場景"
      ],
      "en": [
        "Enhances the visual professionalism of programs and branded content",
        "Makes content production more flexible and extensible",
        "Ideal for building reusable virtual production scenes"
      ]
    },
    related: ["u-show", "u-cg", "u-tp"]
  },

  "u-show": {
    category: {
      "zh-TW": "Show Control",
      "en": "Show Control"
    },
    name: "U-Show",
    summary: {
      "zh-TW": "節目播出與導播控制核心，用於節目流程控制、多機切換與整體製播操作管理。",
      "en": "The core of show playout and control, designed for workflow management, multi-camera switching, and overall production operation."
    },
    highlights: {
      "zh-TW": ["導播控制", "節目流程", "多機切換", "輸出管理"],
      "en": ["Show Control", "Program Workflow", "Multi-Camera Switching", "Output Management"]
    },
    features: [
      {
        title: { "zh-TW": "節目流程控制", "en": "Program Workflow Control" },
        desc: { "zh-TW": "協助管理節目段落、畫面切換與整體播出節奏。", "en": "Helps manage show segments, visual switching, and overall playout pacing." }
      },
      {
        title: { "zh-TW": "多機位切換", "en": "Multi-Camera Switching" },
        desc: { "zh-TW": "適合訪談、論壇、課程與品牌節目等多鏡位內容型態。", "en": "Suitable for interviews, forums, courses, and branded shows with multiple camera angles." }
      },
      {
        title: { "zh-TW": "輸出管理", "en": "Output Management" },
        desc: { "zh-TW": "支援錄製、直播或其他節目輸出流程安排。", "en": "Supports recording, live streaming, and other output workflow arrangements." }
      },
      {
        title: { "zh-TW": "整合性操作", "en": "Integrated Operation" },
        desc: { "zh-TW": "可與 UE Virtual、U-CG、U-TP 等模組形成完整播出流程。", "en": "Works with UE Virtual, U-CG, U-TP, and other modules as part of a complete show workflow." }
      }
    ],
    useCases: {
      "zh-TW": ["企業直播節目", "論壇與對談內容", "多機位節目錄製", "品牌發表與活動播出"],
      "en": ["Corporate live programs", "Forum and panel content", "Multi-camera show recording", "Brand launches and event playout"]
    },
    integration: {
      "zh-TW": [
        "可整合 video mixer 與外部導播流程",
        "可與 U-CG 結合進行字幕圖層控制",
        "可串接錄製與串流輸出系統",
        "可整合 intercom 與現場導播協作"
      ],
      "en": [
        "Can integrate with video mixers and external directing workflows",
        "Can work with U-CG for graphics layer control",
        "Can connect with recording and streaming output systems",
        "Can integrate with intercom systems for on-site directing collaboration"
      ]
    },
    values: {
      "zh-TW": [
        "提升節目控制效率與畫面節奏管理能力",
        "讓多機位內容製作更穩定",
        "適合建立專業節目播出流程"
      ],
      "en": [
        "Improves production control efficiency and visual pacing management",
        "Makes multi-camera production more stable",
        "Suitable for building professional show playout workflows"
      ]
    },
    related: ["ue-virtual", "u-cg", "u-tp"]
  },

  "u-cg": {
    category: {
      "zh-TW": "Graphics",
      "en": "Graphics"
    },
    name: "U-CG",
    summary: {
      "zh-TW": "字幕與圖文包裝系統，支援標題、資訊條、比分板與各種節目視覺資訊呈現。",
      "en": "A graphics and packaging system that supports titles, info bars, scoreboards, and various visual information displays."
    },
    highlights: {
      "zh-TW": ["字幕條", "圖文包裝", "資訊圖層", "視覺強化"],
      "en": ["Lower Thirds", "Graphics Packaging", "Info Layers", "Visual Enhancement"]
    },
    features: [
      {
        title: { "zh-TW": "標題與資訊條", "en": "Titles and Info Bars" },
        desc: { "zh-TW": "支援節目標題、人名條與資訊條等常見節目圖文元素。", "en": "Supports common program graphics such as titles, name straps, and info bars." }
      },
      {
        title: { "zh-TW": "比分板與動態資訊", "en": "Scoreboards and Dynamic Information" },
        desc: { "zh-TW": "適合體育、活動或各種即時資訊型內容。", "en": "Suitable for sports, events, and various real-time information scenarios." }
      },
      {
        title: { "zh-TW": "視覺層管理", "en": "Visual Layer Management" },
        desc: { "zh-TW": "可配合節目風格建立更完整的畫面包裝架構。", "en": "Builds more complete on-screen packaging structures aligned with the style of the program." }
      },
      {
        title: { "zh-TW": "搭配播出流程", "en": "Playback Workflow Integration" },
        desc: { "zh-TW": "可與 U-Show 或其他播出系統同步使用。", "en": "Can be used together with U-Show or other playout systems." }
      }
    ],
    useCases: {
      "zh-TW": ["節目字幕包裝", "企業直播資訊條", "體育比分板", "論壇與講者資訊呈現"],
      "en": ["Program lower-third packaging", "Corporate live stream info bars", "Sports scoreboards", "Forum and speaker information display"]
    },
    integration: {
      "zh-TW": [
        "可與 U-Show 配合進行節目播出控制",
        "可與資料輸入來源或節目腳本流程結合",
        "可整合多機位與直播輸出流程",
        "可依品牌需求客製視覺樣式"
      ],
      "en": [
        "Can work with U-Show for show playout control",
        "Can integrate with data input sources or script workflows",
        "Can support multi-camera and live output workflows",
        "Can be customized to match brand visual styles"
      ]
    },
    values: {
      "zh-TW": [
        "提升節目資訊清晰度與視覺專業感",
        "讓直播與錄製內容更完整",
        "適合建立一致的品牌畫面包裝"
      ],
      "en": [
        "Improves information clarity and visual professionalism",
        "Makes live and recorded content more complete",
        "Ideal for building consistent brand visual packaging"
      ]
    },
    related: ["u-show", "ue-virtual", "u-hub"]
  },

  "u-tp": {
    category: {
      "zh-TW": "Teleprompter",
      "en": "Teleprompter"
    },
    name: "U-TP",
    summary: {
      "zh-TW": "專業提詞系統，協助主持人、講者與來賓穩定完成口播、課程與演講型內容。",
      "en": "A professional teleprompter system that helps hosts, presenters, and guests deliver speech-based content, courses, and presentation-style material more steadily."
    },
    highlights: {
      "zh-TW": ["提詞顯示", "講者支援", "遠端控制", "節目同步"],
      "en": ["Prompt Display", "Presenter Support", "Remote Control", "Program Sync"]
    },
    features: [
      {
        title: { "zh-TW": "穩定提詞顯示", "en": "Stable Prompt Display" },
        desc: { "zh-TW": "讓講者更自然完成長段口播與簡報型內容。", "en": "Helps presenters deliver long-form spoken and presentation-based content more naturally." }
      },
      {
        title: { "zh-TW": "流程配合度高", "en": "High Workflow Compatibility" },
        desc: { "zh-TW": "可與節目節奏、講稿內容與播出流程搭配。", "en": "Works smoothly with show pacing, scripts, and playout workflows." }
      },
      {
        title: { "zh-TW": "適用多種口播情境", "en": "Suitable for Various Speech Scenarios" },
        desc: { "zh-TW": "適合直播、課程、企業簡報與正式演講錄製。", "en": "Suitable for live streams, courses, corporate presentations, and formal speech recording." }
      },
      {
        title: { "zh-TW": "降低失誤", "en": "Reduce Delivery Errors" },
        desc: { "zh-TW": "協助內容輸出更穩定，減少講者停頓與忘詞風險。", "en": "Improves stability in content delivery and reduces pauses or missed lines." }
      }
    ],
    useCases: {
      "zh-TW": ["企業簡報錄製", "線上課程講師拍攝", "品牌口播內容", "節目主持串場"],
      "en": ["Corporate presentation recording", "Online course instructor shoots", "Branded speech content", "Host transitions in programs"]
    },
    integration: {
      "zh-TW": [
        "可與 U-Show 導播流程配合",
        "可與攝影機與講者位置配置同步規劃",
        "可配合課程錄製與直播內容製作",
        "可與節目腳本與內容流程整合"
      ],
      "en": [
        "Can work with U-Show directing workflows",
        "Can be planned together with camera setups and presenter positioning",
        "Can support course recording and live content production",
        "Can be integrated with scripts and content workflows"
      ]
    },
    values: {
      "zh-TW": [
        "讓口播內容更穩定、更自然",
        "提升講者在鏡頭前的表現",
        "適合建立可重複執行的教學與簡報流程"
      ],
      "en": [
        "Makes spoken content more stable and natural",
        "Improves presenter performance on camera",
        "Suitable for building repeatable teaching and presentation workflows"
      ]
    },
    related: ["u-show", "ue-virtual", "u-gemini"]
  },

  "u-hub": {
    category: {
      "zh-TW": "Signal Converter",
      "en": "Signal Converter"
    },
    name: "U-Hub",
    summary: {
      "zh-TW": "三向訊號轉換器，用於不同訊號格式之間的轉換與整合，提升整體系統相容性與穩定性。",
      "en": "A three-way signal converter used for conversion and integration between different signal formats, improving overall system compatibility and stability."
    },
    highlights: {
      "zh-TW": ["三向訊號轉換", "設備整合", "路徑穩定", "相容性提升"],
      "en": ["Three-Way Signal Conversion", "Device Integration", "Stable Routing", "Compatibility Upgrade"]
    },
    features: [
      {
        title: { "zh-TW": "三向訊號轉換", "en": "Three-Way Signal Conversion" },
        desc: { "zh-TW": "支援不同訊號類型之間的轉換，讓設備連接更靈活。", "en": "Supports conversion between different signal types, enabling more flexible device connectivity." }
      },
      {
        title: { "zh-TW": "整合多種設備", "en": "Multi-Device Integration" },
        desc: { "zh-TW": "適合作為系統整合中的關鍵橋接模組。", "en": "Ideal as a key bridging module in system integration projects." }
      },
      {
        title: { "zh-TW": "提升穩定度", "en": "Improved Stability" },
        desc: { "zh-TW": "在不同設備環境中維持較高的連接一致性與可靠性。", "en": "Maintains higher consistency and reliability across different equipment environments." }
      },
      {
        title: { "zh-TW": "降低整合複雜度", "en": "Lower Integration Complexity" },
        desc: { "zh-TW": "簡化訊號路徑與設備相容上的調整成本。", "en": "Reduces adjustment costs related to signal routing and device compatibility." }
      }
    ],
    useCases: {
      "zh-TW": ["多設備訊號整合", "廣播級系統串接", "棚內拍攝環境配置", "直播與錄製系統橋接"],
      "en": ["Multi-device signal integration", "Broadcast-grade system bridging", "Studio production environment setup", "Live and recording system bridging"]
    },
    integration: {
      "zh-TW": [
        "可整合攝影機、導播系統與錄製設備",
        "可串接 video mixer、monitor 與輸出系統",
        "可作為虛擬製播流程中的訊號橋接中心",
        "可提升整套系統的可維護性"
      ],
      "en": [
        "Can integrate cameras, directing systems, and recording equipment",
        "Can connect video mixers, monitors, and output systems",
        "Can serve as the signal bridge center of a virtual production workflow",
        "Improves the maintainability of the overall system"
      ]
    },
    values: {
      "zh-TW": [
        "讓整合案更穩定、可控",
        "降低不同設備之間的連接障礙",
        "適合作為系統整合核心橋梁"
      ],
      "en": [
        "Makes integration projects more stable and controllable",
        "Reduces connection barriers between different devices",
        "Serves as a strong core bridge in system integration"
      ]
    },
    related: ["ue-virtual", "u-show", "u-cg"]
  },

  "u-gemini": {
    category: {
      "zh-TW": "Digital Human",
      "en": "Digital Human"
    },
    name: "U-Gemini",
    summary: {
      "zh-TW": "數字人系統，支援 AI 口播內容、虛擬人物應用與內容自動化延伸，擴大內容生產能力。",
      "en": "A digital human system that supports AI speech content, virtual character applications, and automated content extension to expand content production capacity."
    },
    highlights: {
      "zh-TW": ["數字人口播", "AI 內容", "虛擬人物", "內容自動化"],
      "en": ["Digital Human Speech", "AI Content", "Virtual Characters", "Content Automation"]
    },
    features: [
      {
        title: { "zh-TW": "數字人口播", "en": "Digital Human Speech" },
        desc: { "zh-TW": "以數字人形式產出穩定的口播型內容。", "en": "Produces consistent speech-based content through digital human delivery." }
      },
      {
        title: { "zh-TW": "內容自動化延伸", "en": "Automated Content Extension" },
        desc: { "zh-TW": "適合長期內容輸出需求，提升內容產能。", "en": "Ideal for long-term content output needs and improved production capacity." }
      },
      {
        title: { "zh-TW": "品牌虛擬人物應用", "en": "Branded Virtual Character Applications" },
        desc: { "zh-TW": "可用於品牌角色、講解型內容與固定內容模板。", "en": "Can be used for brand characters, explainer content, and repeatable content templates." }
      },
      {
        title: { "zh-TW": "與製播流程協作", "en": "Collaboration with Production Workflows" },
        desc: { "zh-TW": "可與現有拍攝、腳本與節目規劃流程結合。", "en": "Can integrate with existing shooting, scripting, and program planning workflows." }
      }
    ],
    useCases: {
      "zh-TW": ["AI 口播內容", "品牌數字人角色", "自動化資訊型影片", "教學與簡報延伸內容"],
      "en": ["AI speech content", "Branded digital human characters", "Automated information videos", "Extended teaching and presentation content"]
    },
    integration: {
      "zh-TW": [
        "可搭配 U-TP 與口播腳本流程",
        "可結合既有影片製作與內容編排",
        "可與品牌形象、虛擬人物策略整合",
        "可做為虛擬製播之外的內容延伸模組"
      ],
      "en": [
        "Can work with U-TP and speech script workflows",
        "Can integrate with existing video production and content arrangement",
        "Can align with brand identity and virtual character strategies",
        "Can serve as an extended module beyond virtual production"
      ]
    },
    values: {
      "zh-TW": [
        "大幅提升內容輸出效率",
        "適合建立長期、可規模化的內容產能",
        "讓品牌擁有更多 AI 內容應用可能"
      ],
      "en": [
        "Significantly improves content output efficiency",
        "Suitable for building long-term and scalable content capacity",
        "Gives brands more possibilities for AI content applications"
      ]
    },
    related: ["ue-virtual", "u-tp", "u-show"]
  }
};

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "ue-virtual";
}

function el(id) {
  return document.getElementById(id);
}

function t(value, lang) {
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && value !== null) return value[lang] || value["zh-TW"] || value["en"];
  return value;
}

function renderProductDetail() {
  const id = getProductId();
  const data = productData[id] || productData["ue-virtual"];
  const lang = window.getCurrentLang ? window.getCurrentLang() : "zh-TW";

  document.title =
    lang === "en"
      ? `${data.name} | Product Detail | VStudio`
      : `${data.name}｜產品詳情｜VStudio`;

  el("productCategory").textContent = t(data.category, lang);
  el("productName").textContent = data.name;
  el("productSummary").textContent = t(data.summary, lang);

  const visual = el("productVisual");
  if (visual) {
    visual.className = "product-detail-hero__media";
    visual.innerHTML = `
      <img
        src="./assets/images/products/${id}-detail.jpg"
        alt="${data.name}"
        loading="lazy"
        onerror="this.onerror=null;this.src='./assets/images/products/${id}-cover.jpg';"
      />
    `;
  }

  const highlightWrap = el("productHighlights");
  if (highlightWrap) {
    highlightWrap.innerHTML = t(data.highlights, lang)
      .map((item) => `<span class="product-highlight">${item}</span>`)
      .join("");
  }

  const featureWrap = el("productFeatures");
  if (featureWrap) {
    featureWrap.innerHTML = data.features
      .map(
        (item) => `
          <article class="feature-card">
            <h3>${t(item.title, lang)}</h3>
            <p>${t(item.desc, lang)}</p>
          </article>
        `
      )
      .join("");
  }

  const useCasesWrap = el("productUseCases");
  if (useCasesWrap) {
    useCasesWrap.innerHTML = t(data.useCases, lang)
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  const integrationWrap = el("productIntegration");
  if (integrationWrap) {
    integrationWrap.innerHTML = t(data.integration, lang)
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  const valuesWrap = el("productValues");
  if (valuesWrap) {
    valuesWrap.innerHTML = t(data.values, lang)
      .map(
        (item, index) => `
          <article class="timeline__item">
            <span class="timeline__step">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>${lang === "en" ? `${data.name} Value` : `${data.name} 的價值`}</h3>
              <p>${item}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  const relatedWrap = el("relatedProducts");
  if (relatedWrap) {
    relatedWrap.innerHTML = data.related
      .map((key) => {
        const p = productData[key];
        return `
          <a class="related-product-card" href="./product-detail.html?id=${key}">
            <span class="related-product-card__category">${t(p.category, lang)}</span>
            <h3>${p.name}</h3>
            <p>${t(p.summary, lang)}</p>
            <span class="related-product-card__link">${lang === "en" ? "View Details" : "查看詳情"}</span>
          </a>
        `;
      })
      .join("");
  }

  const ctaTitle = el("ctaTitle");
  if (ctaTitle) {
    ctaTitle.textContent =
      lang === "en"
        ? `Want to integrate ${data.name} into your project?`
        : `想了解 ${data.name} 如何整合到你的專案？`;
  }

  const ctaText = el("ctaText");
  if (ctaText) {
    ctaText.textContent =
      lang === "en"
        ? `Contact us and we can recommend a more suitable configuration based on the features of ${data.name} and your actual project requirements.`
        : `歡迎與我們聯繫，我們可依 ${data.name} 的功能特性與你的實際需求，提供更合適的配置建議。`;
  }
}

window.renderProductDetail = renderProductDetail;

if (window.location.pathname.includes("product-detail.html")) {
  renderProductDetail();
}