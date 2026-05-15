import { Node } from "./../render/core/node.js";
import { QuadNode } from "./../render/nodes/quad-texture.js";
import { UrlTexture } from "./../render/core/texture.js";
import { Material } from "./../render/core/material.js";
import { PrimitiveStream } from "./../render/geometry/primitive-stream.js";
import { Util } from './util.js'

/**
 * Material für dynamische Canvas-Texturen
 */
class CanvasMaterial extends Material {
  constructor() {
    super();

    this.state.blend = true;
    this.map = this.defineSampler("map");
  }

  get materialName() {
    return "CANVAS_MATERIAL";
  }

  get vertexSource() {
    return `
      in vec3 POSITION;
      in vec2 TEXCOORD_0;

      out vec2 vTexCoord;

      vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
        vTexCoord = TEXCOORD_0;
        return proj * view * model * vec4(POSITION, 1.0);
      }
    `;
  }

  get fragmentSource() {
    return `
      uniform sampler2D map;
      in vec2 vTexCoord;

      vec4 fragment_main() {
        return texture(map, vTexCoord);
      }
    `;
  }
}

/**
 * SignNode = Textschild im Raum
 */
export class SignNode extends Node {
  constructor(text, options = {}) {
    super();

    this.text = text;
	this.originalScale =[1,1,1];
    
	this.options = {
      fontSize: 64,
      fontFamily: "Arial",
      padding: 20,
      pixelsPerMeter: 1000,
      background: "rgba(0,0,0,0.7)",
      color: "white",
      borderRadius: 16,
      ...options
    };

    this.canvas = null;
    this.texture = null;

    this._quad = null;
    this._material = null;
    this._renderPrimitive = null;

	console.log("Sign Node created!");


  }

  // -------------------------------------------------------
  // Renderer Hook (wichtig!)
  // -------------------------------------------------------
  onRendererChanged(renderer) {
    this._renderer = renderer;

    this._createCanvasTexture();
    this._createQuad(renderer);
  }

  // -------------------------------------------------------
  // Canvas erzeugen
  // -------------------------------------------------------
  _createCanvasTexture() {
  const opt = this.options;

  const measure = document.createElement("canvas");
  const mctx = measure.getContext("2d");
  mctx.font = `${opt.fontSize}px ${opt.fontFamily}`;

  const metrics = mctx.measureText(this.text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = opt.fontSize;

  this.canvas = document.createElement("canvas");
  this.canvas.width = textWidth + opt.padding * 2;
  this.canvas.height = textHeight + opt.padding * 2;

  const ctx = this.canvas.getContext("2d");

  ctx.font = `${opt.fontSize}px ${opt.fontFamily}`;
  ctx.textBaseline = "top";

  // background
  ctx.fillStyle = opt.background;
  Util.roundRect(
    ctx,
    0,
    0,
    this.canvas.width,
    this.canvas.height,
    opt.borderRadius
  );
  ctx.fill();

  // text
  ctx.fillStyle = opt.color;
  ctx.fillText(this.text, opt.padding, opt.padding);

  // 👉 WICHTIG: statt renderer helper
  const dataUrl = this.canvas.toDataURL("image/png");

  this.texture = new UrlTexture(dataUrl);
  }

  // -------------------------------------------------------
  // Quad + Material
  // -------------------------------------------------------
  _createQuad(renderer) {
    const hs = 0.5;

    const stream = new PrimitiveStream();
    stream.clear();
    stream.startGeometry();

    stream.pushVertex(-hs, hs, 0, 0, 0, 0, 0, 1);
    stream.pushVertex(-hs, -hs, 0, 0, 1, 0, 0, 1);
    stream.pushVertex(hs, -hs, 0, 1, 1, 0, 0, 1);
    stream.pushVertex(hs, hs, 0, 1, 0, 0, 0, 1);

    stream.pushTriangle(0, 1, 2);
    stream.pushTriangle(0, 2, 3);

    stream.endGeometry();

    const primitive = stream.finishPrimitive(renderer);

    this._material = new CanvasMaterial();
    this._material.map.texture = this.texture;

    this._renderPrimitive = renderer.createRenderPrimitive(
      primitive,
      this._material
    );

    this.addRenderPrimitive(this._renderPrimitive);

    // Skalierung nach Textgröße (wichtig!)
    const pxPerMeter = this.options.pixelsPerMeter;

    const w = this.canvas.width / pxPerMeter;
    const h = this.canvas.height / pxPerMeter;

    this.originalScale = this.scale = [w, h, 1];
  }

  // -------------------------------------------------------
  // Text ändern
  // -------------------------------------------------------
  setText(text) {
    this.text = text;

    if (this._renderer) {
      //this.removeRenderPrimitive(this._renderPrimitive);
	  this._renderPrimitive = [];
      this._createCanvasTexture();
      this._createQuad(this._renderer);
    }
  }

	updateBillboard(cameraPosition) {
	//if (!this.billboard) return;

	  const dx = cameraPosition[0] - this.translation[0];
	  const dz = cameraPosition[2] - this.translation[2];

	  const angle = Math.atan2(dx, dz);
	  this.rotation = Util.convertRotation([0, angle, 0], Util.RADIAN);
	}


  // -------------------------------------------------------
  // Utils
  // -------------------------------------------------------

    
}