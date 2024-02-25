# 3D WebGL playground

### Setup

```sh
$ git clone git@github.com:matteokeole/3d_playground --recurse-submodules
```

### Controls

| Action | Key |
| --- | --- |
| Walk forward | `W` |
| Walk backward | `S` |
| Strafe left | `A` |
| Strafe right | `D` |
| Fly up | `Space` |
| Fly down | `LeftCtrl` |

### Resources

3D:
- https://webgl2fundamentals.org
- https://xem.github.io/articles/webgl-guide.html
- https://www.youtube.com/watch?v=lCSNhq1oAFo&t=51s
- https://www.youtube.com/watch?v=OVQxTNd2U3w&t=1220s
- https://www.mamboleoo.be/articles/how-to-render-3d-in-2d-canvas
- https://www.sitepoint.com/building-3d-engine-javascript

Measures and methods for defining environments:
- https://developer.valvesoftware.com/wiki/.vmf
- https://developer.valvesoftware.com/wiki/Dimensions_(Half-Life_2_and_Counter-Strike:_Source)

### WebGPU TypeScript types

Add the following to `jsconfig.json`:
```json
{
	"compilerOptions": {
		"checkJs": true,
		"target": "ESNext",
		"typeRoots": [
			"<home directory>/node_modules/@webgpu/types"
		]
	}
}
```