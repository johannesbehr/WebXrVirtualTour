// VirtualTour.js
import { Room } from "./room.js";

export class VirtualTour {
  constructor({ title, startRoomId, rooms }) {
    if (!title) throw new Error("VirtualTour braucht einen Titel");
    if (!startRoomId) throw new Error("startRoomId fehlt");

    this.title = title;
    this.startRoomId = startRoomId;

    this.rooms = rooms.map(r => new Room(r));

    // Map für schnellen Zugriff
    this.roomMap = new Map();
    this.rooms.forEach(room => {
      if (this.roomMap.has(room.id)) {
        throw new Error(`Doppelte Room-ID: ${room.id}`);
      }
      this.roomMap.set(room.id, room);
    });

    if (!this.roomMap.has(this.startRoomId)) {
      throw new Error("Start-Raum existiert nicht");
    }
  }

  getRoom(id) {
    return this.roomMap.get(id) || null;
  }
}