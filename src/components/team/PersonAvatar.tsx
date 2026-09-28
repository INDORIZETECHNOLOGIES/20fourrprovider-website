/* eslint-disable @next/next/no-img-element -- presigned S3 URLs that expire in five minutes; next/image would cache them past that. */
import { initials } from "@/lib/team";
import styles from "./Team.module.css";

export function PersonAvatar({ name, photoUrl, size = 44 }: { name: string; photoUrl: string | null; size?: number }) {
  return photoUrl ? (
    <img src={photoUrl} alt="" className={styles.avatar} style={{ width: size, height: size }} />
  ) : (
    <span className={`${styles.avatar} ${styles.avatarInitials}`} style={{ width: size, height: size }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
