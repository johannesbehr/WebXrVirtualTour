// VirtualTour.js
import { ViewPoint } from "./view-point.js";

export class VirtualTour {
  constructor({ title, startPointId, viewPoints }) {
    if (!title) throw new Error("VirtualTour braucht einen Titel");
    if (!startPointId) throw new Error("startPointId fehlt");

    this.title = title;
    this.startPointId = startPointId;

    this.viewPoints = viewPoints.map(r => new ViewPoint(r, this));

    // Map für schnellen Zugriff
    this.viewPointMap = new Map();
    this.viewPoints.forEach(viewPoint => {
      if (this.viewPointMap.has(viewPoint.id)) {
        throw new Error(`Doppelte ViewPoint-ID: ${viewPoint.id}`);
      }
      this.viewPointMap.set(viewPoint.id, viewPoint);
    });

    if (!this.viewPointMap.has(this.startPointId)) {
      throw new Error("Start-Punkt existiert nicht");
    }
  }

  getViewPoint(id) {
    return this.viewPointMap.get(id) || null;
  }
}