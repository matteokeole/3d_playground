export function Scene() {
	// this.background = background.normalized;
	this.meshes = new Set();
	this.directionalLight = null;
}

Scene.prototype.add = function(...meshes) {
	const {length} = meshes;

	for (let i = 0; i < length; i++) {
		this.meshes.add(meshes[i]);
	}
};

Scene.prototype.remove = function(...meshes) {
	const {length} = meshes;

	for (let i = 0; i < length; i++) {
		this.meshes.delete(meshes[i]);
	}
};