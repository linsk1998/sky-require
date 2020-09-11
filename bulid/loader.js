export default {
	input: './src/index.js',
	output: {
		strict:false,
		file: './dist/loader.js',
		format: 'iife',
		globals: { 'sky-core': 'Sky' }
	},
	external: ['sky-core'], 
	context:"window"
};