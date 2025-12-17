// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = "force-dynamic";

export default function Home() {
  // This page should never render because middleware handles redirects
  // Return a loading state to prevent hydration issues
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}
