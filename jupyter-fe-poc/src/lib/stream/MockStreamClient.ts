import type { IStreamClient } from "./IStreamClient";
import type { FeMsg, ExecutePayload } from "../types";

export default class MockStreamClient implements IStreamClient {
  private cb: (m: FeMsg) => void = () => {};
  private timers: number[] = [];
  private sessionId: string | null = null;

  onMessage(cb: (m: FeMsg) => void) { this.cb = cb; }
  async connect() { /* no-op for mock */ }

  async execute(payload: ExecutePayload) {
    this.cancel();
    this.sessionId = `mock-${Date.now()}`;

    const send = (m: FeMsg, delay: number) => {
      const id = window.setTimeout(() => this.cb(m), delay);
      this.timers.push(id);
    };

    send({ kind: "status", phase: "running", progress: 5 }, 0);
    send({ kind: "table", preview: { rows: 120, cols: 14 } }, 900);
    send({ kind: "status", phase: "processing", progress: 60 }, 1600);
    send(
      {
        kind: "viz",
        spec: {
          library: "plotly",
          data: [
            { type: "bar", x: ["A", "B", "C"], y: [2, 5, 3], name: "Group 1" },
            { type: "bar", x: ["A", "B", "C"], y: [4, 1, 2], name: "Group 2" },
          ],
          layout: {
            barmode: "stack",
            title: `${payload.templateId} (demo)`,
            margin: { t: 32, r: 16, b: 40, l: 40 },
            height: 380,
          },
          config: { displayModeBar: false, responsive: true },
        },
      },
      1800
    );
    send({ kind: "status", phase: "done", progress: 100 }, 2600);
  }

  simulateError() {
    this.cancel();
    this.cb({ kind: "error", message: "Simulated error from mock client." });
  }

  cancel() { this.timers.forEach(clearTimeout); this.timers = []; }
  close() { this.cancel(); this.cb = () => {}; }
  getSessionId() { return this.sessionId; }
}
