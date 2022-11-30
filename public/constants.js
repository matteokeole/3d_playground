export const
	SHADER_PATH = "assets/shaders/",
	TEXTURE_PATH = "assets/textures/",
	IMAGES = {},
	TEXTURES = {},
	FRAMES_PER_SECOND = 10,
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
		resizeDelay: 50,
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
	WINDOW = {
		width: 0, // Calculated on resize
		height: 0, // Calculated on resize
	},
	MAX_CALL_STACK_SIZE = 120557,
	keys = new Set(),
	PLAYER_HEIGHT = 1.8,
	SENSITIVITY = 1100,
	VELOCITY = .15,
	VELOCITY_SQRT1_2 = VELOCITY * Math.SQRT1_2,
	CAMERA_LERP_FACTOR = .7,
	SCALE = .85,
	NOISE_AMPLITUDE = 12,
	NOISE_INC = .05;