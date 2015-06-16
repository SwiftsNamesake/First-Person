/*
 * simpledemo.js
 * ?
 *
 * Jonatan H Sundqvist
 * June 16 2015
 *

 * TODO | - Progress bars (eg. for shaders and assets) (?)
 *        - Animation, proper way of dealing with state and time

 * SPEC | -
 *        -
 *
 */



$(document).ready(function() {
	//
	var canvas  = $('#cvs')[0];
	console.log(canvas);
	var context = createContext(canvas);
	// var program = 
	shaders.programFromSourceFiles(context, 'vertexshader.txt', 'pixelshader.txt').then(function(program) {
		context.useProgram(program);

		program.vertexPositionAttribute = context.getAttribLocation(program, 'aVertexPosition');
		context.enableVertexAttribArray(program.vertexPositionAttribute);

		program.vertexColourAttribute = context.getAttribLocation(program, 'aVertexColor');
		context.enableVertexAttribArray(program.vertexColourAttribute)

		program.pMatrixUniform = context.getUniformLocation(program, 'uPMatrix');
		program.mvMatrixUniform = context.getUniformLocation(program, 'uMVMatrix');

		render(context);
	});
});



function createContext(canvas) {
	//
	var context;
	try {
		context = canvas.getContext('experimental-webgl');
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;
		console.log('Created 3D context.');
		return context;
	} catch (e) {
		if (!context) {
			console.error('Download a modern browser, you fossil!');
			return undefined;
		} else {
			console.error('Something weird just happened.');
			return undefined;
		}
	}
}


var colour = [0, 0, 0, 1.0];
var frame = 0;

function render(context) {

	/**/
	frame++;

	// context.clearColor(colour[0], colour[1], colour[2], colour[3])
	context.clearColor((Math.cos(frame*0.003)+1)*0.5, (Math.cos(frame*0.0005)+1)*0.5, 0.8, 1.0);

	/* Clear the screen */
	console.log('Rendering...');
	context.viewport(0, 0, context.viewportWidth, context.viewportHeight);
	context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

	/* Update perspective matrix */
	// mat4.perspective(45, context.viewportWidth/context.viewportHeight, 0.1, 100.0, pMatrix);
	// mat4.identity(mvMatrix);

	// context.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	// context.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

	/* Draw the meshes */
	// for (var i = 0; i < scene.length; i++) {
		// scene[i].draw(shaderProgram);
	// };

	requestAnimationFrame(function() {render(context);}); // TODO: Move this statement

};