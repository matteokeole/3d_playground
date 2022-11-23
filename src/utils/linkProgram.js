import {SHADER_PATH} from "../../public/constants.js";

/**
 * Creates and links a WebGLProgram to a WebGL2RenderingContext.
 * 
 * @async
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexPath
 * @param {string} fragmentPath
 * @returns {WebGLProgram}
 */
export async function linkProgram(gl, [vertexPath, fragmentPath]) {
	const
		program = gl.createProgram(),
		vertexShader = await createShader(gl, vertexPath, gl.VERTEX_SHADER),
		fragmentShader = await createShader(gl, fragmentPath, gl.FRAGMENT_SHADER);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		let log;

		if ((log = gl.getShaderInfoLog(vertexShader)).length !== 0) console.error("VERTEX SHADER", log);
		if ((log = gl.getShaderInfoLog(fragmentShader)).length !== 0) console.error("FRAGMENT SHADER", log);

		return;
	}

	return program;
}

/**
 * Fetches, compiles and returns a WebGLShader.
 * 
 * @async
 * @param {WebGL2RenderingContext} gl
 * @param {string} shaderPath
 * @param {number} shaderType
 * @returns {WebGLShader}
 */
async function createShader(gl, shaderPath, shaderType) {
	const shader = gl.createShader(shaderType);

	gl.shaderSource(shader, await (await fetch(SHADER_PATH + shaderPath)).text());
	gl.compileShader(shader);

	return shader;
}