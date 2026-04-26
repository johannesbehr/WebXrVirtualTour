// ActionFactory.js

import { TeleportAction } from "./Action.js";

export class ActionFactory {
  static create(data) {
    switch (data.type) {
      case "teleport":
        return new TeleportAction(data);

      default:
        throw new Error(`Unbekannter Action-Typ: ${data.type}`);
    }
  }
}