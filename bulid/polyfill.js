import path from "path";
import alias from "@rollup/plugin-alias";
import nodeResolve from '@rollup/plugin-node-resolve';
export default {
	input: './src/polyfill.js',
	output: {
		file: './dist/sky-require.polyfill.js',
		format: 'iife'
	},
	context:"window",
	plugins:[
		nodeResolve(),
		alias({
			entries:{
				'core-js/modules':path.resolve(__dirname, "../node_modules/sky-core/modules")
			}
		})
	]
};