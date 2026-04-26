// Action.js

export class Action {
  constructor(type) {
    this.type = type;
  }
}

export class TeleportAction extends Action {
  constructor({ targetRoomId }) {
    super("teleport");
    if (!targetRoomId) throw new Error("Teleport braucht targetRoomId");

    this.targetRoomId = targetRoomId;
  }
}