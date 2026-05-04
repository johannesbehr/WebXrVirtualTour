
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
	this._originalScale = this.scale;
	this.scale = this.scale.map(x => x * 1.1);
	console.log("Hotspot hover start");
  }

  onHoverEnd() {
    this._hovered = false;
	this.scale = this._originalScale;
	console.log("Hotspot hover end");
  }

	
	
}