import type { FeMsg, Phase } from "./types";

/**
 * Normalize ANY incoming event into FeMsg.
 * If the backend uses different field names, change only here.
 */
export function adapt(incoming: unknown): FeMsg | null {
  // Ensure we deal with an object
  if (incoming === null || typeof incoming !== "object") return null;

  const rec = incoming as Record<string, unknown>;
  const type = rec["type"];

  if (type === "status") {
    // phase
    const rawPhase = rec["phase"];
    const phase: Phase =
      rawPhase === "processing" ||
      rawPhase === "running" ||
      rawPhase === "done" ||
      rawPhase === "error"
        ? rawPhase
        : "running";

    // progress
    const rawProgress = rec["progress"];
    const progress = typeof rawProgress === "number" ? rawProgress : undefined;

    return { kind: "status", phase, progress };
  }

  if (type === "viz") {
    return { kind: "viz", spec: rec["spec"] };
  }

  if (type === "table") {
    const rawPreview = rec["dfPreview"] ?? rec["preview"];
    let rows = 0;
    let cols = 0;

    if (rawPreview && typeof rawPreview === "object") {
      const p = rawPreview as Record<string, unknown>;
      const r = p["rows"];
      const c = p["cols"];
      rows = typeof r === "number" ? r : Number(r ?? 0);
      cols = typeof c === "number" ? c : Number(c ?? 0);
    }

    return { kind: "table", preview: { rows, cols } };
  }

  if (type === "error") {
    const msg = rec["message"];
    return { kind: "error", message: typeof msg === "string" ? msg : "Error" };
  }

  // Unknown event → ignore
  return null;
}
