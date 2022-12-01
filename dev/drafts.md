## Rendering the GUI on top of the scene

### Proposition:
Use an OffscreenCanvas to draw the GUI on updates. At each frame, the scene renderer draws a textured quad in front of the camera with the GUI canvas content.
__Flexible__ because we have access to the Canvas API.
__Efficient__ because the final drawing is done by the WebGL context.

### Pros:
- [*minecraftgui*](https://github.com/matteokeole/minecraftgui) and [*canvasprinter*](https://github.com/matteokeole/canvasprinter) can be reused since they use the Canvas API.
- OffscreenCanvas doesn't rely on the DOM.
- The 2D context is called only when the GUI content does change.
- WebGL can quickly draw the GUI on a single quad. This can be repeated each frame to help the browser do less composition.
- The GUI can be done in a separated worker (but will the worker messages be cheap?).

### Cons:
- How to make a shader that can draw both 3D cubes and 2D planes?
- How to pass efficiently the canvas content to the WebGL context every frame?
- OffscreenCanvas support is ~75%

***

## Compositing the GUI

### Proposition:
Each GUI layer has its own canvas. The composition is made by a *Compositor* singleton, which creates the final image by adding the layers (sorted by z-index). The image is then stored inside a dedicated canvas accessible by the renderer within the game loop.
The composition occurs when a change is detected in a layer. The canvases used for the composition are defined on initialization, but can be changed later.

### Pros:
- Layers are all OffscreenCanvases, including the composited layer
- Simple architecture

### Cons:
- Many things to optimize
- Performance cost of recompositing the GUI on frequent updates (e.g. for a text input, on a key press)

***

## Add GitHub wiki