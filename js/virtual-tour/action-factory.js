// action-factory.js

import { ScriptAction, ChangeRoomAction } from "./action.js";

export class ActionFactory {
  static create(data) {
    switch (data.type) {
      case "changeRoom":
        return new ChangeRoomAction(data);
	 case "script":
        return new ScriptAction(data);
      default:
        throw new Error(`Unbekannter Action-Typ: ${data.type}`);
    }
  }
}