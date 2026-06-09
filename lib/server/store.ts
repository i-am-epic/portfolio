/**
 * Backend-agnostic capped-list store for shared, cross-visitor data
 * (scroll feedback wall + slot leaderboard).
 *
 * - Production: Upstash Redis via its REST API when UPSTASH_REDIS_REST_URL +
 *   UPSTASH_REDIS_REST_TOKEN are set.
 * - Local dev / no creds: a JSON file under .data/ so everything works offline.
 *
 * Stores newest-first lists of JSON strings; callers parse/serialize.
 */

import { promises as fs } from "fs"
import path from "path"

const REST_URL = process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const useRedis = Boolean(REST_URL && REST_TOKEN)

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REST_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Upstash error ${res.status}`)
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (data.error) throw new Error(data.error)
  return data.result
}

const DATA_DIR = path.join(process.cwd(), ".data")

async function localRead(key: string): Promise<string[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${key}.json`), "utf8")
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

async function localWrite(key: string, arr: string[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(path.join(DATA_DIR, `${key}.json`), JSON.stringify(arr))
}

/** Prepend a value (newest-first) and cap the list length. */
export async function appendCapped(key: string, value: string, cap: number): Promise<void> {
  if (useRedis) {
    await redis(["LPUSH", key, value])
    await redis(["LTRIM", key, 0, cap - 1])
    return
  }
  const arr = await localRead(key)
  arr.unshift(value)
  await localWrite(key, arr.slice(0, cap))
}

/** Read up to `n` newest-first values. */
export async function readList(key: string, n: number): Promise<string[]> {
  if (useRedis) {
    const r = await redis(["LRANGE", key, 0, n - 1])
    return Array.isArray(r) ? (r as string[]) : []
  }
  return (await localRead(key)).slice(0, n)
}

export const STORAGE_MODE = useRedis ? "upstash" : "local-file"
