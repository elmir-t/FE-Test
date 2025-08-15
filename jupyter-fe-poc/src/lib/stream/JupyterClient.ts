import type { IStreamClient } from "./IStreamClient";
import type { FeMsg, ExecutePayload } from "../types";

export default class JupyterClient implements IStreamClient {
  private cb: (m: FeMsg) => void = () => {};
  private sessionId: string | null = null;

  onMessage(cb: (m: FeMsg) => void) { this.cb = cb; }

  async connect() {
    console.warn("[JupyterClient] connect() – not implemented in POC");
  }

  async execute(payload: ExecutePayload) {
    void payload; // no-op to satisfy linter

    console.warn("[JupyterClient] execute() – not implemented in POC");
    // later: create session, execute and listen for WS/SSE
  }

  simulateError() {
    this.cb({ kind: "error", message: "Real client not wired yet." });
  }

  cancel() {}
  close() {}
  getSessionId() { return this.sessionId; }
}
