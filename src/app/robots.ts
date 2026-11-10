import type { MetadataRoute } from "next";

const SITE_URL = (process.env.APP_URL ?? "https://track-your-amaal.vercel.app").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}