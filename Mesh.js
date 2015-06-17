/*
 * Mesh.js
 * Encapsulates a set of buffers and attributes needed to render a single mesh.
 *
 * None
 * June 17 2015
 *

 * TODO | - Custom shaders (?)
 *        - Load from file (cf. WaveFront)
 *        - Change geometry at runtime
 *        - Textures and materials
 *        - Index buffers
 *        - Separate physics attributes/logic (eg. create a Body type)
 *        - Queries, metadata (volume, collisions, boolean operations, contours, etc.)
 *
 *        - Inheritance
 *          -- Common solids and 2D shapes (triangle, rectangle, block, cube, sphere, cone, cylinder, dodecahedron, etc.)
 *
 *        - Robustness
 *          -- Logging and debugging
 *          -- Type-checking, function signatures

 * SPEC | -
 *        -
 *
 */



 var OldMesh = function (context, shape, x, y, z) {

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


};



var Mesh = function(context, data, position, rotation) {

	//
	// var texture = context.createBuffer(data.texture, 2)
	var vertices = context.createBuffer(data.vertices, 3); //
	var colours  = context.createBuffer(data.colours,  4); //

	var primitive = context.context.TRIANGLES; // Triangles by default

	var position = position || [0.0, 0.0, 0.0];
	var rotation = rotation || [0.0, 0.0, 0.0];


	// Physics and animation
	// this.r = [0.0, 0.0, 0.0]; /* Rotation (radians) */
	// this.v = [0.0, 0.0, 0.0]; /* Velocity (units per second) */
	// this.a = [0.0, 0.0, 0.0]; /* Acceleration (units per second per second) */
	// this.ω = [0.0, 0.0, 0.0]; /* Angular velocity (radians per second) */
	
	// this.m = 1.0;


	this.render = function(modelview, projection) { context.renderVertices(this.vertices, this.colours, this.rotation, this.position, modelview, projection); }

	// this.addColour = function (rgb) {}
	// this.addTexture = function (path) {}

}