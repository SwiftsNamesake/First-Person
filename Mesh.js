/*
 * Mesh.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



 var Mesh = function (context, shape, x, y, z) {

 	/* TODO: Passing vectors as arguments */
 	/* ISSUE: How to manage external data (eg. scene, transformation matrix) */

 	/* Geometry methods */
 	this.initBufferData = function (type) {
 		/* Initializes the JavaScript array buffers before passing them on to OpenGL */
 		/* TODO: Replace the default pyramid model with something more flexible */
 		/* ISSUE: Should Mesh be inherited from to create specific shapes? */
		var v = { 'BL': [-1.0, -1.0, -1.0],		// Back left
				  'BR': [ 1.0, -1.0, -1.0],		// Back right
				  'FL': [-1.0, -1.0,  1.0],		// Front left
				  'FR': [ 1.0, -1.0,  1.0],		// Front right
				  'TM': [ 0.0,  1.0,  0.0]};	// Top middle

		var colours = [ [1.0, 0.0, 0.0, 1.0],	// Front face
						[1.0, 1.0, 0.0, 1.0],	// Right face
						[0.0, 1.0, 0.0, 1.0],	// Back face
						[1.0, 0.0, 1.0, 1.0],	// Left face
						[0.0, 1.0, 0.8, 1.0],	// Bottom 1
						[0.0, 1.0, 0.8, 1.0]];	// Bottom 2

		return { 'colour': comprehension(colours, function(e) { return e.concat(e,e); } ).flatten(),
				 'vertex': [ v['TM'], v['FL'], v['FR'],
						     v['TM'], v['BL'], v['BR'],
						     v['TM'], v['FL'], v['BL'],
						     v['TM'], v['FR'], v['BR'],
						     v['FL'], v['BL'], v['FR'],
						     v['FR'], v['BL'], v['BR'] ].flatten()
		}[type];

	}


	this.createMesh = function(shape, contour) {
		
		/* Essentially the same as initBufferData, except that it creates a slightly different model */
		/* Its main purpose is experimentation */

		// Configurations
		var s = 180;	// Sides
		var h = 0.3;	// Height

		// Geometry
		var vb = [];	// Bottom vertices
		var vl;			// Lid vertices

		// Colour
		var cb = []; // Colours for the bottom vertices
		var cl = []; // Colours for the lid vertices

		var c = [[0.8, 0.2, 0.2, 1.0],	// 
				 [0.2, 0.8, 0.2, 1.0],	// 
				 [0.2, 0.2, 0.8, 1.0],	// 
				 [1.0, 0.0, 0.0, 1.0],	// Red
				 [0.0, 1.0, 0.0, 1.0],	// Green
				 [0.0, 0.0, 1.0, 1.0],	// Blue
				 [0.5, 0.0, 0.0, 1.0],	// 
				 [0.0, 0.5, 0.0, 1.0],	// 
				 [0.0, 0.0, 0.5, 1.0],	// 
				 [0.2, 1.0, 1.0, 1.0],	// 
				 [1.0, 0.5, 0.3, 1.0],	// 
				 [0.1, 0.6, 0.2, 1.0],	// 
				 [1.0, 1.0, 0.4, 1.0],	// 
				 [0.6, 0.5, 0.8, 1.0],	// 
				 [1.0, 0.2, 0.7, 1.0],	// 
				 [1.0, 0.0, 1.0, 1.0],	// 
				 [0.0, 1.0, 0.0, 1.0],	// 
				 [0.0, 0.2, 1.0, 1.0]]; // 

		for (var i = 0; i < s; i++) {
			var angle = i*2*π/s;
			var radius = 1.0;//Math.sin(angle*6) + 0.5;

			vb.push([radius*Math.cos(angle), 0.0, radius*Math.sin(angle)]);
			cb.push([1.0, 1.0, 0.0, 1.0]);
		}
		
		vl = vb.map(function (v) { return [ v[0], h, v[2] ]; });
		cl = cb.map(function (c) { return [0.0, 1.0, 1.0, 1.0]; });

		var vertices = [];
		var colours = [];

		var mb = [0.0, 0.0, 0.0];	// Middle bottom
		var ml = [0.0, h, 0.0];		// Middle lid

		for (var i = 0; i < s; i++) {
			
			vertices.push(vb[i], vl[(i+1)%s], vb[(i+1)%s]); // First triangle
			vertices.push(vb[i], vl[i], vl[(i+1)%s]); 		// Second triangle

			vertices.push(vb[i], vb[(i+1)%s], mb); // Bottom triangle
			vertices.push(vl[i], vl[(i+1)%s], ml); 	// Lid triangle
			/*
			vertices.push(vl[i], ml, vb[i]); // Left side first
			vertices.push(vb[i], ml, mb); // Left side second

			vertices.push(vl[(i+1)%s], ml, vb[(i+1)%s]); // Right side first
			vertices.push(vb[(i+1)%s], ml, mb); // Right side second
			*/
			// Colours
			cside 	= c[0];
			cbottom = c[1];
			clid 	= c[2];

			colours.push(cside, cside, cside,		// Colours for first side triangle
						 cside, cside, cside,		// Colours for second side triangle
						 cbottom, cbottom, cbottom,	// Colours for bottom triangle
						 clid, clid, clid);			// Colours for lid triangle
						 //c[0], c[0], c[0],		// 
						 //c[0], c[0], c[0],		// 
						 //c[2], c[2], c[2],		// 
						 //c[2], c[2], c[2]);		// 

		}

		vertices = vertices.flatten();
		colours = (contour ? colours.map(function (rgb) { return [0.0, 0.0, 0.0, 1.0]; }) : colours).flatten();
		return {'vertex': vertices , 'colour': colours }[shape];

	}



	this.createCube = function (type) {

		var v = {};

		for (var x = 0.0; x < 2.0; x++) {
			for (var y = 0.0; y < 2.0; y++) {
				for (var z = 0.0; z < 2.0; z++) {
					v['LR'[x]+'BT'[y]+'FB'[z]] = [x*2-1,y*2-1,z*2-1];
				}
			}
		}

		var c = [[1.0, 0.0, 0.0, 1.0],
				 [0.0, 1.0, 1.0, 1.0],
				 [0.4, 0.2, 0.7, 1.0],
				 [0.0, 1.0, 0.0, 1.0],
				 [0.0, 0.0, 1.0, 1.0],
				 [0.0, 0.7, 0.5, 1.0]];

		var vertices = [
			v['RBF'], v['LBF'], v['LTF'], v['RBF'], v['LTF'], v['RTF'], // Front face
			v['RBB'], v['LBB'], v['LTB'], v['RBB'], v['LTB'], v['RTB'], // Back face
			v['LBF'], v['LTF'], v['LBB'], v['LTF'], v['LBB'], v['LTB'], // Left face
			v['RBF'], v['RTF'], v['RBB'], v['RTF'], v['RBB'], v['RTB'], // Right face
			v['LTF'], v['RTF'], v['LTB'], v['RTF'], v['LTB'], v['RTB'], // Top face
			v['LBF'], v['RBF'], v['LBB'], v['RBF'], v['LBB'], v['RBB']  // Bottom face
		];

		var colours = [];//vertices.map(function (v) { return v[0]==0.0?c[0]:c[1]; });
			
		for (var i = 0; i < 6; i++) {
			colours.push(c[i], c[i], c[i], c[i], c[i], c[i]);
		}

		return ({ 'vertex': vertices, 'colour': colours}[type]).flatten();

	}



	this.initBuffer = function (type, array) {
		/* Initializes the OpenGL buffers with our vertex and colour data */
		/* TODO: Textures */
		var glBuffer = context.createBuffer();
		var data;

		if (array !== undefined) {
			data = array;
		} else {
			data = { 'vertex': this.vertices, 'colour': this.colours }[type]
			if (data === undefined) {
				console.log('Invalid buffer type.');
				return;
			}
		}

		//console.log(data);
		context.bindBuffer(context.ARRAY_BUFFER, glBuffer)
		context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);

		return glBuffer;

	}



	/* Surface methods */
	this.addColour = function (rgb) {
		
	}



	this.addTexture = function (path) {
		
	}
	


	/* Physics and animation methods */
	this.rotate = function (x, y, z) {
		this.r[0] += x;
		this.r[1] += y;
		this.r[2] += z;
	}



	this.translate = function (x, y, z) {
		this.p[0] += x;
		this.p[1] += y;
		this.p[2] += z;
	}



	this.accelerate = function (x, y, z) {
		this.v[0] += x;
		this.v[1] += y;
		this.v[2] += z;
	}



	this.moveTo = function (x, y, z) {
		this.p = [x, y, z]
	}



	this.setAcceleration = function (x, y, z) {
		this.a = [x, y, z];
	}



	this.setVelocity = function (x, y, z) {
		this.v = [x, y, z];
	}



	this.setRotation = function (x, y, z) {
		this.r = [x, y, z];
	}



	this.animate = function (seconds) {
		/* Animates the mesh based on its velocity (v), acceleration (a) and angular velocity (ω) */
		this.accelerate(this.a[0]*seconds, this.a[1]*seconds, this.a[2]*seconds);
		this.translate(this.v[0]*seconds, this.v[1]*seconds, this.v[2]*seconds);
		this.rotate(this.ω[0]*seconds, this.ω[1]*seconds, this.ω[2]*seconds);
	}



	this.draw = function (program, modelview, projection) {
		/* Renders the mesh */
		mat4.identity(modelview)
		mat4.translate(modelview, this.p);
		mat4.rotate(modelview, this.r[0], [1, 0, 0]);
		mat4.rotate(modelview, this.r[1], [0, 1, 0]);
		mat4.rotate(modelview, this.r[2], [0, 0, 1]);

		context.bindBuffer(context.ARRAY_BUFFER, this.vertexBuffer);
		context.vertexAttribPointer(program.vertexPositionAttribute, this.vertexSize, context.FLOAT, false, 0, 0);
		
		context.bindBuffer(context.ARRAY_BUFFER, this.colourBuffer);
		context.vertexAttribPointer(program.vertexColourAttribute, this.colourSize, context.FLOAT, false, 0, 0);
		
		SetMatrixUniforms(); // TODO: How to deal with shaders generically (when the uniforms aren't known in advance)
		context.drawArrays(this.primitive, 0, this.vertexNumber);

		// Draw contours
		//context.bindBuffer(context.ARRAY_BUFFER, this.contourColourBuffer);
		//context.vertexAttribPointer(program.vertexColourAttribute, this.colourSize, context.FLOAT, false, 0, 0);
		//context.drawArrays(this.LINE_STRIP, 0, this.vertexNumber);

	}



	/* Motion */
	this.p = [x, y, z];			/* Position (units) */
	this.r = [0.0, 0.0, 0.0];	/* Rotation (radians) */
	this.v = [0.0, 0.0, 0.0];	/* Velocity (units per second) */
	this.a = [0.0, 0.0, 0.0];	/* Acceleration (units per second per second) */
	this.ω = [0.0, 0.0, 0.0];	/* Angular velocity (radians per second) */
	
	/* Physics */
	this.m = 1.0;

	/* Array buffers */
	this.vertices 	= this.createCube('vertex');//this.createMesh('vertex');	//this.initBufferData('vertex');
	this.colours 	= this.createCube('colour');//this.createMesh('colour');	//this.initBufferData('colour');
	this.texture 	= undefined;

	/* Contours */
	this.contourColours  = this.createMesh('colour', true);	//this.initBufferData('colour');
	this.contourColourBuffer = this.initBuffer('colour', this.contourColours);

	/* OpenGL buffers */
	this.vertexBuffer 	= this.initBuffer('vertex');
	this.colourBuffer	= this.initBuffer('colour');
	this.textureBuffer 	= undefined;

	/* Settings */
	/* ISSUE: Dealing with index arrays */
	/* ISSUE: How to acquire GL context */
	this.primitive = [context.TRIANGLES, context.TRIANGLE_STRIP, context.LINE_STRIP, context.LINES][0];
	this.vertexSize = 3; 			/* Items per vertex in the vertex array */
	this.colourSize = 4; 			/* Items per colour in the colour array */
	//this.textureSize = undefined;
	//this.vertexSize = 3;
	this.vertexNumber = this.vertices.length / this.vertexSize;
	
	/* Shaders */
	this.useCustomShaders = false;
	this.vShader = undefined;
	this.pShader = undefined;

};