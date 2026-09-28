import { ContractDetailPage } from "@/components/contracts/ContractDetailPage";

export default async function ContractRoute(props: PageProps<"/contracts/[contractId]">) {
  const { contractId } = await props.params;
  return <ContractDetailPage contractId={contractId} />;
}
