import { TermsAndConditionsPage } from "@/components/pages/terms-and-conditions-page";
// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = 'force-dynamic';

export default function TermsAndConditions() {
  return <TermsAndConditionsPage />;
}
