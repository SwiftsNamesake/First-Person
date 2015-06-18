/*
 * simpledemo.js
 * ?
 *
 * Jonatan H Sundqvist
 * June 16 2015
 *

 * TODO | - Progress bars (eg. for shaders and assets) (?)
 *        - Animation, proper way of dealing with state and time
 *        - 

 * SPEC | -
 *        -
 *
 */



$(document).ready(function() {

	//
	var canvas  = $('#cvs')[0];
	var context = new Context3D(canvas);

	// Let the context manage the matrices for us (?)
	var modelview  = mat4.create(); //
	var projection = mat4.create(); //
	
	var triangle  = new Mesh(context, shapes.monochrome([[-1.00,  0.00,  0.00], [0.00, 2.00, -0.25], [1.00, 0.00, 0.00]], [1.00, 1.00, 0.00, 1.00]), [0, 0, 0], [0, 0, 0]);
	var square    = new Mesh(context, shapes.rectangle(1.0, 1.0, [1.00, 0.52, 0.13, 1.00]), [0, 0, 0], [0, 0, 0]);
	var rectangle = new Mesh(context, shapes.rectangle(1.5, 3.2, palette.chartreuse), [0, 0, 0], [0, 0, 0]);

	var cube = new Mesh(context, shapes.cube(0.35), [0, 0, -0.14], [0, 12, 0]);

	var scene = [triangle, square, cube, rectangle];

	context.loadShaders({ vertex: 'vertexshader.txt', pixel: 'pixelshader.txt' }).then(function(context) { createRenderer(context, scene, modelview, projection)(); });

});



function animate(dt) { /**/ }



function createRenderer(context, scene, modelviewMatrix, projectionMatrix) {

	//
	var frame = 0;

	var render = function() {

		// 
		console.log('Rendering...');
		frame++;
		context.clear(modelviewMatrix, projectionMatrix); // Clear the frame and reset matrices

		/* Draw stuff */
		scene.map(function(object) { object.mesh.render(modelviewMatrix, projectionMatrix); });;

		/* Schedule the next frame */
		requestAnimationFrame(render); // TODO: Move this statement

	};

	return render;

};