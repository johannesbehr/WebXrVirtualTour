import {Scene, WebXRView} from './../render/scenes/scene.js';
import {Renderer, createWebGLContext} from './../render/core/renderer.js';
import {VirtualTour} from './virtual-tour.js';
import {SkyboxNode} from './../render/nodes/skybox.js';
import {WebXRButton} from './../util/webxr-button.js';
import {InlineViewerHelper} from './../util/inline-viewer-helper.js';
//import {Gltf2Node} from './../render/nodes/gltf2.js';
import {HotspotNode} from './hotspot-node.js';
	

export class VirtualTourScene extends Scene {

  /**
   * @param {VirtualTour} tour
   */
  constructor(tour) {
    super();

	this.skybox = null;
	this.currentRoom = null;
	this.tour = null;
	this.xrButton = null;
	this.gl = null;
	this.inlineViewerHelper = null;
	this.xrImmersiveRefSpace = null;
	this.enableStats(false);

	this.hotspots = [];
	
	/**
     * Die zugrunde liegende Virtual Tour (Datenmodell)
     * @type {VirtualTour}
     */
	if(tour instanceof VirtualTour){
		 this.tour = tour;
	}
	else {
		console.log(typeof tour);
      throw new Error("VirtualTourScene erwartet eine Instanz von VirtualTour!");
    }

	for(let i = 0; i< 5; i++){
				//let hotspot = new Gltf2Node({url: 'media/gltf/hotspots/arrow2.glb'});
		let hotspot = new HotspotNode(
		{url:'media/gltf/hotspots/arrow2.glb',
		callback:()=>this.hotspot_onClick(hotspot)});
		this.hotspots.push(hotspot);
/*
		hotspot.rotation = [0,0.707,0,0.707 ];
		hotspot.translation = [0, -10, 20];
		hotspot.scale = [40, 40, 40];
		this.addNode(hotspot);

		let hotspot3 = new HotspotNode('media/gltf/hotspots/arrow2.glb',()=>this.hotspot_onClick());
		hotspot3.rotation = [0,0.707,0,0.707 ];
		hotspot3.translation = [0, -10, 10];
		hotspot3.scale = [40, 40, 40];
		this.addNode(hotspot3);
		
		//let hotspot = new Gltf2Node({url: 'media/gltf/hotspots/arrow2.glb'});
		let hotspot2 = new HotspotNode('media/gltf/hotspots/arrow2.glb',()=>this.hotspot_onClick());
		//hotspot2.rotation = [0,0.707,0,0.707 ];
		hotspot2.translation = [0, -1, 20];
		hotspot2.scale = [40, 40, 40];
		this.addNode(hotspot2);

		// 0: Schwebt in der Luft vor dem Auge
		// -10: Ungefär auf dem Boden
*/
		
	}


 
	this.loadRoom(tour.startRoomId);
	
	console.log("Virtual Tour started.");
	
  }
  
