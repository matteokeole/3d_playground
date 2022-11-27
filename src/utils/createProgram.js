import {SHADER_PATH} from "../../public/constants.js";

/**
 * Returns a WebGLProgram made from the fetched sources.
 * 
 * @async
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexPath
 * @param {string} fragmentPath
 * @returns {array.<{program: WebGLProgram, vertexShader: WebGLShader, fragmentShader: WebGLShader}>}
 */
export async function createProgram(gl, [vertexPath, fragmentPath]) {
	const
		program = gl.createProgram(),
		vertexShader = await createShader(gl, vertexPath, gl.VERTEX_SHADER),
		fragmentShader = await createShader(gl, fragmentPath, gl.FRAGMENT_SHADER);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	return [program, vertexShader, fragmentShader];
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