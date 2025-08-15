import type { IStreamClient } from "./IStreamClient";
import MockStreamClient from "./MockStreamClient";
import JupyterClient from "./JupyterClient";

export function makeStreamClient(): IStreamClient {
  const mode = import.meta.env.VITE_STREAM_MODE ?? "mock";
  return mode === "real" ? new JupyterClient() : new MockStreamClient();
}
