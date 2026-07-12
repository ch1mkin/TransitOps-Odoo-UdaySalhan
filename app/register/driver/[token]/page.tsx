import { DriverSelfRegistrationForm } from "@/components/drivers/driver-self-registration-form";
import { getDriverRegistrationInviteByToken } from "@/lib/fleet/driver-registration-actions";

export default async function DriverRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getDriverRegistrationInviteByToken(token);

  if (!invite.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/80 px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card/90 p-6 text-center backdrop-blur-md">
          <h1 className="text-lg font-semibold">Registration link unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invite.error ??
              "This registration link is invalid or has expired. Ask your operator for a new link."}
          </p>
        </div>
      </div>
    );
  }

  return <DriverSelfRegistrationForm token={token} />;
}
