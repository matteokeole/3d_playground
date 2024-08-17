import {Shader} from "./Shader.js";

export class WebGLShader extends Shader {
	static #VERSION_DIRECTIVE_REGEXP = /(?<version>#version\s+?\d+\s+?\w+)(?<source>[\S\s]*)/;

	#vertexShader;
	#fragmentShader;
	#program;

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {String} source
	 * @param {String} name
	 */
	constructor(context, source, name) {
		super(name);

		const execArray = WebGLShader.#VERSION_DIRECTIVE_REGEXP.exec(source);
		const versionDirective = execArray[1];
		const postVersionDirectiveSource = execArray[2];

		this.#vertexShader = this.#createVertexShader(context, versionDirective, postVersionDirectiveSource);
		this.#fragmentShader = this.#createFragmentShader(context, versionDirective, postVersionDirectiveSource);
		this.#program = context.createProgram();
	}

	getVertexShader() {
		return this.#vertexShader;
	}

	getFragmentShader() {
		return this.#fragmentShader;
	}

	getProgram() {
		return this.#program;
	}

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {String} versionDirective
	 * @param {String} postVersionDirectiveSource
	 */
	#createVertexShader(context, versionDirective, postVersionDirectiveSource) {
		const vertexSource = `${versionDirective}\n#define VERTEX_SHADER${postVersionDirectiveSource}`;
		const shader = context.createShader(context.VERTEX_SHADER);

		context.shaderSource(shader, vertexSource);

		return shader;
	}

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {String} versionDirective
	 * @param {String} postVersionDirectiveSource
	 */
	#createFragmentShader(context, versionDirective, postVersionDirectiveSource) {
		const fragmentSource = `${versionDirective}\n#define FRAGMENT_SHADER${postVersionDirectiveSource}`;
		const shader = context.createShader(context.FRAGMENT_SHADER);

		context.shaderSource(shader, fragmentSource);

		return shader;
	}
}