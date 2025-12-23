
import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteMetadata } from "./types";

const provider = (import.meta.env.VITE_AI_PROVIDER || "gemini").toLowerCase();
const apiKey = import.meta.env.VITE_AI_API_KEY;
const modelOverride = import.meta.env.VITE_AI_MODEL;

const basePrompt = (url: string) => `请提取网站 ${url} 的详细元数据。
要求：
1. 所有返回内容（标题、描述、标签）必须使用简体中文（Simplified Chinese）。
2. 标题要简明扼要。
3. 描述应为一两句有帮助的概括。
4. 标签应为相关的关键词（数组）。
注意：不要返回分类（category），分类由用户选择。仅返回 JSON。`;

const stripCodeFences = (s: string) => s
  .replace(/^```\s*json\s*/i, "")
  .replace(/^```/i, "")
  .replace(/```\s*$/i, "")
  .trim();

const extractFirstJsonObject = (s: string): string | null => {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    const prev = s[i - 1];
    if (ch === '"' && prev !== '\\') inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
};

const safeParse = (text: string | null | undefined): WebsiteMetadata | null => {
  if (!text) return null;
  let raw = text.trim();
  // Remove markdown code fences like ```json ... ```
  if (raw.startsWith("```")) raw = stripCodeFences(raw);
  try {
    return JSON.parse(raw) as WebsiteMetadata;
  } catch (error) {
    // Try extracting the first JSON object from the string
    const candidate = extractFirstJsonObject(raw);
    if (candidate) {
      try {
        return JSON.parse(candidate) as WebsiteMetadata;
      } catch (err2) {
        console.error("无法解析提取的 JSON 对象:", err2, candidate);
        return null;
      }
    }
    console.error("无法解析 AI 返回的 JSON:", error, raw);
    return null;
  }
};

const fetchWithGemini = async (url: string): Promise<WebsiteMetadata | null> => {
  if (!apiKey) {
    console.error("缺少 VITE_AI_API_KEY，无法调用 Gemini。");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelOverride || "gemini-3-flash-preview",
    contents: basePrompt(url),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "tags"]
      }
    }
  });

  return safeParse(response.text);
};

const fetchWithGLM = async (url: string): Promise<WebsiteMetadata | null> => {
  if (!apiKey) {
    console.error("缺少 VITE_AI_API_KEY，无法调用 GLM。");
    return null;
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelOverride || "glm-4-flash",
      stream: false,
      messages: [
        {
          role: "system",
          content: "你是一个只返回 JSON 的助手，确保输出满足调用方的 schema。"
        },
        {
          role: "user",
          content: basePrompt(url)
        }
      ]
    })
  });

  if (!response.ok) {
    console.error("GLM 接口返回非 2xx:", response.status, await response.text());
    return null;
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  return safeParse(typeof content === "string" ? content : JSON.stringify(content));
};

export const getWebsiteMetadata = async (url: string): Promise<WebsiteMetadata | null> => {
  try {
    if (provider === "glm") {
      return await fetchWithGLM(url);
    }
    return await fetchWithGemini(url);
  } catch (error) {
    console.error("获取元数据时出错:", error);
    return null;
  }
};
