import { Stars } from "@/components/ui/Stars";
import type { Rating } from "@/lib/api/ratings";
import { RATING_TAG_LABELS } from "@/lib/constants/rating";
import { formatDate } from "@/lib/format";
import styles from "./RatingRow.module.css";

export function RatingRow({ rating }: { rating: Rating }) {
  const reviewer = typeof rating.fromUserId === "string" ? "A client" : rating.fromUserId.name;

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <div className={styles.who}>
          <Stars value={rating.rating} />
          <span className={styles.reviewer}>{reviewer}</span>
        </div>
        <span className={styles.date}>{formatDate(rating.createdAt)}</span>
      </div>

      {rating.review ? <p className={styles.review}>{rating.review}</p> : null}

      {rating.tags && rating.tags.length > 0 ? (
        <div className={styles.tags}>
          {rating.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {RATING_TAG_LABELS[tag]}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
