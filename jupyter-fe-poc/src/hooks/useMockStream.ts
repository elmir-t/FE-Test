import { adapt } from "../lib/adapter";
import type { FeMsg } from "../lib/types";

export type MockController = {
  start: () => void;
  cancel: () => void;
  simulateError: () => void;
};

/**
 * Usage:
 * const { start, cancel, simulateError } = useMockStream(onMessage);
 */
export function useMockStream(onMessage: (m: FeMsg) => void): MockController {
  // Use number because in the browser setTimeout returns a number.
  let timers: number[] = [];

  const send = (raw: unknown, delayMs: number) => {
    const id = window.setTimeout(() => {
      const msg = adapt(raw);
      if (msg) onMessage(msg);
    }, delayMs);
    timers.push(id);
  };

  const cancel = () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
  };

  const start = () => {
    cancel(); // clear previous timers

    // Timeline:
    // t=0ms     -> running 5%
    // t=900ms   -> table preview
    // t=1600ms  -> processing 60%
    // t=1800ms  -> viz spec
    // t=2600ms  -> done 100%

    send({ type: "status", phase: "running", progress: 5 }, 0);

    send({ type: "table", dfPreview: { rows: 120, cols: 14 } }, 900);

    send({ type: "status", phase: "processing", progress: 60 }, 1600);

    // Example Plotly stacked bar spec
    send(
      {
        type: "viz",
        spec: {
          library: "plotly",
          data: [
            { type: "bar", x: ["A", "B", "C"], y: [2, 5, 3], name: "Group 1" },
            { type: "bar", x: ["A", "B", "C"], y: [4, 1, 2], name: "Group 2" },
          ],
          layout: {
            barmode: "stack",
            title: "Demo: Stacked Bar",
            margin: { t: 32, r: 16, b: 40, l: 40 },
            height: 380,
          },
          config: { displayModeBar: false, responsive: true },
        },
      },
      1800
    );

    send({ type: "status", phase: "done", progress: 100 }, 2600);
  };

  const simulateError = () => {
    cancel();
    onMessage({ kind: "error", message: "Simulated error from mock stream." });
  };

  return { start, cancel, simulateError };
}
