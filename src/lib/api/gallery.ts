import { apiRequest, apiUpload } from "./client";

// The most photos a profile can hold (`SC_210` past this).
export const GALLERY_LIMIT = 12;

export type GalleryPhoto = {
  /** The storage key — what /gallery/remove identifies an item by. */
  key: string;
  url: string;
  caption: string | null;
};

// GET /provider/profile presigns gallery urls in place and returns no key field,
// so an existing photo's key is read back out of its URL path. The upload
// endpoint does return the real key, so a photo added this session never goes
// through here.
export function storageKeyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    // Virtual-hosted style: https://bucket.s3.region.amazonaws.com/<key>?X-Amz-…
    return decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "") || null;
  } catch {
    // Not an absolute URL — already a bare key.
    return url.replace(/^\/+/, "") || null;
  }
}

/** Drops entries whose URL failed to presign; they can be neither shown nor removed. */
export function toGalleryPhotos(
  items: { url: string; type: "photo" | "video"; caption?: string | null }[] | undefined,
): GalleryPhoto[] {
  return (items ?? []).flatMap((item) => {
    if (item.type !== "photo") return [];
    const key = storageKeyFromUrl(item.url);
    if (!key || !item.url) return [];
    return [{ key, url: item.url, caption: item.caption ?? null }];
  });
}

export async function addGalleryPhoto(
  file: File,
  caption: string,
  accessToken: string,
): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("type", "photo");
  if (caption.trim()) formData.set("caption", caption.trim());

  const { item } = await apiUpload<{
    item: { key: string; url: string; caption?: string | null };
  }>("/provider/gallery", formData, accessToken);

  return { key: item.key, url: item.url, caption: item.caption ?? null };
}

export function removeGalleryPhoto(key: string, accessToken: string): Promise<{ removed: string }> {
  return apiRequest("/provider/gallery/remove", {
    method: "POST",
    body: { url: key },
    accessToken,
  });
}
