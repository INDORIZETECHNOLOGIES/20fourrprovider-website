import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Without this file Cloudflare serves its managed robots.txt — content-signal comments
 * with no Sitemap line. Account pages are not disallowed here on purpose: they carry a
 * noindex tag, and a crawler blocked by robots.txt never gets to read that tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
