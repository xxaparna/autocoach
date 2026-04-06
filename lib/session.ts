import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"

const COOKIE_NAME = "ac_session"
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function sign(value: string, secret: string) {
  const mac = createHmac("sha256", secret).update(value).digest("base64url")
  return `${value}.${mac}`
}

function unsign(signed: string, secret: string) {
  const i = signed.lastIndexOf(".")
  if (i === -1) return null
  const value = signed.slice(0, i)
  const mac = signed.slice(i + 1)
  const expected = createHmac("sha256", secret).update(value).digest()
  const got = Buffer.from(mac, "base64url")
  if (expected.length !== got.length) return null
  if (!timingSafeEqual(expected, got)) return null
  return value
}

export function createSessionCookie(payload: { uid: string; email: string }, maxAge = DEFAULT_MAX_AGE) {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET is not set")
  const data = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + maxAge })
  const signed = sign(Buffer.from(data).toString("base64url"), secret)
  return {
    name: COOKIE_NAME,
    value: signed,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    },
  }
}

export async function setSession(payload: { uid: string; email: string }) {
  const cookie = createSessionCookie(payload)
  cookies().set(cookie.name, cookie.value, cookie.options)
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 })
}

export function getSession(): { uid: string; email: string } | null {
  const secret = process.env.SESSION_SECRET
  if (!secret) return null
  const c = cookies().get(COOKIE_NAME)
  if (!c?.value) return null
  const raw = unsign(c.value, secret)
  if (!raw) return null
  try {
    const json = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) return null
    return { uid: json.uid, email: json.email }
  } catch {
    return null
  }
}
