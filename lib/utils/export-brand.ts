import { BRAND } from "@/constants/brand";

export async function loadBrandImage(): Promise<{
  base64: string;
  dataUrl: string;
} | null> {
  try {
    const response = await fetch(BRAND.logo);
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64) return null;

    return { base64, dataUrl };
  } catch {
    return null;
  }
}

export function createWatermarkDataUrl(text: string = BRAND.name) {
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 260;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-32 * Math.PI) / 180);
  ctx.font = "700 42px Arial, sans-serif";
  ctx.fillStyle = "rgba(100, 116, 139, 0.12)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);

  return canvas.toDataURL("image/png");
}
