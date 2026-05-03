
import {Gltf2Node} from './../render/nodes/gltf2.js';


export class HotspotNode extends Gltf2Node {
	constructor(options){
		super({url:options.url});

		// All buttons are selectable by default.
		this.selectable = true;
		this._selectHandler = options.callback;
		this.action = options.action;
		this._hovered = false;
		this._hoverT = 0;
		console.log("Hotspot created!");
	}
	
  onHoverStart() {
    this._hovered = true;
	this.scale = [45, 45, 45];
	console.log("Hotspot hover start");
  }

  onHoverEnd() {
    this._hovered = false;
	this.scale = [40, 40, 40];
	console.log("Hotspot hover end");
  }

	
	
}