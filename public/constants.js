export const
	SHADER_PATH = "assets/shaders/",
	TEXTURE_PATH = "assets/textures/",
	IMAGES = {},
	TEXTURES = {},
	FRAMES_PER_SECOND = 60,
	GUI = {
		defaultWidth: 320,
		defaultHeight: 240,
		width: 0, // Calculated on resize
		height: 0, // Calculated on resize
		screenWidth: screen.width * devicePixelRatio,
		screenHeight: screen.height * devicePixelRatio,
		scale: {
			max: 0, // Calculated on resize
			desired: 2,
			current: 0, // Calculated on resize
		},
		layers: {},
	},
	Keybind = {
		forward: "KeyW",
		backward: "KeyS",
		left: "KeyA",
		right: "KeyD",
		up: "Space",
		down: "ControlLeft",
	},
	keys = new Set(),
	FIELD_OF_VIEW = 90,
	PLAYER_HEIGHT = 1.8,
	SENSITIVITY = 1100,
	VELOCITY = .15,
	VELOCITY_SQRT1_2 = VELOCITY * Math.SQRT1_2,
	CAMERA_LERP_FACTOR = .7,
	/** @todo Remove this constant */
	SCALE = .85,
	NOISE_AMPLITUDE = 12,
	NOISE_INC = .05;