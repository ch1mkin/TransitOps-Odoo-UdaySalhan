import { BRAND } from "@/constants/brand";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function applyDocumentWatermark(blob: Blob): Promise<Blob> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    ctx.drawImage(image, 0, 0);

    const fontSize = Math.max(28, Math.round(Math.min(image.width, image.height) / 7));
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.translate(image.width / 2, image.height / 2);
    ctx.rotate((-32 * Math.PI) / 180);
    ctx.font = `700 ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = "#0f2744";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BRAND.name, 0, 0);
    ctx.restore();

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) reject(new Error("Could not encode image"));
          else resolve(result);
        },
        blob.type || "image/jpeg",
        0.92
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export interface CropTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export async function cropImageToSquare(
  blob: Blob,
  transform: CropTransform,
  outputSize = 1024
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    const base = Math.min(image.width, image.height);
    const sourceSize = base / transform.scale;
    const maxOffset = (base - sourceSize) / 2;
    const sourceX = (image.width - base) / 2 + maxOffset + transform.offsetX;
    const sourceY = (image.height - base) / 2 + maxOffset + transform.offsetY;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) reject(new Error("Could not crop image"));
          else resolve(result);
        },
        blob.type.startsWith("image/") ? blob.type : "image/jpeg",
        0.92
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function processDriverProofFile(
  file: Blob,
  transform: CropTransform
): Promise<Blob> {
  const cropped = await cropImageToSquare(file, transform);
  return applyDocumentWatermark(cropped);
}
