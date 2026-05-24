import {Scene, WebXRView} from './../render/scenes/scene.js';
import {Renderer, createWebGLContext} from './../render/core/renderer.js';
import {VirtualTour} from './virtual-tour.js';
import {SkyboxNode} from './../render/nodes/skybox.js';
import {WebXRButton} from './../util/webxr-button.js';
import {InlineViewerHelper} from './../util/inline-viewer-helper.js';
import {HotspotNode} from './hotspot-node.js';
import {SignNode} from './sign-node.js';
import {Util} from './util.js'


export class VirtualTourScene extends Scene {

  /**
   * @param {VirtualTour} tour
   */
  constructor(tour) {
    super();

	this.skybox = null;
	this.currentViewPoint = null;
	this.tour = null;
	this.xrButton = null;
	this.gl = null;
	this.inlineViewerHelper = null;
	this.xrImmersiveRefSpace = null;
	this.enableStats(false);
	
	this.sign = null;

	this.hotspots = [];
	
	if(tour.url){
		this.baseDir = tour.url.substring(0, tour.url.lastIndexOf("/") + 1);
	}
	
	
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

/*
	for(let i = 0; i< 5; i++){
				//let hotspot = new Gltf2Node({url: 'media/gltf/hotspots/arrow2.glb'});
		let hotspot = new HotspotNode(
		//{url:'media/gltf/hotspots/arrow2.glb',
		{url:'media/gltf/hotspots/ring.glb',
		callback:()=>this.hotspot_onClick(hotspot)});
		this.hotspots.push(hotspot);
	}
*/
	// Hotspot Pool
	// - release => back to pool
	// - request(style) => get one from Pool. All proberties will be set to default!
	
	// Alternativ: den Loader irgenwie cachen?
	// Verbesserte Version des Gltf2Node der den Loader recycled.
	// Problem: Gltf2Node nutzt jedes Mal einen neuen Loader und läd ein häufig benötigtes Objekt immer wieder.
	// Ziel ist es, diesen Teil zu cachen oder wiederzuverwenden, damit wenn häufig ein gleiches Objekt erstellt wird, an dieser Stelle keine Redundanz besteht.
	//Denkbar wäre z.B. eine Art cache, die sich die urls merkt und bei gleicher url den Loader wiederverwendet.
	
	// Ich nutze die Klasse Gltf2Node zum darstellen von Pfeilen in einer virtuellen 360 Grad Tour. Die aktuelle implementierung hat den Nachteil, dass sie das Modell immer wieder neu läd. Ich möchte den gltf2-Loader cachen, so dass er wiederverwendet wird, wenn die gleiche Url angefordert wird. 
	// Bitte erstelle mir dazu eine neue Klasse CachedGltf2Node, als Muster gebe ich dir hier die original Gltf2Node:
	
	this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	this.soundCache = {};
	
	
	this.loadViewPoint(tour.startPointId);
	
	console.log("Virtual Tour started.");
	
  }
  
  static async create(tourUrl) {
    const json = await fetch(tourUrl).then(r => r.json());
	const tour = new VirtualTour(json);
	tour.url = tourUrl;
	
    return new VirtualTourScene(tour);
  }
    
async loadSound(url) {
    if (this.soundCache[url]) return this.soundCache[url];

    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(buf);

    this.soundCache[url] = audioBuffer;
    return audioBuffer;
}

async playSound(url) {
	
	if(this.baseDir) url = this.baseDir +  url;
    if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
    }

    const buffer = await this.loadSound(url);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
}
  
  /* =========================
   Raum anzeigen
========================= */

	loadViewPoint(viewPointId) {
		const viewPoint = this.tour.getViewPoint(viewPointId);
		this.currentViewPoint = viewPoint;

		// Set the new Skybox for the viewPoint
		let url = viewPoint.image;
		if(this.baseDir) url = this.baseDir +  url;
		this.changeSkybox(url);
		this.skybox.rotation = Util.convertRotation(viewPoint.rotation);
		
		// Remove all old hotspotNodes
		this.hotspots.forEach(h => { this.removeNode(h);});
		this.hotspots = [];
		
		// Create new HotspotNodes to hotspots in viewPoint
		viewPoint.hotspots.forEach(h => {
			let hotspot = HotspotNode.create(h,()=>this.hotspot_onClick(h), this.baseDir);
			
			
			this.addNode(hotspot);
			this.hotspots.push(hotspot);
		});


		this.removeNode(this.sign);
		this.sign = new SignNode(viewPoint.title, {fontSize: 196});
		this.sign.translation = [0, 1.1, -4];
		this.addNode(this.sign);

		// Debug-Ausgabe		
		console.log("Aktueller Raum:", viewPoint);
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

		
		let renderer = new Renderer(this.gl);
		renderer.globalLightDir = [0.2, -1.0, 0.2];
        renderer.globalLightColor = [7.0, 7.0, 8.0];
		this.setRenderer(renderer);
						
	}

	hotspot_onClick(sender){
		console.log("Hotspot clicked!");
		
		let action = sender.action;
		if(action){
			if (action.type === "changeViewPoint") {
				let nextViewPoint = action.targetViewPointId;
				console.log("Next ViewPoint:", nextViewPoint);
				this.loadViewPoint(nextViewPoint);
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