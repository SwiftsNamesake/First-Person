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

	var modelview  = mat4.create(); //
	var projection = mat4.create(); //
	
	var vertices = context.createBuffer([[-1.00,  0.00,  0.00],
										 [ 0.00,  2.00, -0.25],
										 [ 1.00,  0.00,  0.00]].flatten(), 3);

	var colours  = context.createBuffer([[  0.00,  1.00,  0.00,  1.00],
										 [  1.00,  0.00,  0.00,  1.00],
										 [  1.00,  1.00,  0.00,  1.00]].flatten(), 4);

	// var program = 
	context.loadShaders({ vertex: 'vertexshader.txt', pixel: 'pixelshader.txt'}).then(function(context) {
		createRenderer(context, [{'vertices': vertices, 'colours': colours}], modelview, projection)();
	});

});




function animate(dt) { /**/  }



function createRenderer(context, buffers, modelviewMatrix, projectionMatrix) {

	//
	var frame = 0;

	var render = function() {

		// 
		console.log('Rendering...');
		frame++;
		context.clear(modelviewMatrix, projectionMatrix); // Clear the frame and reset matrices

		/* Draw stuff */
		for (var i = 0; i < buffers.length; i++) {
			context.renderVertices(buffers[i].vertices, buffers[i].colours, [0, frame/60, 0], [0, 0, -frame/60], modelviewMatrix, projectionMatrix);
		}

		/* Schedule the next frame */
		requestAnimationFrame(render); // TODO: Move this statement

	};

	return render;

};