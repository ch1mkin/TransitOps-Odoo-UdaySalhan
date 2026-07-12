import { MobileDriverProofUpload } from "@/components/drivers/mobile-driver-proof-upload";
import { getDriverProofSessionByToken } from "@/lib/fleet/driver-document-actions";

export default async function DriverProofUploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getDriverProofSessionByToken(token);

  if (!session.valid || !session.documentType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold">Upload link unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.error ?? "This QR link is invalid or has expired. Generate a new QR code on desktop."}
          </p>
        </div>
      </div>
    );
  }

  return <MobileDriverProofUpload token={token} documentType={session.documentType} />;
}
