// hotspot.js
import { Action } from "./action.js";

export class Hotspot {
  constructor({
    id,
    text = "",
    translation,
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1],
	customModel = "",
	style,
    action
  }) {
    if (!id) throw new Error("Hotspot braucht eine ID");
    if (!translation || translation.length !== 3) {
      throw new Error(`Hotspot ${id} hat keine gültige Position`);
    }
    if (!action) {
      throw new Error(`Hotspot ${id} hat keine Action`);
    }
	if (!action) {
      throw new Error(`Hotspot ${id} hat keine Action`);
    }

    this.id = id;
    this.text = text;
    this.translation = translation;
	this.rotation = rotation;
    this.scale = scale;
	this.customModel = customModel;

    this.style = style;

    this.action = Action.create(action);
  }
}