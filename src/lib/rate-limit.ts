import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

function createLimiter(prefix: string, requests: number, window: Window) {
    if (!redis) return null;
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix: `rl:${prefix}`,
    });
}

const limiters = {
    loginIp: createLimiter("login-ip", 30, "10 m"),
    loginEmail: createLimiter("login-email", 8, "10 m"),
    registerIp: createLimiter("register-ip", 10, "1 h"),
    forgotIp: createLimiter("forgot-ip", 10, "1 h"),
    forgotEmail: createLimiter("forgot-email", 3, "1 h"),
} as const;

export type LimiterName = keyof typeof limiters;

/** Returns true when the request is allowed. Fails open if Redis is missing or errors. */
export async function allowRequest(name: LimiterName, key: string): Promise<boolean> {
    const limiter = limiters[name];
    if (!limiter) return true;
    try {
        const { success } = await limiter.limit(key);
        return success;
    } catch (error) {
        console.error("Rate limit check failed", error);
        return true;
    }
}

export function getClientIp(headers: Headers | undefined): string {
    const forwarded = headers?.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || headers?.get("x-real-ip") || "unknown";
}

/** Stores only an anonymous hash of an IP or email, never the raw value. */
export function hashKey(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 32);
}