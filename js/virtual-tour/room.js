// Room.js
import { Hotspot } from "./hotspot.js";

export class Room {
  constructor({ id, title = "", image, audio = null, rotation = [0, 0, 0, 1], hotspots = [], location = [0,0]}, tour) {
    if (!id) throw new Error("Room braucht eine ID");
    if (!image){
		image = "images/" + id + ".jpg";
	}

    this.id = id;
    this.title = title;
	this.location = location;
    this.image = image;
    this.audio = audio;
	this.rotation = rotation;
	this.tour = tour;
    this.hotspots = hotspots.map(h => new Hotspot(h, this));
  }
}