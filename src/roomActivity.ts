export type RoomId = string;

const IDLE_SWEEP_INTERVAL_MS = 60_000;
const DEFAULT_IDLE_TTL_MS = 5 * 60_000;

type RoomActivity = {
  userCount: number;
  lastSeen: number;
};

/**
 * Tracks per-room activity so the server can report occupancy and
 * reap rooms that have been empty past their idle TTL.
 */
export class RoomActivityTracker {
  private rooms = new Map<RoomId, RoomActivity>();
  private sweeper: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly idleTtlMs: number = DEFAULT_IDLE_TTL_MS) {}

  start(): void {
    if (this.sweeper) {
      return;
    }
    this.sweeper = setInterval(() => this.sweep(), IDLE_SWEEP_INTERVAL_MS);
  }

  stop(): void {
    if (this.sweeper) {
      clearInterval(this.sweeper);
      this.sweeper = null;
    }
  }

  userJoined(roomId: RoomId): void {
    const entry = this.rooms.get(roomId) ?? { userCount: 0, lastSeen: 0 };
    entry.userCount += 1;
    entry.lastSeen = Date.now();
    this.rooms.set(roomId, entry);
  }

  userLeft(roomId: RoomId): void {
    const entry = this.rooms.get(roomId);
    if (!entry) {
      return;
    }
    entry.userCount = Math.max(0, entry.userCount - 1);
    entry.lastSeen = Date.now();
  }

  occupancy(roomId: RoomId): number {
    return this.rooms.get(roomId)?.userCount ?? 0;
  }

  activeRoomCount(): number {
    let count = 0;
    for (const entry of this.rooms.values()) {
      if (entry.userCount > 0) {
        count += 1;
      }
    }
    return count;
  }

  private sweep(): void {
    const cutoff = Date.now() - this.idleTtlMs;
    for (const [roomId, entry] of this.rooms) {
      if (entry.userCount === 0 || entry.lastSeen < cutoff) {
        this.rooms.delete(roomId);
      }
    }
  }
}
