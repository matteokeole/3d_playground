export const
	SHADER_PATH = "assets/shaders/",
	TEXTURE_PATH = "assets/textures/",
	RESOURCES = {},
	TEXTURES = {},
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
	};