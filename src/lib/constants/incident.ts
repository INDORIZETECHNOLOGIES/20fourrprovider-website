export const INCIDENT_CATEGORIES = [
  "safety_threat",
  "theft",
  "property_damage",
  "medical_emergency",
  "misconduct",
  "no_show",
  "equipment_failure",
  "other",
] as const;
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  safety_threat: "Safety threat",
  theft: "Theft",
  property_damage: "Property damage",
  medical_emergency: "Medical emergency",
  misconduct: "Misconduct",
  no_show: "No-show",
  equipment_failure: "Equipment failure",
  other: "Other",
};

export const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  under_review: "Under review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};
