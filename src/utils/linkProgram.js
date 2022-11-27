/**
 * Links a WebGLProgram to a WebGL2RenderingContext.
 * Throws errors if the link status is invalid.
 * 
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 * @throws {Error}
 */
export function linkProgram(gl, program, vertexShader, fragmentShader) {
	gl.linkProgram(program);

	if (gl.getProgramParameter(program, gl.LINK_STATUS)) return;

	let log;

	if ((log = gl.getShaderInfoLog(vertexShader)).length !== 0) {
		throw Error(`VERTEX SHADER ${log}`);
	}

	if ((log = gl.getShaderInfoLog(fragmentShader)).length !== 0) {
		throw Error(`FRAGMENT SHADER ${log}`);
	}
}