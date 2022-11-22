export const
	SHADER_PATH = "assets/shaders/",
	TEXTURE_PATH = "assets/textures/",
	TEXTURES = {},
	FRAMES_PER_SECOND = 165,
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
	keys = new Set(),
	SENSITIVITY = 1100,
	VELOCITY = .04,
	VELOCITY_SQRT1_2 = VELOCITY * Math.SQRT1_2;