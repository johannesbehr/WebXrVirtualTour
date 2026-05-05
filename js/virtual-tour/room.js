// Room.js
import { Hotspot } from "./hotspot.js";

export class Room {
  constructor({ id, title = "", image, audio = null, rotation = [0, 0, 0, 1], hotspots = [] }) {
    if (!id) throw new Error("Room braucht eine ID");
    if (!image) throw new Error(`Room ${id} hat kein Bild`);

    this.id = id;
    this.title = title;
    this.image = image;
    this.audio = audio;
	this.rotation = rotation;
    this.hotspots = hotspots.map(h => new Hotspot(h));
  }
}