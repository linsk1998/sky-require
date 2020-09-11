import path from "path";
import alias from "@rollup/plugin-alias";
export default {
	input: './src/index.js',
	output: {
		strict:false,
		file: './dist/sky-require.modern.js',
		format: 'iife'
	},
	context:"window",
	plugins:[
		alias({
			entries:[
				{ find:"sky-core/utils/getScript" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils-modern/getScript")},
				{ find:"sky-core/utils" , replacement: path.resolve(__dirname, "../node_modules/sky-core/utils")},
				{ find:"sky-core" , replacement: path.resolve(__dirname, "../src/sky-core")}
			]
		})
	]
};