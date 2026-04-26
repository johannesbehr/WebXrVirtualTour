// Room.js

export class Room {
  constructor({ id, title = "", image, audio = null, initialView = null, hotspots = [] }) {
    if (!id) throw new Error("Room braucht eine ID");
    if (!image) throw new Error(`Room ${id} hat kein Bild`);

    this.id = id;
    this.title = title;
    this.image = image;
    this.audio = audio;

    this.initialView = initialView
      ? new InitialView(initialView)
      : new InitialView({ yaw: 0, pitch: 0 });

    this.hotspots = hotspots.map(h => new Hotspot(h));
  }
}