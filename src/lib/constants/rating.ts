export const POSITIVE_RATING_TAGS = [
  "professional",
  "reliable",
  "punctual",
  "friendly",
  "trustworthy",
] as const;

export const NEGATIVE_RATING_TAGS = [
  "unprofessional",
  "unreliable",
  "late",
  "rude",
  "untrustworthy",
] as const;

export const RATING_TAGS = [...POSITIVE_RATING_TAGS, ...NEGATIVE_RATING_TAGS] as const;
export type RatingTag = (typeof RATING_TAGS)[number];

export const RATING_TAG_LABELS: Record<RatingTag, string> = {
  professional: "Professional",
  reliable: "Reliable",
  punctual: "Punctual",
  friendly: "Friendly",
  trustworthy: "Trustworthy",
  unprofessional: "Unprofessional",
  unreliable: "Unreliable",
  late: "Late",
  rude: "Rude",
  untrustworthy: "Untrustworthy",
};
