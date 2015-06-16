/*
 * simpledemo.js
 * ?
 *
 * Jonatan H Sundqvist
 * June 16 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



$(document).ready(function() {
	//
	var canvas  = $('#cvs')[0];
	var context = createContext(canvas);
	var program = shaders.programFromSourceFiles(context, 'vertexshader.txt', 'pixelshader.txt');
});



function createContext(canvas) {
	//
	var gl;
	try {
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		console.log('Created 3D context.');
		return gl;
	} catch (e) {
		if (!gl) {
			console.error('Download a modern browser, you fossil!');
			return undefined;
		} else {
			console.error('Something weird just happened.');
			return undefined;
		}
	}
}