import crypto from "crypto";

export type Role = "editor" | "viewer";

type RoomAccess = {
  /** null while the room is open: everyone who joins can edit */
  editorToken: string | null;
  roles: Map<string, Role>;
};

const rooms = new Map<string, RoomAccess>();

const getOrCreateRoom = (roomID: string): RoomAccess => {
  let room = rooms.get(roomID);
  if (!room) {
    room = { editorToken: null, roles: new Map() };
    rooms.set(roomID, room);
  }
  return room;
};

/**
 * Gives a joining socket its role. A room stays open until someone turns on
 * view-only; after that, only sockets that present the editor token can edit.
 */
export const assignRole = (
  roomID: string,
  socketId: string,
  editorToken?: string | null,
): Role => {
  const room = getOrCreateRoom(roomID);
  const role: Role =
    !room.editorToken || editorToken == room.editorToken ? "editor" : "viewer";
  room.roles.set(socketId, role);
  return role;
};

/**
 * Turns on view-only for a room and returns the new editor token. Everyone
 * already in the room keeps editing; people who join later without the token
 * can only view.
 */
export const enableViewOnly = (roomID: string): string => {
  const room = getOrCreateRoom(roomID);
  room.editorToken = crypto.randomBytes(16).toString("hex");
  room.roles.forEach((_role, socketId) => room.roles.set(socketId, "editor"));
  return room.editorToken;
};

export const getRole = (roomID: string, socketId: string): Role | undefined =>
  rooms.get(roomID)?.roles.get(socketId);

export const getRoles = (roomID: string): Record<string, Role> => {
  const roles: Record<string, Role> = {};
  rooms.get(roomID)?.roles.forEach((role, socketId) => {
    roles[socketId] = role;
  });
  return roles;
};

export const removeSocket = (roomID: string, socketId: string) => {
  const room = rooms.get(roomID);
  if (!room) {
    return;
  }
  room.roles.delete(socketId);
  if (room.roles.size === 0) {
    rooms.delete(roomID);
  }
};
