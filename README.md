# WebXrVirtualTour

**A lightweight framework for creating and rendering interactive virtual tours using WebXR.**

> ⚠️ **Work in Progress**  
> This project is currently under active development and is **not yet ready for production use**. APIs may change at any time and documentation is incomplete.
>
> But you can test it [here](https://johannesbehr.github.io/WebXrVirtualTour/).

---

## 🧭 Overview

WebXrVirtualTour aims to provide a modular and flexible foundation for building immersive 360° virtual tours that run directly in the browser using WebXR.

The framework is designed with a clear separation between:

- **Data model** (JSON-based tour definitions)
- **Application logic** (navigation, interactions)
- **Rendering layer** (WebXR / WebGL scene)

---

## ✨ Planned Features

- 📦 JSON-based virtual tour structure
- 🏠 Multiple rooms with 360° panoramas
- 🔗 Interactive hotspots (teleport, info, etc.)
- 🎯 Controller-based interaction (raycasting, hover, select)
- 🔄 Room-to-room navigation
- 🎧 Optional spatial audio support
- ⚡ Lightweight and framework-agnostic core

---

## 🏗️ Current Status

Implemented / in progress:

- Basic data model:
  - `VirtualTour`
  - `Room`
  - `Hotspot`
  - `Action` system
- Initial WebXR scene setup
- First interactive hotspot prototype

Missing / not stable yet:

- Stable API
- Complete interaction system
- Proper scene management
- Documentation and examples
- Packaging / distribution

---

## 🚧 Usage

At this stage, the project is **experimental**.

There is no stable API or installation method yet.  
If you want to explore the code, clone the repository and experiment locally:

```bash
git clone https://github.com/your-username/WebXrVirtualTour.git
