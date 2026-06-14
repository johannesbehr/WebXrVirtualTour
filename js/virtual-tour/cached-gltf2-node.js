// This class is an AI generated modifikation of the class "Gltf2Node". 
// Therefore the following COPYRIGHT is neccessary:

// Copyright 2018 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {Node} from './../render/core/node.js';
import {Gltf2Loader} from './../render/loaders/gltf2.js';

// Loader weiterhin pro Renderer cachen
let gltfLoaderMap = new WeakMap();

// NEU: Cache für geladene GLTFs
// Struktur: WeakMap<renderer, Map<url, Promise<Node>>>
let gltfCache = new WeakMap();

export class CachedGltf2Node extends Node {
  constructor(options) {
    super();
    this._url = options.url;

    this._promise = null;
    this._resolver = null;
    this._rejecter = null;
	this._alpha = 1.0;
  }


	
	

  onRendererChanged(renderer) {
    let loader = gltfLoaderMap.get(renderer);
    if (!loader) {
      loader = new Gltf2Loader(renderer);
      gltfLoaderMap.set(renderer, loader);
    }

    let rendererCache = gltfCache.get(renderer);
    if (!rendererCache) {
      rendererCache = new Map();
      gltfCache.set(renderer, rendererCache);
    }

    // Promise ggf. zurücksetzen
    if (!this._resolver && this._promise) {
      this._promise = null;
    }

    this._ensurePromise();

    let cachedPromise = rendererCache.get(this._url);

    if (!cachedPromise) {
      // Erstes Laden → Promise cachen
      cachedPromise = loader.loadFromUrl(this._url).then((sceneNode) => {
        return sceneNode.waitForComplete().then(() => sceneNode);
      });

      rendererCache.set(this._url, cachedPromise);
    }

    cachedPromise.then((sceneNode) => {
      // WICHTIG: Node klonen, da SceneNodes nicht mehrfach verwendet werden dürfen
      let instance = sceneNode.clone ? sceneNode.clone() : sceneNode;

      this.addNode(instance);

	
	  if (this._alpha !== undefined) {
		 
		 console.log("this._renderPrimitives:"+ this._renderPrimitives);
		 console.log("node._renderPrimitives:"+ instance._renderPrimitives);
		  
		this._applyTransparencyRecursive(instance, this._alpha);
	  }


      this._resolver(instance.waitForComplete());
      this._resolver = null;
      this._rejecter = null;
    }).catch((err) => {
      if (this._rejecter) {
        this._rejecter(err);
      }
      this._resolver = null;
      this._rejecter = null;
    });
	
	console.log("Renderer done:" + renderer);
	
	
  }

  _ensurePromise() {
    if (!this._promise) {
      this._promise = new Promise((resolve, reject) => {
        this._resolver = resolve;
        this._rejecter = reject;
      });
    }

/*	
	if(this._alpha!=1.0){
	console.log("_ensurePromise: _applyTransparencyRecursive");
	  this._applyTransparencyRecursive(this._alpha);
	} */
	
    return this._promise;
  } 

  waitForComplete() {
    return this._ensurePromise();
  }
  
  
  _applyTransparencyRecursive(node, alpha) {


 console.log("_applyTransparencyRecursive");

  // 1. RenderPrimitives dieses Nodes bearbeiten
  if (node._renderPrimitives) {
    for (const p of node._renderPrimitives) {

      const m = p._material;
      if (!m) {
		  console.log("no material");
		  continue;
	  }
	  console.log("material found!");
//console.log(m._baseColorFactor);
console.log(Object.keys(m._program.uniform));
//console.log(this.deepDump(m));
//m._program.setUniform("baseColorFactor", [1, 1, 1, alpha]);
//renderer.setUniform(m._program, "baseColorFactor", [1, 1, 1, alpha]);
      // Alpha-Blending aktivieren
      
	  m._uniform_dictionary.baseColorFactor[3] = alpha;
	  m._program.uniform.baseColorFactor[3] = alpha;
	    m._uniform_dictionary._alphaMode = 'BLEND';
m._samplerDictionary.baseColorTex._renderer._renderPrimitives[0][1]._material._program.uniform.baseColorFactor[3] = alpha;

//m._samplerDictionary.baseColorTex._renderer._renderPrimitives[0][0]._material._uniforms[0].baseColorFactor[3] = alpha;
//m._samplerDictionary.baseColorTex._renderer._renderPrimitives[0][1]._material._uniforms[0].baseColorFactor[3] = alpha;
m._samplerDictionary.baseColorTex._renderer._renderPrimitives[0][0]._material._uniforms[0]._value[3] = alpha;

m._dirty = true;
      // Farbe mit Alpha setzen
      if (m._baseColorFactor) {
        m.baseColorFactor[3] = alpha;
		
      }

      // wichtig für korrektes Rendering in WebGL/XR
      if (m._depthWrite !== undefined) {
        m._depthWrite = false;
      }
    }
  }else{
	for (const child of node.children) {
        this._applyTransparencyRecursive(child, alpha);
    }
	  
  }
}

  setTransparency(alpha) {
	 this._alpha = alpha;
	this._applyTransparencyRecursive(this, alpha);
  }

deepDump(obj, maxDepth = 6) {
  const seen = new WeakSet();

  function walk(value, depth, path) {
    const indent = "  ".repeat(depth);

    if (value === null) return `${indent}${path}: null`;
    if (value === undefined) return `${indent}${path}: undefined`;

    const type = typeof value;

    if (type === "function") {
      return `${indent}${path}: [Function ${value.name || "anonymous"}]`;
    }

    if (type !== "object") {
      return `${indent}${path}: ${value}`;
    }

    if (seen.has(value)) {
      return `${indent}${path}: [Circular]`;
    }

    if (depth > maxDepth) {
      return `${indent}${path}: [MaxDepthReached]`;
    }

    seen.add(value);

    const ctor = value.constructor?.name || "Object";
    let out = `${indent}${path}: {${ctor}}`;

    const keys = Object.keys(value);

    for (const key of keys) {
      try {
        out += "\n" + walk(value[key], depth + 1, key);
      } catch (e) {
        out += `\n${indent}  ${key}: [Error reading]`;
      }
    }

    return out;
  }

  return walk(obj, 0, "root");
}



  
}