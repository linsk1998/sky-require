import path from "path";
import alias from "@rollup/plugin-alias";
export default {
	input: './src/index.js',
	output: {
		strict:false,
		file: './dist/sky-require.compat.js',
		format: 'iife'
	},
	context:"window",
	plugins:[
		alias({
			entries:[
				{ find:"sky-core/utils/getScript" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils-compat/getScript")},
				{ find:"sky-core/utils/getCurrentScript" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils-compat/getCurrentScript")},
				{ find:"sky-core/utils/getCurrentPath" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils-compat/getCurrentPath")},
				{ find:"sky-core/utils" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils")},
				{ find:"sky-core" , replacement: path.resolve(__dirname, "../src/sky-core")}
			]
		})
	]
};