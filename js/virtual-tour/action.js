// action.js

export class Action {
  constructor(type) {
    this.type = type;
  }
}

export class ChangeRoomAction extends Action {
  constructor({ targetRoomId }) {
    super("changeRoom");
    if (!targetRoomId) throw new Error("Change Room braucht targetRoomId");

    this.targetRoomId = targetRoomId;
  }
}