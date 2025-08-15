import type { FeMsg, ExecutePayload } from "../types";

export interface IStreamClient {
  onMessage(cb: (m: FeMsg) => void): void;
  connect(): Promise<void>;
  execute(payload: ExecutePayload): Promise<void>;
  simulateError(): void;
  cancel(): void;
  close(): void;
  getSessionId(): string | null;
}