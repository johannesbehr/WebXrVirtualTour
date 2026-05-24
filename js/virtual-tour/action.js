// action.js

export class Action {
  constructor(type) {
    this.type = type;
  }
  
  static create(data) {
    switch (data.type) {
      case "changeViewPoint":
        return new ChangeViewPointAction(data);
	 case "script":
        return new ScriptAction(data);
      default:
        throw new Error(`Unbekannter Action-Typ: ${data.type}`);
    }
  }
}

export class ChangeViewPointAction extends Action {
  constructor({ targetViewPointId }) {
    super("changeViewPoint");
    if (!targetViewPointId) throw new Error("Change ViewPoint braucht targetViewPointId");

    this.targetViewPointId = targetViewPointId;
  }
}

export class ScriptAction extends Action {
  constructor({ script }) {
    super("script");
    if (!script) throw new Error("Script braucht ein script");

    this.script = script;
  }
}