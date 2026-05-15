import {CachedGltf2Node} from './cached-gltf2-node.js';
import {SignNode} from './sign-node.js';
import {Util} from './util.js'

export class HotspotNode extends CachedGltf2Node {
	constructor(options){
		super({url:options.url});

		// All buttons are selectable by default.
		this.selectable = true;
		this._selectHandler = options.callback;
		this.action = options.action;
		this._hovered = false;
		this._hoverT = 0;
		this._originalScale = [1, 1, 1];
		this.text = options.text || null;
		this._signNode = null;
		this._angle = 0;
		this._alwaysShowSign = false;
		if (this.text) {
			this._createSignNode();
		}
		this.textSize = 20;
		console.log("Hotspot created!");
	}	
	
	static create(hotspot, callback, baseDir = null) {
		let url = 'media/gltf/hotspots/arrow_white.glb';

		switch(hotspot.style){
			case "ring":
				url = 'media/gltf/hotspots/ring2.glb';
			break;
			case "custom":
				url = hotspot.customModel;
				if(baseDir) url = baseDir +  url;
			break;
			//case "arrow":
			default:
			break;
		}

		let hotspotNode = new HotspotNode({url:url,callback:callback, action:hotspot.action, text:hotspot.text});
		hotspotNode.translation = hotspot.translation;
		hotspotNode.rotation = Util.convertRotation(hotspot.rotation);
		if(hotspot.textSize){
			hotspotNode.textSize = hotspot.textSize;
		}
		hotspotNode._originalScale = hotspotNode.scale = hotspot.scale;

		//hotspotNode.action = hotspot.action;
		hotspotNode.id = hotspot.id;

		return hotspotNode;
	}
	
	_createSignNode() {
		this._signNode = new SignNode(this.text, {
		  fontSize: 64,
		  background: 'rgba(0,0,0,0.75)',
		  color: 'white',
		  padding: 20
		});

		// Initial unsichtbar
		if(!this._alwaysShowSign)
			this._signNode.visible = false;

		// Position relativ zum Hotspot:
		// 1.6 m Augenhöhe + etwas Abstand nach oben
		this._signNode.translation = [0, 0.15, 0];

		// Als Kind hinzufügen, damit es sich mit dem Hotspot bewegt
		this.addNode(this._signNode);
  }
  
	set rotation(value) {
		// 1. Originalverhalten behalten
		super.rotation = value;

		if (this._signNode && value) {

			// Quaternion: [x, y, z, w]
			const x = value[0];
			const y = value[1];
			const z = value[2];
			const w = value[3];

			// inverse rotation
			const inv = [-x, -y, -z, w];
			//this._signNode.rotation = Util.convertRotation([0,0,0], Util.RADIAN);
			this._signNode.rotation = Util.multQ(inv, Util.convertRotation([0,this._angle,0], Util.RADIAN));
			
//			const e = Util.toEuler(value, Util.RADIAN);
//			this._signNode.rotation = Util.convertRotation([-e[0],-e[1] + this._angle,-e[2]], Util.RADIAN);
			
		}
	}
	
	set translation(value) {
		// 1. Originalverhalten behalten
		super.translation = value;

		if (this._signNode && value) {

			// Quaternion: [x, y, z, w]
			const x = value[0];
			const y = value[1];
			const z = value[2];

			this._angle = -(Math.PI/2) - Math.atan2(z, x);
			
			//this._signNode.rotation = Util.convertRotation([0,this._angle,0], Util.RADIAN);
		}
	}
	
	set scale(value) {

		super.scale = value;

		if (this._signNode && value) {
			const [x1,y1,z1] = this._signNode.originalScale;
			const [x2,y2,z2] = value;
			const s = this.textSize;
			
			this._signNode.scale = [s*x1/x2,s*y1/y2,s*z1/z2];
		}
	}

	get scale(){
		return this._scale;
	}
  
	
  onHoverStart() {
    this._hovered = true;
	this._originalScale = this.scale;
	this.scale = this._originalScale.map(x => x * 1.1);
	
	if (this._signNode && !this._alwaysShowSign) {
      this._signNode.visible = true;
    }
	
	console.log("Hotspot hover start");
  }

  onHoverEnd() {
    this._hovered = false;
	this.scale = this._originalScale;

	if (this._signNode && !this._alwaysShowSign) {
      this._signNode.visible = false;
    }


	console.log("Hotspot hover end");
  }

	
	
}