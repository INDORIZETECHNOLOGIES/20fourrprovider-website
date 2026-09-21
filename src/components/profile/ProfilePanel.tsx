"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { Stars } from "@/components/ui/Stars";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import { toGalleryPhotos } from "@/lib/api/gallery";
import { getProviderProfile, isProfileComplete, SERVICE_CATEGORY_LABELS, type ProviderProfile } from "@/lib/api/provider";
import { getTaxProfile, type TaxProfile } from "@/lib/api/taxProfile";
import { GALLERY_LIMIT } from "@/lib/api/gallery";
import { PROVIDER_DOCUMENT_CATALOG } from "@/lib/constants/providerDocuments";
import { BLOCKING_REASON_LABELS } from "@/lib/constants/taxProfile";
import { formatPaise } from "@/lib/format";
import styles from "./ProfilePanel.module.css";

type Todo = {
  key: string;
  title: string;
  detail: string;
  href: string;
  /** Who has to act — a provider should know when the ball is with us. */
  owner: "you" | "us";
};

function requiredDocuments(profile: ProviderProfile) {
  const required = PROVIDER_DOCUMENT_CATALOG.filter((d) => d.requiredFor[profile.providerType]);
  const uploaded = required.filter((d) => profile.documents?.[`${d.id}Url`]);
  return { required: required.length, uploaded: uploaded.length };
}

function buildTodos(profile: ProviderProfile, tax: TaxProfile | null): Todo[] {
  const todos: Todo[] = [];
  const docs = requiredDocuments(profile);

  if (profile.verificationStatus === "rejected") {
    todos.push({
      key: "docs-rejected",
      title: "Replace the documents that were rejected",
      detail: profile.verificationRejectionReason ?? "Open Documents to see which ones.",
      href: "/documents",
      owner: "you",
    });
  } else if (docs.uploaded < docs.required) {
    const missing = docs.required - docs.uploaded;
    todos.push({
      key: "docs-missing",
      title: `Upload ${missing} more required ${missing === 1 ? "document" : "documents"}`,
      detail: `${docs.uploaded} of ${docs.required} uploaded`,
      href: "/documents",
      owner: "you",
    });
  } else if (!profile.isVerified) {
    todos.push({
      key: "docs-review",
      title: "Your documents are being reviewed",
      detail: "We usually finish within 48 hours.",
      href: "/documents",
      owner: "us",
    });
  }

  const bank = profile.bankDetails;
  if (!bank || (!bank.accountNumber && !bank.verified)) {
    todos.push({
      key: "bank-add",
      title: "Add your bank account",
      detail: "Payouts can't be sent until this is done.",
      href: "/earnings",
      owner: "you",
    });
  } else if (!bank.verified) {
    todos.push({
      key: "bank-review",
      title: "Your bank account is being checked",
      detail: "We verify it before the first payout.",
      href: "/earnings",
      owner: "us",
    });
  } else if (!bank.confirmedByProvider) {
    todos.push({
      key: "bank-confirm",
      title: "Confirm your bank account",
      detail: "One tap to say the account we checked is yours.",
      href: "/earnings",
      owner: "you",
    });
  }

  if (tax && !tax.taxProfileComplete) {
    const first = tax.blockingReasons[0];
    todos.push({
      key: "tax",
      title: "Finish your tax profile",
      detail: first ? (BLOCKING_REASON_LABELS[first] ?? first.replace(/_/g, " ")) : "Some details are missing.",
      href: "/tax-profile",
      owner: "you",
    });
  }

  return todos;
}

function servicesSummary(profile: ProviderProfile): string {
  if (profile.serviceCategories.length === 0) return "No services offered yet";
  const names = profile.serviceCategories.map((c) => SERVICE_CATEGORY_LABELS[c]).join(", ");
  const rates = profile.pricing.map((p) => p.dailyRate).filter((r) => r > 0);
  if (rates.length === 0) return names;
  const low = Math.min(...rates);
  const high = Math.max(...rates);
  return `${names} · ${low === high ? formatPaise(low) : `${formatPaise(low)}–${formatPaise(high)}`} a day`;
}

function licencesSummary(profile: ProviderProfile): string {
  const state = (l: ProviderProfile["psaraLicense"]) => (l?.verified ? "verified" : l?.number ? "in review" : "not added");
  return `PSARA ${state(profile.psaraLicense)} · Weapon ${state(profile.weaponLicense)}`;
}

