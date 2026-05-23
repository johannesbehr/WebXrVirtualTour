// hotspot.js
import { Action } from "./action.js";

export class Hotspot {
  constructor({
    id,
    text = "",
	textSize = 20,
    translation = [0 , 0 , 0],
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1],
	customModel = "",
	targetId = "",
	style,
    action
  }, room) {
    //if (!id) throw new Error("Hotspot braucht eine ID");
	
	if(targetId!==""){
		action = {type:"changeRoom", targetRoomId:targetId};
		style =  "ring";
		scale = [200, 200, 200];
	}else
	{
		if (!translation || translation.length !== 3) {
		  throw new Error(`Hotspot ${id} hat keine gültige Position`);
		}
		if (!action) {
		  throw new Error(`Hotspot ${id} hat keine Action`);
		}
	}

    this.id = id;
    this.text = text;
	this.textSize = textSize;
    this.translation = translation;
	this.targetId = targetId;
	this.rotation = rotation;
    this.scale = scale;
	this.customModel = customModel;
    this.style = style;
	this.room = room;
    this.action = Action.create(action);
  }
}