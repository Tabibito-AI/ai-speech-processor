import { invokeLLM } from "./_core/llm";

/**
 * Translate text using Manus LLM
 */
export async function translateWithManusLLM(
  textToTranslate: string,
  targetLanguage: string,
  previousTranslations: string[] = [],
  originalContext: string = ""
): Promise<string> {
  const promptParts: string[] = [];

  // Add original context if available
  if (originalContext) {
    promptParts.push(`Original conversation context: ${originalContext}`);
  }

  // Add previous translations for consistency
  if (previousTranslations.length > 0) {
    const context = previousTranslations.slice(-3).join(" ");
    promptParts.push(`Previous translations: ${context}`);
    promptParts.push(
      `Translate the following text into ${targetLanguage}. Ensure the translation flows smoothly from the previous context and original conversation, maintains consistency in terminology and style, and only adds necessary words or context to make it coherent and complete. Do not add any introductory or concluding phrases, just the translated text.`
    );
  } else {
    promptParts.push(
      `Translate the following text into ${targetLanguage}. Do not add any introductory or concluding phrases, just the translated text.`
    );
  }

  promptParts.push(`Text to translate: ${textToTranslate}`);

  const fullPrompt = promptParts.join("\n");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response from Manus LLM");
    }

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response format from Manus LLM");
    }

    return content.trim();
  } catch (error) {
    console.error("[LLM_ERROR] Translation failed:", error);
    throw error;
  }
}

/**
 * Generate summary using Manus LLM
 */
export async function summarizeWithManusLLM(
  transcript: string,
  summaryType: "short" | "medium" | "detailed" = "medium",
  summaryLanguage: string = "en"
): Promise<string> {
  const languageInstructions: Record<string, string> = {
    en: "Respond in English.",
    ja: "日本語で回答してください。",
    es: "Responde en español.",
    zh: "请用中文回答。",
    fr: "Répondez en français.",
    it: "Rispondi in italiano.",
    ko: "한국어로 답변해주세요.",
    ar: "أجب باللغة العربية.",
    hi: "हिंदी में उत्तर दें।",
    ru: "Отвечайте на русском языке.",
    id: "Jawab dalam bahasa Indonesia.",
  };

  const languageInstruction =
    languageInstructions[summaryLanguage] || languageInstructions["en"];

  let prompt: string;

  if (summaryType === "short") {
    prompt = `You are a professional executive assistant specializing in creating concise presentation summaries for C-level executives.

Analyze the following transcript and provide a SHORT summary in exactly 4-5 lines. Focus on the most critical points, key decisions, and actionable outcomes. Write in a professional, executive-level tone suitable for busy decision-makers who need immediate insights.

Requirements:
- Exactly 4-5 lines of text
- No bullet points, lists, or markdown formatting
- Focus on main conclusions, decisions, and next steps
- Professional business language with executive tone
- Capture the essence and business impact in minimal words
- Prioritize actionable insights and strategic implications
- ${languageInstruction}

Transcript: ${transcript}`;
  } else if (summaryType === "medium") {
    prompt = `You are a professional business analyst creating presentation summaries for corporate teams and stakeholders.

Analyze the following transcript and provide a MEDIUM-length summary that balances comprehensive coverage with readability. Structure your response to cover the main topics, key arguments, important decisions, and strategic implications.

Requirements:
- 3-4 well-structured paragraphs (150-250 words total)
- Cover main topics, key points, and strategic context
- Include important details, decisions, and action items
- Professional business writing style suitable for team sharing
- Clear logical flow from overview to specifics to conclusions
- Suitable for middle management and project teams
- ${languageInstruction}

Transcript: ${transcript}`;
  } else {
    // detailed
    prompt = `You are a professional business analyst creating comprehensive presentation summaries.

Analyze the following transcript and provide a DETAILED comprehensive summary with multiple sections:

1. Transcript Analysis (8-10 sentences): Overall structure, communication style, clarity, completeness, expertise, engagement, technical quality
2. Detailed Summary (12-15 sentences): All major points with comprehensive context, supporting details, examples, evidence, relationships between topics
3. Executive Summary (8-10 sentences): Strategic implications, key decisions, financial implications, risk factors, competitive advantages, implementation timelines
4. Main Topics (5-7 topics): Clear titles, context, key points, supporting evidence, business relevance, connections, implications
5. Key Arguments (10-12 sentences): Main arguments, evidence quality, reasoning patterns, supporting data, counterarguments, logical consistency, persuasiveness, validity
6. Conclusions (10-12 sentences): All conclusions, decisions, action items, timelines, resource requirements, responsibility assignments, success metrics, risk factors

${languageInstruction}

Transcript: ${transcript}`;
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response from Manus LLM");
    }

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response format from Manus LLM");
    }

    return content.trim();
  } catch (error) {
    console.error("[LLM_ERROR] Summarization failed:", error);
    throw error;
  }
}

