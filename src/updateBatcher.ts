const MAX_BUFFERED_UPDATES = 50;
const FLUSH_INTERVAL_MS = 200;

export type SceneUpdate = {
  roomId: string;
  payload: Uint8Array;
  receivedAt: number;
};

type FlushFn = (roomId: string, batch: SceneUpdate[]) => void;

/**
 * Coalesces rapid-fire scene updates per room and flushes them in
 * batches, so broadcast fan-out happens at most once per interval
 * instead of once per incoming socket message.
 */
export class UpdateBatcher {
  private buffers = new Map<string, SceneUpdate[]>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly flushFn: FlushFn) {}

  enqueue(update: SceneUpdate): void {
    const { roomId } = update;
    const buffer = this.buffers.get(roomId) ?? [];
    buffer.push(update);
    this.buffers.set(roomId, buffer);

    if (buffer.length >= MAX_BUFFERED_UPDATES) {
      this.flushRoom(roomId);
      return;
    }

    if (!this.timers.has(roomId)) {
      const timer = setTimeout(() => this.flushRoom(roomId), FLUSH_INTERVAL_MS);
      this.timers.set(roomId, timer);
    }
  }

  flushRoom(roomId: string): void {
    const buffer = this.buffers.get(roomId);
    if (!buffer || buffer.length === 0) {
      return;
    }
    this.buffers.delete(roomId);
    this.flushFn(roomId, buffer);
  }

  flushAll(): void {
    for (const roomId of this.buffers.keys()) {
      this.flushRoom(roomId);
    }
  }

  pendingCount(roomId: string): number {
    return this.buffers.get(roomId)?.length ?? 0;
  }
}
