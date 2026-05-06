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
  }

  _ensurePromise() {
    if (!this._promise) {
      this._promise = new Promise((resolve, reject) => {
        this._resolver = resolve;
        this._rejecter = reject;
      });
    }
    return this._promise;
  }

  waitForComplete() {
    return this._ensurePromise();
  }
}