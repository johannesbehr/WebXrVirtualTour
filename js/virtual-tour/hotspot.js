// hotspot.js
import { Vec3 } from "./vec3.js";
import { Quaternion } from "./quaternion.js";
import { ActionFactory } from "./action-factory.js";

export class Hotspot {
  constructor({
    id,
    text = "",
    translation,
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    type = "generic",
    action
  }) {
    if (!id) throw new Error("Hotspot braucht eine ID");
    if (!translation || translation.length !== 3) {
      throw new Error(`Hotspot ${id} hat keine gültige Position`);
    }
    if (!action) {
      throw new Error(`Hotspot ${id} hat keine Action`);
    }

    this.id = id;
    this.text = text;

	/*
    this.position = new Vec3(position);
	if(Array.isArray(rotation)){
		if(rotation.length==3){
			this.rotation = new Vec3(rotation);
		}else if(rotation.length==4){
			this.rotation = new Quaternion(rotation);
		}
	} else{
		// Throw up	
	}
    this.scale = new Vec3(scale);
*/
    this.translation = translation;
	this.rotation = rotation;
    this.scale = scale;


    this.type = type;

    this.action = ActionFactory.create(action);
  }
}