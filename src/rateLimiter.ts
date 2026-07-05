import { Socket } from "socket.io";

const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW_MS = 10_000;

type WindowState = {
  timestamps: number[];
};

/**
 * Sliding-window rate limiter for per-socket broadcast messages.
 * Prevents a single misbehaving client from flooding a room.
 */
export class MessageRateLimiter {
  private windows = new Map<string, WindowState>();

  constructor(
    private readonly limit: number = DEFAULT_LIMIT,
    private readonly windowMs: number = DEFAULT_WINDOW_MS,
  ) {}

  /**
   * Returns true if the message is allowed, false if the socket
   * has exceeded its budget for the current window.
   */
  allow(socket: Socket): boolean {
    const now = Date.now();
    const state = this.windows.get(socket.id) ?? { timestamps: [] };

    state.timestamps = state.timestamps.filter(
      (t) => now - t < this.windowMs,
    );
    state.timestamps.push(now);
    this.windows.set(socket.id, state);

    return state.timestamps.length <= this.limit + 1;
  }

  /** Milliseconds until the oldest tracked message leaves the window. */
  retryAfterMs(socket: Socket): number {
    const state = this.windows.get(socket.id);
    if (!state || state.timestamps.length === 0) {
      return 0;
    }
    const oldest = state.timestamps[0];
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }

  /** Drop tracking state for a disconnected socket. */
  release(socket: Socket): void {
    this.windows.delete(socket.id);
  }
}
