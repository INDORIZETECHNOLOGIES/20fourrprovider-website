"use client";

import { useRef, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { updateProfilePhoto, type AuthUser } from "@/lib/api/auth";
import styles from "./ProfilePhotoSection.module.css";
import panelStyles from "./AccountPanel.module.css";

export function ProfilePhotoSection({
  user,
  accessToken,
  onUpdated,
}: {
  user: AuthUser;
  accessToken: string;
  onUpdated: (photo: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const result = await updateProfilePhoto(file, accessToken);
      onUpdated(result.profilePhoto);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload your photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={panelStyles.section}>
      <h2 className={panelStyles.sectionTitle}>Profile photo</h2>
      <p className={panelStyles.sectionText}>Shown to clients once your booking is confirmed.</p>

      {error ? <Banner>{error}</Banner> : null}

      <div className={styles.row}>
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt="Your profile photo" className={styles.avatar} />
        ) : (
          <span className={styles.avatarPlaceholder}>{user.name.charAt(0).toUpperCase()}</span>
        )}
        <button
          type="button"
          className={styles.uploadButton}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : user.profilePhoto ? "Change photo" : "Upload photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
