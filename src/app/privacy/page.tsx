import { redirect } from "next/navigation";

// Privacy Policy content is combined with Terms of Service on a single page.
// Deep-link directly to the Privacy section.
export default function PrivacyPage() {
  redirect("/terms#privacy");
}
