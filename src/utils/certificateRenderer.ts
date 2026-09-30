import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { CertificateEvent, CsvRow, CanvasConfig } from "@/types";
import { PRESET_TEMPLATES } from "@/utils/defaultTemplates";

export interface MatchRecord {
  event: CertificateEvent;
  participant: CsvRow;
}

export const DEFAULT_CANVAS_CONFIGS: CanvasConfig[] = [
  {
    id: "def-1",
    variableName: "Participant Name",
    x: 600,
    y: 280,
    fontSize: 38,
    fontFamily: "Inter",
    color: "#111827",
    alignment: "center",
  },
  {
    id: "def-2",
    variableName: "Event Name",
    x: 600,
    y: 360,
    fontSize: 22,
    fontFamily: "Inter",
    color: "#4b5563",
    alignment: "center",
  },
  {
    id: "def-3",
    variableName: "Role",
    x: 600,
    y: 420,
    fontSize: 18,
    fontFamily: "Inter",
    color: "#6b7280",
    alignment: "center",
  },
];

/**
 * Computes a unique, deterministic Certificate Verification ID.
 */
export function getCertificateId(
  event: CertificateEvent,
  participant: CsvRow
): string {
  const explicit =
    participant.certificateId ||
    participant.certId ||
    participant["Certificate ID"] ||
    participant["certificate id"] ||
    participant["Cert ID"];
  if (explicit) return String(explicit);

  const identifier =
    participant.email ||
    participant.Email ||
    participant.name ||
    participant.Name ||
    "SIEC";
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const cleanEventId = event.id.replace(/^evt-/, "").toUpperCase().slice(0, 8);
  const num = Math.abs(hash % 90000) + 10000;
  return `SIEC-${cleanEventId}-${num}`;
}

/**
 * Resolves the dynamic text string for a given variable field on the certificate.
 */
export function resolveFieldText(
  config: CanvasConfig,
  event: CertificateEvent,
  participant: CsvRow,
  certId: string
): string {
  if (config.customText && config.customText.trim() !== "") {
    return config.customText;
  }

  switch (config.variableName) {
    case "Participant Name":
      return (
        participant.name ||
        participant.Name ||
        participant["Participant Name"] ||
        participant["participant name"] ||
        "Valued Participant"
      );
    case "Event Name":
      return event.eventName;
    case "Role":
      return participant.role || participant.Role || "Participant";
    case "Issue Date":
      return (
        participant.issueDate ||
        participant.IssueDate ||
        participant.date ||
        participant.Date ||
        new Date(event.eventDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    case "Certificate ID":
      return certId;
    default: {
      if (
        participant[config.variableName] !== undefined &&
        participant[config.variableName] !== ""
      ) {
        return String(participant[config.variableName]);
      }
      const matchedKey = Object.keys(participant).find(
        (k) =>
          k.trim().toLowerCase() === config.variableName.trim().toLowerCase()
      );
      if (
        matchedKey &&
        participant[matchedKey] !== undefined &&
        participant[matchedKey] !== ""
      ) {
        return String(participant[matchedKey]);
      }
      return config.variableName;
    }
  }
}

/**
 * Loads an image from a URL or base64 data-URI with CORS enabled.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) =>
      reject(new Error(`Failed to load certificate template: ${src.slice(0, 80)}`));
    img.src = src;
  });
}

/**
 * Renders the certificate onto any HTML5 Canvas context.
 */
export async function drawCertificate(
  canvas: HTMLCanvasElement,
  event: CertificateEvent,
  participant: CsvRow
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas rendering context");
  }

  const imageUrl = event.baseImageUrl || PRESET_TEMPLATES[0].dataUrl;
  const img = await loadImage(imageUrl);

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-blocking fallback if fonts.ready fails
    }
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background template
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Text fields configs
  const configs =
    event.canvasConfigs && event.canvasConfigs.length > 0
      ? event.canvasConfigs
      : DEFAULT_CANVAS_CONFIGS;

  const certId = getCertificateId(event, participant);

  configs.forEach((config) => {
    const textValue = resolveFieldText(config, event, participant, certId);
    const align = config.alignment || "center";

    ctx.save();
    ctx.font = `bold ${config.fontSize}px ${config.fontFamily}, sans-serif`;
    ctx.fillStyle = config.color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(textValue, config.x, config.y);
    ctx.restore();
  });
}

/**
 * Renders an offscreen 1200x800 HTML5 Canvas and exports a PNG Blob.
 */
export async function renderCertificateToBlob(
  event: CertificateEvent,
  participant: CsvRow
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;

  await drawCertificate(canvas, event, participant);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(
          new Error(`Failed to generate PNG blob for event: ${event.eventName}`)
        );
      }
    }, "image/png");
  });
}

/**
 * Sanitizes a string for safe use in file and archive names.
 */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return cleaned || "Certificate";
}

export interface ZipGenerationResult {
  blob: Blob;
  fileName: string;
  skippedEvents: string[];
  successCount: number;
}

/**
 * Generates a ZIP archive containing PNG certificates for all matching event records.
 * Handles file name collisions and skips errored templates gracefully.
 */
export async function generateCertificatesZip(
  matches: MatchRecord[],
  onProgress?: (current: number, total: number) => void
): Promise<ZipGenerationResult> {
  if (!matches || matches.length === 0) {
    throw new Error("No certificate records provided for ZIP export.");
  }

  const zip = new JSZip();
  const eventCounters = new Map<string, number>();
  const usedFileNames = new Set<string>();

  function getUniqueFileName(eventName: string): string {
    const sanitized = sanitizeFileName(eventName);
    const count = eventCounters.get(sanitized) || 0;
    eventCounters.set(sanitized, count + 1);

    let candidate =
      count === 0
        ? `${sanitized}_Certificate.png`
        : `${sanitized}_Certificate_${count}.png`;

    let counter = count;
    while (usedFileNames.has(candidate)) {
      counter++;
      candidate = `${sanitized}_Certificate_${counter}.png`;
    }

    usedFileNames.add(candidate);
    return candidate;
  }

  const skippedEvents: string[] = [];
  let successCount = 0;

  for (let i = 0; i < matches.length; i++) {
    onProgress?.(i + 1, matches.length);
    const match = matches[i];

    try {
      const blob = await renderCertificateToBlob(match.event, match.participant);
      const fileName = getUniqueFileName(match.event.eventName);
      zip.file(fileName, blob);
      successCount++;
    } catch (err) {
      console.warn(
        `[ZIP Generation] Skipping certificate for "${match.event.eventName}":`,
        err
      );
      skippedEvents.push(match.event.eventName);
    }
  }

  if (successCount === 0) {
    throw new Error(
      "Unable to render any certificates. Please try downloading individually."
    );
  }

  // Generate ZIP Archive
  const zipBlob = await zip.generateAsync({ type: "blob" });

  const rawParticipantName =
    matches[0]?.participant.name ||
    matches[0]?.participant.Name ||
    matches[0]?.participant["Participant Name"] ||
    matches[0]?.participant["participant name"] ||
    "Participant";

  const sanitizedParticipantName = sanitizeFileName(rawParticipantName);
  const zipFileName = `SIEC_Certificates_${sanitizedParticipantName}.zip`;

  // Trigger browser download via FileSaver
  saveAs(zipBlob, zipFileName);

  return {
    blob: zipBlob,
    fileName: zipFileName,
    skippedEvents,
    successCount,
  };
}
