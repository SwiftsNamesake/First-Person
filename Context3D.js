/*
 * Context3D.js
 * Enhances the plain WebGL context object with auxiliary methods (mostly boilerplate)
 *
 * None
 * June 17 2015
 *

 * TODO | - Use 'global' matrices or accept them as arguments (matrix stack) (?)
 *        - 

 * SPEC | -
 *        -
 *
 */



var Context3D = function(canvas) {

	//
	// TODO: Make certain methods and attributes private (eg. create)
	// TODO: Set plain context object as prototype (?)



	//
	this.create = function(canvas) {

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

	};



	this.configure = function() {

		//
		this.context.enable(this.context.DEPTH_TEST);

		//
		this.context.clearColor(0.0, 0.35, 0.42, 1.0);

		//
		// TODO: Rename function
		// This needs some explaining (related to shader programs)
		this.program.vertexPositionAttribute = this.context.getAttribLocation(this.program, 'aVertexPosition');
		this.context.enableVertexAttribArray(this.program.vertexPositionAttribute);

		this.program.vertexColourAttribute = this.context.getAttribLocation(this.program, 'aVertexColor');
		this.context.enableVertexAttribArray(this.program.vertexColourAttribute);

		this.program.pMatrixUniform = this.context.getUniformLocation(this.program, 'uPMatrix');
		this.program.mvMatrixUniform = this.context.getUniformLocation(this.program, 'uMVMatrix');

	}
	


	this.loadShaders = function(shaderpaths) {

		//
		var self = this; // We can't use 'this' directly inside the callback

		//
		return shaders.programFromSourceFiles(this.context, shaderpaths.vertex, shaderpaths.pixel).then(function(program) {
			
			//
			self.program = program;                //
			self.context.useProgram(self.program); //

			// This part is specific to the shaders we're using.
			self.program.vertexPositionAttribute = self.context.getAttribLocation(self.program, 'aVertexPosition');
			self.context.enableVertexAttribArray(self.program.vertexPositionAttribute);

			self.program.vertexColourAttribute = self.context.getAttribLocation(self.program, 'aVertexColor');
			self.context.enableVertexAttribArray(self.program.vertexColourAttribute)

			self.program.pMatrixUniform  = self.context.getUniformLocation(self.program, 'uPMatrix');
			self.program.mvMatrixUniform = self.context.getUniformLocation(self.program, 'uMVMatrix');

			self.configure();

			return self;

		});

	}



	this.createBuffer = function(data, itemsize) {

		//
		
		var buffer = this.context.createBuffer();
		buffer.itemsize = itemsize;
		buffer.size     = data.length / buffer.itemsize;

		this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(data), this.context.STATIC_DRAW);

		return buffer;

	};



	this.setMatrixUniforms = function(modelview, projection) {
		// Specific to our current shaders
		this.context.uniformMatrix4fv(this.program.mvMatrixUniform, false, modelview);  //
		this.context.uniformMatrix4fv(this.program.pMatrixUniform,  false, projection); // 
	}


	
	this.clear = function (modelview, projection) {
		
		//
		// TODO: Rename (eg. prepare, newframe, etc.)
		// console.log('Rendering...');
		// console.log(modelview, projection)

		/* Clear the screen */
		this.context.viewport(0, 0, this.context.viewportWidth, this.context.viewportHeight); // Set the extent of the viewport
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);    // Clear the depth and colour buffers

		/* Update perspective matrix */
		mat4.perspective(45, this.context.viewportWidth/this.context.viewportHeight, 0.1, 100.0, projection);
		mat4.identity(modelview);

	}



	this.renderVertices = function(vertexbuffer, colourbuffer, rotation, translation, modelview, projection) {
		
		//
		// TODO: Allow other primitives, textures, etc. (accept primitive 'mesh' object as argument?)
		
		//
		mat4.identity(modelview);
		mat4.translate(modelview, translation);
		mat4.rotate(modelview, rotation[0], [1, 0, 0]);
		mat4.rotate(modelview, rotation[1], [0, 1, 0]);
		mat4.rotate(modelview, rotation[2], [0, 0, 1]);

		//
		this.context.bindBuffer(this.context.ARRAY_BUFFER, vertexbuffer);
		this.context.vertexAttribPointer(this.program.vertexPositionAttribute, vertexbuffer.itemsize, this.context.FLOAT, false, 0, 0);
			
		this.context.bindBuffer(this.context.ARRAY_BUFFER, colourbuffer);
		this.context.vertexAttribPointer(this.program.vertexColourAttribute, colourbuffer.itemsize, this.context.FLOAT, false, 0, 0);
		
		// console.log(this.context, vertexbuffer, colourbuffer, vertexbuffer.size);
		this.setMatrixUniforms(modelview, projection);
		this.context.drawArrays(this.context.TRIANGLES, 0, vertexbuffer.size);

	};


	//
	this.context = this.create(canvas); //
	// this.program = _;                   //

}