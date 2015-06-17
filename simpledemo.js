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
	var context = createContext(canvas);

	var modelview  = mat4.create(); //
	var projection = mat4.create(); //
	
	var vertices = createBuffer(context, [[-1, 0, 0],
		                                  [ 0, 2, 0],
		                                  [ 1, 0, 0]].flatten(), 3);
	var colours  = createBuffer(context, [[ 1, 0, 0, 1],
		                                  [ 1, 0, 0, 1],
		                                  [ 1, 1, 0, 1]].flatten(), 4);

	// var program = 
	shaders.programFromSourceFiles(context, 'vertexshader.txt', 'pixelshader.txt').then(function(program) {
		context.useProgram(program);

		// This part is specific to the shaders we're using.
		program.vertexPositionAttribute = context.getAttribLocation(program, 'aVertexPosition');
		context.enableVertexAttribArray(program.vertexPositionAttribute);

		program.vertexColourAttribute = context.getAttribLocation(program, 'aVertexColor');
		context.enableVertexAttribArray(program.vertexColourAttribute)

		program.pMatrixUniform  = context.getUniformLocation(program, 'uPMatrix');
		program.mvMatrixUniform = context.getUniformLocation(program, 'uMVMatrix');

		createRenderer(context, program, modelview, projection, [{'vertices': vertices, 'colours': colours}])();
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



function createBuffer(context, data, itemsize) {
	
	//
	
	var buffer = context.createBuffer();
	buffer.itemsize = itemsize;
	buffer.size     = data.length / buffer.itemsize;

	context.bindBuffer(context.ARRAY_BUFFER, buffer);
	context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);

	return buffer;

}



function setMatrixUniforms(context, program, modelview, projection) {
	// Specific to our current shaders
	context.uniformMatrix4fv(program.pMatrixUniform, false, projection);
	context.uniformMatrix4fv(program.mvMatrixUniform, false, modelview);
}



function renderBuffer(context, vertexbuffer, colourbuffer, rotation, translation, modelview, projection, program) {

	//
	mat4.identity(modelview);
	mat4.translate(modelview, translation);
	mat4.rotate(modelview, rotation[0], [1, 0, 0]);
	mat4.rotate(modelview, rotation[1], [0, 1, 0]);
	mat4.rotate(modelview, rotation[2], [0, 0, 1]);

	//
	context.bindBuffer(context.ARRAY_BUFFER, vertexbuffer);
	context.vertexAttribPointer(program.vertexPositionAttribute, vertexbuffer.itemsize, context.FLOAT, false, 0, 0);
		
	context.bindBuffer(context.ARRAY_BUFFER, colourbuffer);
	context.vertexAttribPointer(program.vertexColourAttribute, colourbuffer.itemsize, context.FLOAT, false, 0, 0);
	
	// console.log(context, vertexbuffer, colourbuffer, vertexbuffer.size);
	setMatrixUniforms(context, program, modelview, projection);
	context.drawArrays(context.TRIANGLES, 0, vertexbuffer.size);

}



function animate(dt) {

	//

}



function configure(context, program) {

	//
	gl.enable(gl.DEPTH_TEST);

	//
	// TODO: Rename function
	// This needs some explaining (related to shader programs)
	program.vertexPositionAttribute = context.getAttribLocation(program, 'aVertexPosition');
	context.enableVertexAttribArray(program.vertexPositionAttribute);

	program.vertexColourAttribute = context.getAttribLocation(program, 'aVertexColor');
	context.enableVertexAttribArray(program.vertexColourAttribute);

	program.pMatrixUniform = context.getUniformLocation(program, 'uPMatrix');
	program.mvMatrixUniform = context.getUniformLocation(program, 'uMVMatrix');

}



function createRenderer(context, program, modelviewMatrix, projectionMatrix, buffers) {

	//
	var frame = 0;

	var render = function() {

		// 
		console.log('Rendering...');

		/**/
		frame++;

		context.clearColor(0.0, 0.35, 0.42, 1.0); // This is the colour (rgba) that will be used to 'clear' the colour buffer

		/* Clear the screen */
		// console.log('Rendering...');
		context.viewport(0, 0, context.viewportWidth, context.viewportHeight); // Set the extent of the viewport
		context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);    // Clear the depth and colour buffers

		/* Update perspective matrix */
		mat4.perspective(45, context.viewportWidth/context.viewportHeight, 0.1, 100.0, projectionMatrix);
		mat4.identity(modelviewMatrix);

		// context.uniformMatrix4fv(program.pMatrixUniform, false, projectionMatrix); //
		// context.uniformMatrix4fv(program.mvMatrixUniform, false, modelviewMatrix); //

		/* Draw stuff */
		for (var i = 0; i < buffers.length; i++) {
			mat4.identity(modelviewMatrix);
			renderBuffer(context, buffers[i].vertices, buffers[i].colours, [0, frame/60, 0], [0, 0, -frame/60], modelviewMatrix, projectionMatrix, program);
		}

		/* Schedule the next frame */
		requestAnimationFrame(render); // TODO: Move this statement

	};

	return render;

};