import type { Data, Layout, Config } from "plotly.js";

export type PlotlySpec = {
  library: "plotly";
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
};

export function isPlotlySpec(x: unknown): x is PlotlySpec {
  if (!x || typeof x !== "object") return false;
  const rec = x as Record<string, unknown>;
  if (rec["library"] !== "plotly") return false;
  return Array.isArray(rec["data"]);
}

export type Phase = "idle" | "running" | "processing" | "done" | "error";

export type FeMsg =
  | { kind: "status"; phase: Phase; progress?: number }
  | { kind: "viz"; spec: unknown } // Plotly JSON expected
  | { kind: "table"; preview: { rows: number; cols: number } }
  | { kind: "error"; message: string };

export type ExecutePayload = {
  templateId: string;
  params: Record<string, unknown>;
  binding?: Record<string, string>;
  resources?: { cpu: number; ramGb: number; cuda?: boolean };
};

