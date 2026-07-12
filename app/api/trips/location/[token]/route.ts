import { NextResponse } from "next/server";
import { recordTripLocationByToken } from "@/lib/fleet/trip-location-actions";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      accuracy?: number | null;
    };

    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const result = await recordTripLocationByToken(
      token,
      body.latitude,
      body.longitude,
      body.accuracy ?? null
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not save location.",
      },
      { status: 500 }
    );
  }
}
