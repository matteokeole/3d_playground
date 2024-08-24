import {Shader} from "../../../Shader/index.js";
import {ProgramLinkingError, ShaderCompilationError} from "../Error/index.js";

export class WebGLShader extends Shader {
	static #VERSION_DIRECTIVE_REGEXP = /(?<version>#version\s+?\d+\s+?\w+)(?<source>[\S\s]*)/;
	static #VERTEX_SHADER_IDENTIFIER = "VERTEX_SHADER";
	static #FRAGMENT_SHADER_IDENTIFIER = "FRAGMENT_SHADER";

	#context;
	#vertexShader;
	#fragmentShader;
	#program;
	#isFirstBind;

	/**
	 * @param {WebGL2RenderingContext} context
	 * @param {String} source
	 */
	constructor(context, source) {
		super();

		const execArray = WebGLShader.#VERSION_DIRECTIVE_REGEXP.exec(source);
		const versionDirective = execArray[1];
		const postVersionDirectiveSource = execArray[2];
		const vertexShaderSource = `${versionDirective}\n#define ${WebGLShader.#VERTEX_SHADER_IDENTIFIER}${postVersionDirectiveSource}`;
		const fragmentShaderSource = `${versionDirective}\n#define ${WebGLShader.#FRAGMENT_SHADER_IDENTIFIER}${postVersionDirectiveSource}`;

		this.#context = context;
		this.#vertexShader = this.#createShader(this.#context.VERTEX_SHADER, vertexShaderSource);
		this.#fragmentShader = this.#createShader(this.#context.FRAGMENT_SHADER, fragmentShaderSource);
		this.#program = this.#createProgram(this.#vertexShader, this.#fragmentShader);
		this.#isFirstBind = true;
	}

	destructor() {
		this.#context.detachShader(this.#program, this.#vertexShader);
		this.#context.deleteShader(this.#vertexShader);

		this.#context.detachShader(this.#program, this.#fragmentShader);
		this.#context.deleteShader(this.#fragmentShader);

		this.#context.deleteProgram(this.#program);
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

	bind() {
		if (!this.#isFirstBind) {
			return;
		}

		this.#isFirstBind = false;

		if (!this.#context.getProgramParameter(this.#program, this.#context.LINK_STATUS)) {
			if (!this.#context.getShaderParameter(this.#vertexShader, this.#context.COMPILE_STATUS)) {
				const log = this.#context.getShaderInfoLog(this.#vertexShader);

				this.destructor();

				throw new ShaderCompilationError(log);
			}

			if (!this.#context.getShaderParameter(this.#fragmentShader, this.#context.COMPILE_STATUS)) {
				const log = this.#context.getShaderInfoLog(this.#fragmentShader);

				this.destructor();

				throw new ShaderCompilationError(log);
			}

			const log = this.#context.getProgramInfoLog(this.#program);

			this.destructor();

			throw new ProgramLinkingError(log);
		}
	}

	/**
	 * @param {GLenum} type
	 * @param {String} source
	 */
	#createShader(type, source) {
		const shader = this.#context.createShader(type);

		this.#context.shaderSource(shader, source);
		this.#context.compileShader(shader);

		return shader;
	}

	/**
	 * @param {globalThis.WebGLShader} vertexShader
	 * @param {globalThis.WebGLShader} fragmentShader
	 */
	#createProgram(vertexShader, fragmentShader) {
		const program = this.#context.createProgram();

		this.#context.attachShader(program, vertexShader);
		this.#context.attachShader(program, fragmentShader);
		this.#context.linkProgram(program);

		return program;
	}
}