import { createDecipheriv, pbkdf2Sync } from "crypto"
import encryptedPayload from "./profile-knowledge.encrypted.json"

export type KnowledgeChunk = {
  id: string
  text: string
  source: string
}

let _cache: KnowledgeChunk[] | null = null

function loadKnowledge(): KnowledgeChunk[] {
  if (_cache) return _cache

  const passphrase = process.env.NEXTAUTH_SECRET
  if (!passphrase) {
    console.warn("[profile-knowledge] NEXTAUTH_SECRET not set — returning empty knowledge base")
    return []
  }

  try {
    const { iterations, salt, iv, tag, data } = encryptedPayload as {
      version: string
      kdf: string
      iterations: number
      salt: string
      iv: string
      tag: string
      data: string
    }

    const key = pbkdf2Sync(passphrase, Buffer.from(salt, "base64"), iterations, 32, "sha256")
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"))
    decipher.setAuthTag(Buffer.from(tag, "base64"))

    const plain = Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()])
    _cache = JSON.parse(plain.toString("utf8")) as KnowledgeChunk[]
    return _cache
  } catch (err) {
    console.error("[profile-knowledge] Decryption failed:", err)
    return []
  }
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "is", "are", "to", "in", "of",
  "for", "with", "on", "at", "from", "me", "about",
])

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

export function retrieveRelevantChunks(query: string, limit = 5): KnowledgeChunk[] {
  const knowledge = loadKnowledge()
  const queryTokens = tokenize(query)

  const scored = knowledge.map((chunk) => {
    const chunkText = chunk.text.toLowerCase()
    const score = queryTokens.reduce((acc, token) => (chunkText.includes(token) ? acc + 1 : acc), 0)
    return { chunk, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk)
}
