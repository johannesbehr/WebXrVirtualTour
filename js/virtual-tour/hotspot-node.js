import {CachedGltf2Node} from './cached-gltf2-node.js';
import {SignNode} from './sign-node.js';


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
		if (this.text) {
			this._createSignNode();
		}
		console.log("Hotspot created!");
	}
	
	static convertRotation(inArray) {
	  if(inArray.length==4){
		  return inArray;
	  }else if(inArray.length==3){
		  const [xDeg, yDeg, zDeg] = inArray;

		  // Grad → Radiant
		  const x = xDeg * Math.PI / 180;
		  const y = yDeg * Math.PI / 180;
		  const z = zDeg * Math.PI / 180;

		  const cx = Math.cos(x / 2);
		  const sx = Math.sin(x / 2);
		  const cy = Math.cos(y / 2);
		  const sy = Math.sin(y / 2);
		  const cz = Math.cos(z / 2);
		  const sz = Math.sin(z / 2);

		  const qw = cx * cy * cz + sx * sy * sz;
		  const qx = sx * cy * cz - cx * sy * sz;
		  const qy = cx * sy * cz + sx * cy * sz;
		  const qz = cx * cy * sz - sx * sy * cz;

		  return [qx, qy, qz, qw];
	}else{
			// invalid!
	}
  }
	
	static create(hotspot, callback, baseDir = null) {
		let url = 'media/gltf/hotspots/arrow2.glb';

		switch(hotspot.style){
			case "ring":
				url = 'media/gltf/hotspots/ring.glb';
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
		hotspotNode.rotation = HotspotNode.convertRotation(hotspot.rotation);
		hotspotNode.translation = hotspot.translation;
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
		this._signNode.visible = false;

		// Position relativ zum Hotspot:
		// 1.6 m Augenhöhe + etwas Abstand nach oben
		this._signNode.translation = [0, 0.1, 0];

		// Optional etwas kleiner skalieren
		this._signNode.scale = [1, 1, 1];

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

		this._signNode.rotation = inv;
	  }
	}
  
	
  onHoverStart() {
    this._hovered = true;
	this._originalScale = this.scale;
	this.scale = this.scale.map(x => x * 1.1);
	
	if (this._signNode) {
      this._signNode.visible = true;
    }
	
	console.log("Hotspot hover start");
  }

  onHoverEnd() {
    this._hovered = false;
	this.scale = this._originalScale;

	if (this._signNode) {
      this._signNode.visible = false;
    }


	console.log("Hotspot hover end");
  }

	
	
}