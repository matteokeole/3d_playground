export const
	SHADER_PATH = "assets/shaders/",
	TEXTURE_PATH = "assets/textures/",
	IMAGES = {},
	TEXTURES = {},
	FRAMES_PER_SECOND = 165,
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
	SENSITIVITY = 800,
	VELOCITY = .15,
	VELOCITY_SQRT1_2 = VELOCITY * Math.SQRT1_2,
	CAMERA_LERP_FACTOR = .9,
	SCALE = .85, // Required for Minecraft blocks
	NOISE_AMPLITUDE = 12,
	NOISE_INC = .05;