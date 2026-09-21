"use client";

import { useRef, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import {
  GALLERY_LIMIT,
  addGalleryPhoto,
  removeGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/api/gallery";
import { ApiError } from "@/lib/api/client";
import { Icon } from "@/components/ui/Icon";
import styles from "./GallerySection.module.css";
import formStyles from "./ProfileForms.module.css";

// Unlike the rest of the public profile, photos save the moment they're added or
// removed — there's no Save button for this section.
export function GallerySection({
  initial,
  accessToken,
}: {
  initial: GalleryPhoto[];
  accessToken: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initial);
  const [busy, setBusy] = useState<"add" | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const full = photos.length >= GALLERY_LIMIT;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WebP).");
      return;
    }

    setError(null);
    setBusy("add");
    try {
      const photo = await addGalleryPhoto(file, "", accessToken);
      setPhotos((current) => [...current, photo]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload that photo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove(photo: GalleryPhoto) {
    setError(null);
    setBusy(photo.key);
    try {
      await removeGalleryPhoto(photo.key, accessToken);
      setPhotos((current) => current.filter((p) => p.key !== photo.key));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove that photo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={formStyles.section} aria-labelledby="gallery-title">
      <span className={formStyles.audience}>Shown to clients</span>
      <h2 id="gallery-title" className={formStyles.sectionTitle}>
        Photos
      </h2>
      <p className={formStyles.sectionText}>
        Uniformed, well-lit photos of you or your team on duty build trust. Photos save as you add them.
      </p>

      {error ? <Banner>{error}</Banner> : null}

      <ul className={styles.grid}>
        {photos.map((photo) => (
          <li key={photo.key} className={styles.item}>
            <img src={photo.url} alt={photo.caption ?? "Gallery photo"} className={styles.image} />
            <button
              type="button"
              className={styles.remove}
              aria-label="Remove photo"
              disabled={busy !== null}
              onClick={() => handleRemove(photo)}
            >
              {busy === photo.key ? "…" : <Icon name="close" size={16} />}
            </button>
          </li>
        ))}

        {!full ? (
          <li className={styles.item}>
            <button
              type="button"
              className={styles.add}
              disabled={busy !== null}
              onClick={() => inputRef.current?.click()}
            >
              {busy === "add" ? "Uploading…" : photos.length === 0 ? "Add your first photo" : "Add photo"}
            </button>
          </li>
        ) : null}
      </ul>

      <p className={styles.count}>
        {photos.length} of {GALLERY_LIMIT} photos
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
        aria-label="Choose a photo to add"
      />
    </section>
  );
}
