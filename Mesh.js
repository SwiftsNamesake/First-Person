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
 *
 * SPEC | -
 *        -
 *
 */



var Mesh = function(context, data, position, rotation) {

	//
	// TODO: Accept single object as argument (?)
	// var texture = context.createBuffer(data.texture, 2)
	this.vertices = context.createBuffer(data.vertices, 3); //
	this.colours  = context.createBuffer(data.colours,  4); //
	// console.log(this.vertices, this.colours)

	this.primitive = context.context.TRIANGLES; // Triangles by default

	this.position = position || [0.0, 0.0, 0.0];
	this.rotation = rotation || [0.0, 0.0, 0.0];


	this.render = function(modelview, projection) { context.renderVertices(this.vertices, this.colours, this.rotation, this.position, modelview, projection); }

	// this.addColour = function (rgb) {}
	// this.addTexture = function (path) {}

}