  static async create(tourUrl) {
    const json = await fetch(tourUrl).then(r => r.json());
	const tour = new VirtualTour(json);
    return new VirtualTourScene(tour);
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
  
  
  /* =========================
   Raum anzeigen
========================= */

	loadRoom(roomId) {
		const room = this.tour.getRoom(roomId);
		this.currentRoom = room;

		let imgUrl = "tourdata/" + room.image;
		this.changeSkybox(imgUrl);
		
		this.skybox.rotation = VirtualTourScene.convertRotation(room.rotation);
		
		
		
		
		let i = 0;
		room.hotspots.forEach(h => {
			let hotspot = this.hotspots[i];
			hotspot.rotation = VirtualTourScene.convertRotation(h.rotation);
			hotspot.translation = h.translation;
			hotspot._originalScale = hotspot.scale = h.scale;
			hotspot.action = h.action;

			this.addNode(hotspot);
			i++;
		});

		// Remove other hotspots from scene
		for(;i<this.hotspots.length;i++){
			this.removeNode(this.hotspots[i]);
		}
		
		// Debug-Ausgabe		
		console.log("Aktueller Raum:", room);
	}

	changeSkybox(newUrl){
		if(this.skybox!=null){
			this.removeNode(this.skybox);
		}

		this.skybox = new SkyboxNode({
		url: newUrl,
		displayMode: 'mono'
		});

		this.addNode(this.skybox);
	}


	onRequestSession() {
		return navigator.xr.requestSession('immersive-vr').then((session) => {
		 this.xrButton.setSession(session);
		 session.isImmersive = true;
		 this.onSessionStarted(session);
		});
	}

	onSessionEnded(event) {
		if (event.session.isImmersive) {
		 this.xrButton.setSession(null);
		}
	}
	
	onEndSession(session) {
		session.end();
	}

	initXR() {
	  this.xrButton = new WebXRButton({
		onRequestSession: this.onRequestSession.bind(this),
		onEndSession: this.onEndSession.bind(this)
	  });

	  document.querySelector('header').appendChild(this.xrButton.domElement);

	  if (navigator.xr) {
		navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
		  this.xrButton.enabled = supported;
		});

		navigator.xr.requestSession('inline')
		  .then((session) => this.onSessionStarted(session));
	  }
	}

	onSessionStarted(session) {
		
		session.addEventListener('end',(e) => this.onSessionEnded(e));

		
		session.addEventListener('select', (ev) => {
          let refSpace = ev.frame.session.isImmersive ?
                           this.xrImmersiveRefSpace :
                           this.inlineViewerHelper.referenceSpace;
          this.handleSelect(ev.inputSource, ev.frame, refSpace);
        });
				
		this.initGL();
		this.inputRenderer.useProfileControllerMeshes(session);

		let glLayer = new XRWebGLLayer(session, this.gl);
		session.updateRenderState({ baseLayer: glLayer });

		// When rendering 360 photos/videos you want to ensure that the user's
		// head is always at the center of the rendered media. Otherwise users
		// with 6DoF hardware could walk towards the edges and see a very skewed
		// or outright broken view of the image. To prevent that, we request a
		// 'position-disabled' reference space, which suppresses any positional
		// information from the headset. (As an added bonus this mode may be
		// more power efficient on some hardware!)
		let refSpaceType = session.isImmersive ? 'local' : 'viewer';
		session.requestReferenceSpace(refSpaceType).then((refSpace) => {
		 if (session.isImmersive) {
			this.xrImmersiveRefSpace = refSpace;
		 } else {
			this.inlineViewerHelper = new InlineViewerHelper(this.gl.canvas, refSpace);
		 }
		 session.requestAnimationFrame((time, frame) => this.onXRFrame(time,frame));
		});
	}

	onXRFrame(time, frame) {
		let session = frame.session;
		let refSpace = session.isImmersive ?
							 this.xrImmersiveRefSpace :
							 this.inlineViewerHelper.referenceSpace;
		let pose = frame.getViewerPose(refSpace);

		this.startFrame();

		session.requestAnimationFrame((time, frame) => this.onXRFrame(time, frame));

		let glLayer = session.renderState.baseLayer;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, glLayer.framebuffer);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		if (pose) {
		 let views = [];
		 for (let view of pose.views) {
			let renderView = new WebXRView(view, glLayer);

			// It's important to take into account which eye the view is
			// associated with in cases like this, since it informs which half
			// of the stereo image should be used when rendering the view.
			renderView.eye = view.eye
			views.push(renderView);
		 }

		/*
		// Update the matrix for each box
        for (let box of boxes) {
          let node = box.node;
          mat4.identity(node.matrix);
          //mat4.translate(node.matrix, node.matrix, box.position);
          //mat4.rotateX(node.matrix, node.matrix, time/1000);
          //mat4.rotateY(node.matrix, node.matrix, time/1500);
          mat4.scale(node.matrix, node.matrix, box.scale);
        }*/

		 this.updateInputSources(frame, refSpace);
		 this.drawViewArray(views);
		}

		this.endFrame();
	}

	initGL() {
		if (this.gl)
		 return;

		this.gl = createWebGLContext({
		 xrCompatible: true
		});
		document.body.appendChild(this.gl.canvas);


		window.addEventListener('resize', () => this.onResize());
		this.onResize();

		this.setRenderer(new Renderer(this.gl));
	}

	hotspot_onClick(sender){
		console.log("Hotspot clicked!");
		let action = sender.action;
		if(action){
			if (action.type === "changeRoom") {
				let nextRoom = action.targetRoomId;
				console.log("Next Room:", nextRoom);
				this.loadRoom(nextRoom);
			}else if(action.type ==="script"){
				const fn = new Function(action.script);
				fn.call(this);
			}
		}
	}
	
	onResize() {
		 this.gl.canvas.width = this.gl.canvas.clientWidth * window.devicePixelRatio;
		 this.gl.canvas.height = this.gl.canvas.clientHeight * window.devicePixelRatio;
	}

  
}