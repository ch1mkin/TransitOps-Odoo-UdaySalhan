"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ExternalLink, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTripLocations } from "@/lib/fleet/trip-location-actions";
import type { Trip, TripLocation } from "@/types/entities";

interface TripLocationPanelProps {
  trip: Trip;
}

export function TripLocationPanel({ trip }: TripLocationPanelProps) {
  const [locations, setLocations] = useState<TripLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const trackingUrl = useMemo(() => {
    if (!trip.tracking_token || typeof window === "undefined") return null;
    return `${window.location.origin}/track/trip/${trip.tracking_token}`;
  }, [trip.tracking_token]);

  const latest = locations[0] ?? null;

  const loadLocations = async () => {
    setLoading(true);
    const result = await getTripLocations(trip.id);
    setLocations(result.locations);
    setLoading(false);
  };

  useEffect(() => {
    void loadLocations();
    if (trip.status !== "Dispatched") return;

    const timer = window.setInterval(() => {
      void loadLocations();
    }, 15_000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id, trip.status]);

  useEffect(() => {
    if (!trackingUrl) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(trackingUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#0f2744", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [trackingUrl]);

  if (trip.status !== "Dispatched" && !latest) {
    return null;
  }

  const mapSrc = latest
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${latest.longitude - 0.08}%2C${latest.latitude - 0.06}%2C${latest.longitude + 0.08}%2C${latest.latitude + 0.06}&layer=mapnik&marker=${latest.latitude}%2C${latest.longitude}`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Live trip location</h3>
          <p className="text-xs text-muted-foreground">
            Driver GPS updates appear here while the trip is dispatched.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void loadLocations()}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-3">
          {mapSrc ? (
            <iframe
              title="Trip location map"
              src={mapSrc}
              className="h-64 w-full rounded-xl border border-border"
              loading="lazy"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
              Waiting for the first GPS update…
            </div>
          )}

          {latest ? (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
              </span>
              <span>Updated {new Date(latest.recorded_at).toLocaleString()}</span>
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent"
                >
                  <ExternalLink className="size-3.5" />
                  Driver tracking page
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {trip.status === "Dispatched" && trackingUrl ? (
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">Driver tracking QR</p>
            <div className="mx-auto mt-3 flex w-full max-w-[140px] items-center justify-center overflow-hidden rounded-lg bg-white p-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Driver tracking QR code" className="size-full object-contain" />
              ) : (
                <div className="aspect-square w-full animate-pulse rounded bg-muted" />
              )}
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Driver scans this on their phone to share live GPS while in transit.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