export function ProfilePanel({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tax, setTax] = useState<TaxProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProviderProfile(accessToken), getCurrentUser(accessToken)])
      .then(([{ profile }, { user }]) => {
        if (cancelled) return;
        // Same gate as the dashboard: no services yet means setup isn't finished.
        if (!isProfileComplete(profile)) {
          router.replace("/profile/setup");
          return;
        }
        setProfile(profile);
        setUser(user);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your profile. Try refreshing.");
      });
    // The tax summary is a nice-to-have on this page; its failure shouldn't hide the profile.
    getTaxProfile(accessToken)
      .then((result) => {
        if (!cancelled) setTax(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken, router]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{error}</Banner>
        </div>
      </div>
    );
  }

  if (!profile || !user) return null;

  const todos = buildTodos(profile, tax);
  const rejected = profile.verificationStatus === "rejected";
  const docs = requiredDocuments(profile);
  const photos = toGalleryPhotos(profile.gallery).length;
  const place = [profile.serviceCity, profile.serviceState].filter(Boolean).join(", ");

  const rows = [
    {
      href: "/profile/edit",
      title: "Your details",
      detail: [user.phone, place].filter(Boolean).join(" · ") || "Contact, location and private details",
    },
    {
      href: "/profile/public",
      title: "Public profile",
      detail: `${photos} of ${GALLERY_LIMIT} photos · ${
        profile.description ? "Bio added" : "No bio yet"
      }`,
    },
    { href: "/availability", title: "Services and rates", detail: servicesSummary(profile) },
    // Headcount by date only makes sense for an agency.
    ...(profile.providerType === "firm"
      ? [{ href: "/staff-availability", title: "Staff availability", detail: "Headcount by date, across your team" }]
      : []),
  ];

  const compliance = [
    {
      href: "/documents",
      title: "Documents",
      detail: profile.isVerified ? "Verified" : `${docs.uploaded} of ${docs.required} required uploaded`,
    },
    {
      href: "/profile/licences",
      title: "Licences",
      detail: licencesSummary(profile),
    },
    {
      href: "/tax-profile",
      title: "Tax profile",
      detail: tax ? (tax.taxProfileComplete ? "Complete" : "Needs attention") : "PAN, GST and PSARA licences",
    },
    { href: "/earnings", title: "Bank account", detail: "Where your payouts go" },
    { href: "/penalties", title: "Penalties", detail: "Charges on your account, and appeals" },
  ];

  const security = [
    { href: "/account", title: "Photo, verification and password", detail: "Sign-in, contact verification and your data" },
  ];

  const statusLine = rejected
    ? "Your documents were not approved"
    : profile.isVerified
      ? null
      : todos.some((t) => t.key.startsWith("docs") && t.owner === "us")
        ? "Your documents are in review"
        : "Finish setup to get verified";

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader title="Profile" intro="What clients see, what we hold privately, and what still needs you." />

        <div className={styles.identity}>
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatarPlaceholder} aria-hidden>
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className={styles.who}>
            <h2 className={styles.name}>
              {profile.providerType === "firm" && profile.businessName ? profile.businessName : user.name}
              <Badge tone={profile.isVerified ? "active" : "muted"}>
                {profile.isVerified ? "Verified" : "Not verified yet"}
              </Badge>
            </h2>
            <p className={styles.summary}>
              {profile.serviceCategories.length > 0
                ? `${profile.serviceCategories.map((c) => SERVICE_CATEGORY_LABELS[c]).join(", ")}${place ? ` in ${place}` : ""}`
                : "Add the services you offer to appear in search."}
            </p>
            {profile.rating.count > 0 ? (
              <div className={styles.rating}>
                <Stars value={profile.rating.average} />
                {profile.rating.average.toFixed(1)} from {profile.rating.count}{" "}
                {profile.rating.count === 1 ? "rating" : "ratings"}
              </div>
            ) : null}
          </div>
        </div>

        {todos.length > 0 ? (
          <section
            className={`${styles.attention} ${rejected ? styles.attentionRejected : ""}`}
            aria-labelledby="attention-title"
          >
            <div className={styles.attentionHead}>
              <h2 id="attention-title" className={styles.attentionTitle}>
                {statusLine ?? "Still to do"}
              </h2>
              {!profile.isVerified ? (
                <p className={styles.attentionText}>
                  Until you are verified you can&apos;t switch on availability or accept bookings. You can still
                  edit your profile, rates and tax details.
                </p>
              ) : null}
            </div>
            <ul className={styles.todo}>
              {todos.map((todo) => (
                <li key={todo.key}>
                  <Link href={todo.href} className={styles.todoLink}>
                    <span className={styles.todoText}>
                      <p className={styles.todoTitle}>{todo.title}</p>
                      <p className={styles.todoDetail}>{todo.detail}</p>
                    </span>
                    <Badge tone={todo.owner === "you" ? "action" : "muted"}>
                      {todo.owner === "you" ? "Your turn" : "With our team"}
                    </Badge>
                    <Icon name="chevron" size={18} className={styles.chevron} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className={styles.groups}>
          <HubGroup title="Your profile" rows={rows} />
          <HubGroup title="Compliance and payouts" rows={compliance} />
          <HubGroup title="Account" rows={security} />
        </div>
      </div>
    </div>
  );
}

function HubGroup({ title, rows }: { title: string; rows: { href: string; title: string; detail: string }[] }) {
  return (
    <section>
      <h2 className={styles.groupTitle}>{title}</h2>
      <RowList>
        {rows.map((row) => (
          <Link key={row.href} href={row.href} className={styles.row}>
            <span className={styles.rowText}>
              <p className={styles.rowTitle}>{row.title}</p>
              <p className={styles.rowDetail}>{row.detail}</p>
            </span>
            <Icon name="chevron" size={18} className={styles.chevron} />
          </Link>
        ))}
      </RowList>
    </section>
  );
}
