/*
 * simpledemo.js
 * ?
 *
 * Jonatan H Sundqvist
 * June 16 2015
 *

 * TODO | - Progress bars (eg. for shaders and assets) (?)
 *        - Animation, proper way of dealing with state and time (cf. FirstPerson.js for an example)
 *        - 

 * SPEC | -
 *        -
 *
 */



$(document).ready(main);



function main() {

	//
	var canvas  = $('#cvs')[0];
	var context = new Context3D(canvas);

	// Let the context manage the matrices for us (?)
	var modelview  = mat4.create(); //
	var projection = mat4.create(); //
	
	var scene = createScene(context);            //
	var ui    = attachListeners(context, scene); //

	main.scene   = scene;
	main.context = context;

	var shaderpath = 'https://swiftsnamesake.github.io/data/shaders/';
	context.loadShaders({ vertex: shaderpath + 'vertexshader.txt', pixel: shaderpath + 'pixelshader.txt' }).then(function(context) {

		var tick    = function(dt) { scene.map(function(entity) { entity.animate(dt); }); }
		var render  = createRenderer(context, scene, modelview, projection);
		var animate = createAnimator(tick, render);

		requestAnimationFrame(animate);

	});

}



function attachListeners(context, scene) {

	//
	
	// Mesh dropdown
	var dropdown = $('#shapes');
	var solids = {
		cube     : new Mesh(context, shapes.cube(1.8)),
		box      : new Mesh(context, shapes.box(2.0, 1.2, 0.9)),
		sphere   : new Mesh(context, shapes.sphere(1.0, palette.chartreuse)),
		cone     : new Mesh(context, shapes.cone(1.0, 1.2, palette.chartreuse)),		
		pyramid  : new Mesh(context, shapes.pyramid(2.0, 1.2, 1.9)),
		cylinder : new Mesh(context, shapes.cylinder(1.0, 1.2, palette.chartreuse))
	};

	Object.keys(solids).map(function(shape) { dropdown.append('<option value="' + shape + '">' + shape + '</option>'); });
	

	for (var model of ['king.obj', 'villa.obj', 'OBJTest2.obj']) {
		(function(model) {
			var path = 'https://swiftsnamesake.github.io/data/models/';
			var name = model.replace('.obj', '');
			WaveFront.loadMeshes(context, path + model, path).then(function(mesh) {
				solids[name] = mesh;
				dropdown.append('<option value="' + name + '">' + name + '</option>');
			});
		}(model));
	}

	var index = scene.push(new Entity({	mass:         1.0,
										velocity:     [0, 0,  0],
										acceleration: [0, 0,  0],
										angular:      [0, 2,  0],
										position:     [0, 0, -3],
										rotation:     [0, 0,  0],
										mesh:         solids['cube'] })) - 1;

	function shapeSelected(event) {
		// TODO: It seems I still haven't solved the body/mesh syncing problem... (✓)
		scene[index].mesh = solids[event.target.value];
	}

	dropdown.change(shapeSelected);

	// Mouse
	$('#cvs').mousemove(function(e) {
		var offset = $(this).parent().offset();
		scene[index].body.r = [π*(e.pageY-offset.top)/$(this).width(), π*(e.pageX-offset.left)/$(this).height(), 0.0];
	});

}



function createScene(context) {

	//
	var yellow  = new Mesh(context, shapes.monochrome([[-1.00,  0.00,  0.00], [0.00,  2.00, -0.58], [1.00, 0.00, 0.00]], palette.yellow));
	var purple  = new Mesh(context, shapes.monochrome([[-1.00,  0.00,  0.00], [0.00, -2.00, -0.58], [1.00, 0.00, 0.00]], palette.deeppink));
	var square  = new Mesh(context, shapes.rectangle(1.0, 1.0, [1.00, 0.52, 0.13, 1.00]));

	var box     = new Mesh(context, shapes.box(1.2, 2.2, 0.2, undefined));
	var sphere  = new Mesh(context, shapes.sphere(3.2, [0.20, 0.00, 0.95, 1.00]));
	var pyramid = new Mesh(context, shapes.pyramid(0.3, 1.2, 3.2, undefined));

	var cube = new Mesh(context, shapes.cube(0.35, {
		top:    palette.orange,
		bottom: palette.darkred,
		front:  palette.black,
		back:   palette.chartreuse,
		left:   palette.purple,
		right:  palette.darkkhaki }), [0, 0, -0.14], [0, 0, 0]);

	var scene = [new Entity({ mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], position: [0,0,0], rotation: [0,0,0], mesh: yellow }),
	             new Entity({ mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], position: [0,0,0], rotation: [0,0,0], mesh: purple }),
	             new Entity({ mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], position: [0,0,0], rotation: [0,0,0], mesh: square }),
	             new Entity({ mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], position: [0,0,0], rotation: [0,0,0], mesh: cube   }),
	             // new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,0,0], position: [0,0,0], rotation: [0,0,0], mesh: sphere }),
	             // new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,0,0], position: [0,0,0], rotation: [0,0,0], mesh: box     }),
	             new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,0,0], position: [0,0,0], rotation: [0,0,0], mesh: pyramid  })];

	return scene;

	
}



function createAnimator(tick, render) {

	//
	// NOTE: Animate should not be called directly (invoke it via requestAnimationFrame)
	var clock = undefined;

	function animate(time) {
		// TODO: Move scene updates to separate function (✓)
		var dt = (time-(clock || time))*0.001; // Time delta (seconds)
		tick(dt);                              //
		render();                              //
		requestAnimationFrame(animate);        // Schedule the next frame
		clock = time;                          // 
	}

	return animate;

}



function createRenderer(context, scene, modelviewMatrix, projectionMatrix) {

	//

	var render = function(time) {

		// 
		// console.log('Rendering...');
		context.clear(modelviewMatrix, projectionMatrix); // Clear the frame and reset matrices
		scene.map(function(entity) { entity.render(modelviewMatrix, projectionMatrix); }); // Draw stuff

	};

	return render;

};