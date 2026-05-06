import {CachedGltf2Node} from './cached-gltf2-node.js';

export class HotspotNode extends CachedGltf2Node {
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
	
  static create(hotspot, callback) {
	  
		let url = 'media/gltf/hotspots/arrow2.glb';
		
		switch(hotspot.style){
			case "ring":
				url = 'media/gltf/hotspots/ring.glb';
			break;
			//case "arrow":
			default:
			break;
		}
	  
		let hotspotNode = new HotspotNode({url:url,callback:callback});
		hotspotNode.rotation = HotspotNode.convertRotation(hotspot.rotation);
		hotspotNode.translation = hotspot.translation;
		hotspotNode._originalScale = hotspotNode.scale = hotspot.scale;
		hotspotNode.action = hotspot.action;
    return hotspotNode;
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