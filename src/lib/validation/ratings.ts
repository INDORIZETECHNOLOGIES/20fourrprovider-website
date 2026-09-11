export function validateReview(review: string): string | null {
  if (review.trim().length > 500) return "Review must be 500 characters or fewer.";
  return null;
}
