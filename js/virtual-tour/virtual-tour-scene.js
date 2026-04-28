import {Scene, WebXRView} from './../render/scenes/scene.js';
import {Renderer, createWebGLContext} from './../render/core/renderer.js';
import {VirtualTour} from './virtual-tour.js';
import {SkyboxNode} from './../render/nodes/skybox.js';
import {WebXRButton} from './../util/webxr-button.js';
import {InlineViewerHelper} from './../util/inline-viewer-helper.js';


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


    if (!(tour instanceof VirtualTour)) {
      throw new Error("VirtualTourScene erwartet eine Instanz von VirtualTour");
    }

    /**
     * Die zugrunde liegende Virtual Tour (Datenmodell)
     * @type {VirtualTour}
     */
    this.tour = tour;

 
	this.loadRoom(tour.startRoomId);
	
	console.log("Virtual Tour started.");
	
  }
  
  /* =========================
   Raum anzeigen
========================= */

	loadRoom(roomId) {
		const room = this.tour.getRoom(roomId);
		this.currentRoom = room;

		let imgUrl = "tourdata/" + room.image;
		this.changeSkybox(imgUrl);
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

/*
        session.addEventListener('selectstart',(e) =>  this.onSelectStart(e));
        session.addEventListener('selectend',(e) =>  this.onSelectEnd(e));

        // By listening for the 'select' event we can find out when the user has
        // performed some sort of primary input action and respond to it.
        session.addEventListener('select', onSelect);

        session.addEventListener('squeezestart', onSqueezeStart);
        session.addEventListener('squeezeend', onSqueezeEnd);
        session.addEventListener('squeeze', onSqueeze);
*/
		

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
	
	onResize() {
		 this.gl.canvas.width = this.gl.canvas.clientWidth * window.devicePixelRatio;
		 this.gl.canvas.height = this.gl.canvas.clientHeight * window.devicePixelRatio;
	}

  
}