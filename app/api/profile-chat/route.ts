import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { retrieveRelevantChunks } from "@/lib/profile-knowledge"
import { looksLikePromptInjection, looksMalicious, niceTryNavi } from "@/lib/server/moderate"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: Request) {
  try {
    const { message, history } = (await request.json()) as {
      message?: string
      history?: ChatMessage[]
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Prompt-injection / code-injection attempts get a witty rebuff, no LLM call.
    if (looksLikePromptInjection(message) || looksMalicious(message)) {
      return NextResponse.json({ answer: niceTryNavi(), citations: [] })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in environment" },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({})
    const retrieved = retrieveRelevantChunks(message, 6)
    const contextBlock = retrieved.length
      ? retrieved
          .map((chunk, index) => `${index + 1}. [${chunk.source}] ${chunk.text}`)
          .join("\n")
      : "No direct profile context found for this question."

    const chatHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
          .join("\n")
      : ""

    const prompt = `You are NAVI — the AI assistant on Nikhil A V's portfolio.
  Use retrieved context first when relevant. Never invent achievements. If something is truly unknown, just say so.

  Personality & tone:
  - Sound like a sharp, witty 24-year-old engineer. Friendly, fast, never corporate.
  - Light humour is welcome, but don't force it.
  - Gen-Z fluent but not over-slangy.
  - Do not force tech analogies or portfolio references for normal life questions.
  - Vary examples naturally; avoid repeating the same project references unless directly relevant.

  Relevance routing rules:
  - If the question is clearly about Nikhil, his work, resume, projects, or career: answer with profile context.
  - If the question is not completely about Nikhil: start the answer with exactly this line:
    LMTLN let me think like nikhil and i found
    Then give a short, friendly, useful answer with a light funny touch.
  - Never pretend personal facts for unrelated topics.

  Formatting rules (IMPORTANT — always follow these):
  - Always respond in **Markdown**.
  - Use **bold** for names, metrics, titles, and key highlights.
  - Use ## or ### headings to separate distinct sections when answering multi-part questions.
  - Use bullet lists (- item) or numbered lists for enumerations, steps, or comparisons.
  - Use > blockquote for standout quotes or one-liner summaries.
  - Use \`inline code\` for tech names, tools, languages, and commands.
  - For score breakdowns or stat comparisons, use a markdown table.
  - Keep paragraphs short (2–4 lines max). Prefer lists over prose walls.
  - End with a one-line punchy takeaway when it fits.

  Retrieved Context:
  ${contextBlock}

  Recent Chat:
  ${chatHistory || "No prior context"}

  User Question:
  ${message}`

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    })

    return NextResponse.json({
      answer: response.text ?? "I could not generate a response.",
      citations: retrieved.map((chunk) => ({ id: chunk.id, source: chunk.source })),
    })
  } catch (error) {
    console.error("Profile chat error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
