"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

interface MobileTripTrackerProps {
  token: string;
  tripNumber: string;
}

export function MobileTripTracker({ token, tripNumber }: MobileTripTrackerProps) {
  const [status, setStatus] = useState("Requesting GPS permission…");
  const [active, setActive] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !navigator.geolocation) return;

    const sendPosition = (position: GeolocationPosition) => {
      void fetch(`/api/trips/location/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      })
        .then(async (response) => {
          const result = (await response.json()) as { success: boolean; error?: string };
          if (!response.ok || !result.success) {
            setError(result.error ?? "Could not send location.");
            return;
          }
          setError(null);
          setLastSent(new Date().toLocaleTimeString());
          setStatus("Location shared with dispatch.");
        })
        .catch(() => {
          setError("Network error while sending location.");
        });
    };

    const onError = () => {
      setError("Location permission denied or unavailable.");
      setStatus("Enable location access to share your position.");
    };

    navigator.geolocation.getCurrentPosition(sendPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 20_000,
    });

    const timer = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 20_000,
      });
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [active, token]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size={44} className="rounded-xl" />
          <div>
            <p className="text-sm font-semibold">TransitOps</p>
            <p className="text-xs text-muted-foreground">Live trip tracking</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-lg font-semibold">Share location for {tripNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Keep this page open while the trip is in progress. Your GPS position will be shared
            with the dispatcher every 30 seconds.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="size-4 text-accent" />
            {status}
          </div>
          {lastSent ? (
            <p className="mt-2 text-xs text-muted-foreground">Last sent at {lastSent}</p>
          ) : null}
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
        </div>

        <Button type="button" className="mt-6 w-full" onClick={() => setActive(true)}>
          <Navigation className="size-4" />
          {active ? "Tracking active" : "Start sharing location"}
        </Button>
      </div>
    </div>
  );
}
