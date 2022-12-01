// import {HoverLayer, Splash} from "./gui/layers/index.js";

import {Layer} from "./layers/index.js";
import * as Component from "./components/index.js";
export const GUI = {Layer, Component};
// export {Loader} from "./Loader.js";
// export {Color} from "./Color.js";
// export * as Utils from "./utils/index.js";
// export const ASSET_PATH = "assets/";
// export const FONT_PATH = ASSET_PATH + "font/";
// export const LANG_PATH = ASSET_PATH + "lang/";
// export const TEXTURE_PATH = ASSET_PATH + "textures/";
// export const TEXTURES = new Set();
export const Font = {
	symbolHeight: 8,
	strikethroughY: 3,
	underlineY: 8,
	letterSpacing: 1,
	lineSpacing: 1,
	formatter: {
		prefix: "\u00a7",
		bold: "b",
		color: "c",
		highlight: "h",
		italic: "i",
		reset: "r",
		strikethrough: "s",
		underline: "u",
	},
};
// // Language data
export let Lang = {};
// export let splash;
// export {default as loop} from "./loop.js";

// export const Instance = {
// 	name: "Minecraft",
// 	version: [1, 19, 2],
// 	data: {
// 		lang: null,
// 		mojang_backgrounds: [0xef323d, 0x000000],
// 	},
// 	gui: {
// 		layers: {},
// 	},
// 	window: {
// 		default_width: 320,
// 		default_height: 240,
// 		max_width: screen.width,
// 		max_height: screen.height,
// 		width: null,
// 		height: null,
// 	},
// 	settings: {},
// 	init: function() {
// 		document.title = this.getName();

// 		HoverLayer.init();

// 		splash = new Splash();
// 	},
// 	setup: async function(settings) {
// 		// Setting: "Language"
// 		{
// 			const {language} = settings;

// 			if (this.settings.language !== language) {
// 				this.data.lang = await (await fetch(`${LANG_PATH}${language}.json`)).json();

// 				Lang = this.data.lang;
// 			}
// 		}

// 		// Setting: "GUI Scale"
// 		{
// 			const {gui_scale} = settings;

// 			if (this.settings.gui_scale !== gui_scale) {
// 				Instance.gui.preferred_scale = gui_scale;
// 			}
// 		}

// 		Object.assign(this, {settings});
// 	},
// 	getName: function() {
// 		return `${this.name} ${this.version.join(".")}`;
// 	},
// 	update: () => {},
// 	render: () => {},
// };