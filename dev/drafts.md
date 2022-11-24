## Rendering the GUI on top of the scene

### Proposition:
Use an OffscreenCanvas to draw the GUI on updates. At each frame, the scene renderer draws a textured quad in front of the camera with the GUI canvas content.
<u>Flexible</u> because we have access to the Canvas API.
<u>Efficient</u> because the final drawing is done by the WebGL context.

### Pros:
- [*minecraftgui*](https://github.com/matteokeole/minecraftgui) and [*canvasprinter*](https://github.com/matteokeole/canvasprinter) can be reused since they use the Canvas API.
- OffscreenCanvas doesn't rely on the DOM.
- The 2D context is called only when the GUI content does change.
- WebGL can quickly draw the GUI on a single quad. This can be repeated each frame to help the browser do less composition.
- The GUI can be done in a separated worker (but will the worker messages be cheap?).

### Cons:
- This doesn't completely solve the layer issues.
- May need an OrthographicCamera to draw the quad. How to use 2 different cameras at the same time without losing performance?
- OffscreenCanvas support is ~75%.
- How to pass efficiently the canvas content to the WebGL context... every frame?

***

## Add documentation through GitHub wiki page