## Rendering the GUI above the scene

### Proposition:
Use an OffscreenCanvas to draw the GUI on updates. At each frame, the scene renderer draws a textured quad in front of the camera with the GUI canvas content.  
__Flexible__ because we have access to the Canvas API.  
__Efficient__ because the final drawing is done by the WebGL context.

### Pros:
- [*minecraftgui*](https://github.com/matteokeole/minecraftgui) and [*canvasprinter*](https://github.com/matteokeole/canvasprinter) can be reused since they use the Canvas API.
- OffscreenCanvas doesn't rely on the DOM.
- The 2D context is called only when the GUI content does change.
- WebGL can quickly draw the GUI on a single quad. This can be repeated each frame to help the browser do less composition.
- The GUI can be done in a separated worker (cost of 60 messages/s?).

### Cons:
- How to make a shader that can draw both 3D cubes and 2D planes? *Make two different shaders and switch programs each frame OR after the instanced meshes, draw a GUI quad with an orthogonal camera matrix.*
- How to pass efficiently the canvas content to the WebGL context every frame? *The GUI texture is created only once and is replaced every time the GUI does update.*
- OffscreenCanvas support is ~75%.

***

## Compositing the GUI

### Proposition:
Each GUI layer has its own canvas. The composition is made by a *Compositor* singleton, which creates the final image by adding the layers (sorted by z-index). The image is then stored inside a dedicated canvas accessible by the renderer within the game loop.
The composition occurs when a change is detected in a layer. The canvases used for the composition are defined on initialization, but can be changed later.

### Pros:
- Layers are all OffscreenCanvases, including the composited layer.
- Simple architecture.

### Cons:
- Performance cost of recompositing the GUI on frequent updates (e.g. for a text input, on a key press).

***

## Single-canvas GUI

### Proposition:
Avoid the compositing by having only one canvas for the entire GUI. Layers become abstract objects and are sorted by their *priority* property before rendering. When a component is updated, all the components on its position and on the layers above its are redrawn. The GUI is fully redrawn on resize events (debounced).

### Pros
- No more compositing since it's done on the spot.
- Reduces the number of active canvases to 2: the GUI OffscreenCanvas and the renderer canvas.
- This canvas can use WebGL to improve performance when drawing the entire GUI after a resize event.

### Cons
- All the GUI components needs to be reviewed and optimized for a single canvas use.
- How to determine which component is above another, using abstract layers?

***

## Add documentation

***

## Project structure

- /
	- assets/
		- css/
			- main.css
	- index.html