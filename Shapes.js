/*
 * Shapes.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - Palette defaults (?)
 *        - 

 * SPEC | -
 *        -
 *
 */



var shapes = (function() {

	//
	var shapes = {};

	var somecolours = {'top':    [1.00, 0.00, 0.00, 1.00],
					   'bottom': [0.00, 1.00, 0.00, 1.00],
					   'front':  [0.00, 0.00, 1.00, 1.00],
					   'back':   [0.50, 0.00, 0.00, 1.00],
					   'left':   [0.00, 0.50, 0.00, 1.00],
					   'right':  [0.00, 0.00, 0.50, 1.00]};

	var sides = ['top', 'bottom', 'front', 'back', 'left', 'right']; // This is a constant


	shapes.cube = function(side, palette) {

		//
		// (L|R T|B F|B) => (Left|Right Top|Bottom Front|Back)
		// TODO: Which direction does the Z axis go in (into screen our away from screen)?
		var half    = side/2;
		var palette = palette || somecolours; //

		var unique = [[-half,  half, -half],  // LTF (0)
					  [-half,  half,  half],  // LTB (1)
					  [ half,  half,  half],  // RTB (2)
					  [ half,  half, -half],  // RTF (3)
					  [-half, -half, -half],  // LBF (4)
					  [-half, -half,  half],  // LBB (5)
					  [ half, -half,  half],  // RBB (6)
					  [ half, -half, -half]]; // RBF (7)

		// TODO: This is really a constant (worth caching?)
		var indeces = [0, 1, 3, 3, 1, 2,  // Top    (✓)
					   4, 5, 7, 7, 5, 6,  // Bottom (✓)
					   0, 3, 4, 4, 3, 7,  // Front  (✓)
					   1, 2, 5, 5, 2, 6,  // Back   (✓)
					   0, 1, 4, 4, 1, 5,  // Left   (✓)
					   3, 2, 7, 7, 2, 6]; // Right  (✓)


		var vertices = indeces.map(function(index)    { return unique[index]; });
		var colours  = indeces.map(function(index, i) { return palette[sides[Math.floor(i/6)]]; });

		return { vertices: vertices.flatten(), colours: colours.flatten() }; // TODO: Decide whether to concat buffers or keep them as they are

	};


	shapes.rectangle = function(dx, dy, colour) {

		// A monochrome rectangle parallel to the XY plane
		var hdx = dx/2;
		var hdy = dy/2;

		var vertices = [[-hdx, -hdy, 0.00],
						[-hdx,  hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[-hdx, -hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[ hdx, -hdy, 0.00]].flatten();

		var colours = vertices.map(function(_) { return colour; }).flatten();

		return { vertices: vertices, colours: colours };

	};


	shapes.monochrome = function(vertices, colour) {

		// Creates a monochrome shape.
		return { vertices: vertices.flatten(), colours: vertices.map(function(_) { return colour; }).flatten() };
	};


	return shapes;



}());