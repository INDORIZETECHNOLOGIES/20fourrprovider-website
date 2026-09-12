"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowList } from "@/components/ui/RowList";
import { PROVIDER_DOCUMENT_CATALOG } from "@/lib/constants/providerDocuments";
import type { ProviderType } from "@/lib/api/provider";
import { DocumentRow } from "./DocumentRow";
import styles from "./DocumentChecklist.module.css";

type DocumentChecklistProps = {
  providerType: ProviderType;
  initialDocuments: Record<string, string | undefined>;
  accessToken: string;
};

export function DocumentChecklist({ providerType, initialDocuments, accessToken }: DocumentChecklistProps) {
  const [documents, setDocuments] = useState(initialDocuments);

  const sections = useMemo(() => {
    const bySection = new Map<string, typeof PROVIDER_DOCUMENT_CATALOG>();
    for (const entry of PROVIDER_DOCUMENT_CATALOG) {
      if (!entry.appliesTo.includes(providerType)) continue;
      const existing = bySection.get(entry.section);
      if (existing) {
        existing.push(entry);
      } else {
        bySection.set(entry.section, [entry]);
      }
    }
    // Required documents first inside each section — they're what verification
    // waits on, and they were previously mixed in with the optional ones.
    return Array.from(bySection.entries()).map(
      ([section, entries]) =>
        [
          section,
          [...entries].sort(
            (a, b) => Number(Boolean(b.requiredFor[providerType])) - Number(Boolean(a.requiredFor[providerType])),
          ),
        ] as const,
    );
  }, [providerType]);

  const required = useMemo(
    () => PROVIDER_DOCUMENT_CATALOG.filter((entry) => entry.requiredFor[providerType]),
    [providerType],
  );
  const uploadedRequired = required.filter((entry) => documents[`${entry.id}Url`]).length;
  const allRequiredIn = uploadedRequired === required.length;

  function handleUploaded(documentType: string, fileUrl: string) {
    setDocuments((current) => ({ ...current, [`${documentType}Url`]: fileUrl }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Documents"
          intro="Upload the documents required for your account type. Verification starts once every required document is in."
        />

        {/* What verification is actually waiting on, stated once at the top
            rather than left for the provider to count down the page. */}
        <div className={styles.progress}>
          <p className={styles.progressCount}>
            {uploadedRequired} of {required.length}
          </p>
          <p className={styles.progressNote}>
            {allRequiredIn
              ? "All required documents uploaded. Our team reviews them and updates your verification status."
              : `required documents uploaded. ${required.length - uploadedRequired} still to go before verification can start.`}
          </p>
        </div>

        {sections.map(([section, entries]) => (
          <section key={section} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section}</h2>
            <RowList>
              {entries.map((entry) => (
                <DocumentRow
                  key={entry.id}
                  entry={entry}
                  required={Boolean(entry.requiredFor[providerType])}
                  currentUrl={documents[`${entry.id}Url`]}
                  accessToken={accessToken}
                  onUploaded={handleUploaded}
                />
              ))}
            </RowList>
          </section>
        ))}
      </div>
    </div>
  );
}
