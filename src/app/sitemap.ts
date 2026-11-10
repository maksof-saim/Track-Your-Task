import type { MetadataRoute } from "next";

const SITE_URL = (process.env.APP_URL ?? "https://track-your-amaal.vercel.app").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
    return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}