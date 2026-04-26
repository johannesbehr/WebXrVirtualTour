// Hotspot.js

export class Hotspot {
  constructor({
    id,
    text = ,
    position,
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    type = generic,
    action
  }) {
    if (!id) throw new Error(Hotspot braucht eine ID);
    if (!position  position.length !== 3) {
      throw new Error(`Hotspot ${id} hat keine gültige Position`);
    }
    if (!action) {
      throw new Error(`Hotspot ${id} hat keine Action`);
    }

    this.id = id;
    this.text = text;

    this.position = new Vec3(position);
    this.rotation = new Vec3(rotation);
    this.scale = new Vec3(scale);

    this.type = type;

    this.action = ActionFactory.create(action);
  }
}