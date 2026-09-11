import type { Rating } from "@/lib/api/ratings";
import { RATING_TAG_LABELS } from "@/lib/constants/rating";
import { formatDate } from "@/lib/format";
import styles from "./RatingRow.module.css";

export function RatingRow({ rating }: { rating: Rating }) {
  const reviewer = typeof rating.fromUserId === "string" ? "A client" : rating.fromUserId.name;

  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.stars}>{"★".repeat(rating.rating)}{"☆".repeat(5 - rating.rating)}</span>
        <span className={styles.date}>{formatDate(rating.createdAt)}</span>
      </div>
      <p className={styles.reviewer}>{reviewer}</p>
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
