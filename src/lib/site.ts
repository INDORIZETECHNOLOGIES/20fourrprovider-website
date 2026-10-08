/**
 * The production origin. Canonicals, the sitemap and robots.txt all resolve against
 * this, so it has to match the live host exactly — a www or trailing-slash mismatch is
 * enough for Google to treat one page as two.
 */
export const SITE_URL = "https://provider.20fourr.com";

/**
 * The only pages meant to be found through search. Everything else on this site sits
 * behind sign-in or is a step in an account flow, and is noindex by default from the
 * root layout. Each page here opts back in with `robots: INDEXABLE`, and the sitemap
 * lists exactly these paths, so the two cannot drift apart.
 */
export const PUBLIC_PATHS = ["/", "/terms"] as const;

export const INDEXABLE = { index: true, follow: true } as const;
