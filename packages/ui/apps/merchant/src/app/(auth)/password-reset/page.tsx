import { PasswordResetPage } from "@/features/authentication";
// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = 'force-dynamic';
import { ConfirmEmailParamsType } from "@/features/authentication/";

type Params = Promise<{ mode: string }>;
type SearchParams = Promise<ConfirmEmailParamsType>;

export default async function PasswordResetSent(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  return <PasswordResetPage {...searchParams} />;
}
