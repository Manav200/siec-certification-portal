// ─── Event & Certificate Data Types ─────────────────────────────────────────

/** A single row from an uploaded CSV file. Keys are column headers. */
export interface CsvRow {
  [key: string]: string;
}

/** An event that certificates can be generated for. */
export interface CertificateEvent {
  id: string;
  eventName: string;
  category: string;
  eventDate: string;           // ISO 8601 date string
  status: "Draft" | "Published";
  baseImageUrl: string;        // URL or data-URI of the certificate template image
  csvData: CsvRow[];
  canvasConfigs?: CanvasConfig[];
}

// ─── Canvas / Template Config Types ─────────────────────────────────────────

/** Describes how a single variable field is positioned on the certificate template. */
export interface CanvasConfig {
  id: string;
  variableName: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: "left" | "center" | "right";
  customText?: string; // Admin text override for this field (e.g. custom Role text)
}

// ─── Store Action Types ─────────────────────────────────────────────────────

export type EventAction =
  | { type: "SET_EVENTS"; payload: CertificateEvent[] }
  | { type: "ADD_EVENT"; payload: CertificateEvent }
  | { type: "UPDATE_EVENT"; payload: CertificateEvent }
  | { type: "DELETE_EVENT"; payload: string }  // payload = event id
  | { type: "SET_ACTIVE_EVENT"; payload: string };

export interface EventStoreState {
  events: CertificateEvent[];
  activeEventId: string | null;
}
