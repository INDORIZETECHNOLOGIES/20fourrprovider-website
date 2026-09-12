"use client";

import { useMemo, useState } from "react";
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
    return Array.from(bySection.entries());
  }, [providerType]);

  function handleUploaded(documentType: string, fileUrl: string) {
    setDocuments((current) => ({ ...current, [`${documentType}Url`]: fileUrl }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Documents</h1>
        <p className={styles.subtext}>
          Upload the documents required for your account type. Verification starts once the
          required documents are in.
        </p>
        {sections.map(([section, entries]) => (
          <div key={section} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section}</h2>
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
          </div>
        ))}
      </div>
    </div>
  );
}
