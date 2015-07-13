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
	context.loadShaders({ vertex: shaderpath + 'phong-vertex.txt', pixel: shaderpath + 'phong-pixel.txt' }).then(function(context) {

		var tick = function(dt, frame) {
			var π = Math.PI; //
			var ω = π/4;       // Radians per second
			// scene.uniforms.light = [5*Math.cos(dt*frame*ω/(2*π)), 20, 5*Math.sin(dt*frame*ω/(2*π))];
			// scene.uniforms.light = [(dt*frame)%100, 17, 0];
			scene.uniforms.light = [[-5, 30, -5],
			                        [ 5, 30, -5],
			                        [ 5, 30,  5],
			                        [-5, 30,  5]][Math.floor(frame/100)%4];

			scene[scene.orbindex].body.p = [scene.uniforms.light[0], scene.uniforms.light[1]-5, scene.uniforms.light[2]];
			// console.log(scene.uniforms.light, π, ω, dt, frame);
			// console.log(dt, frame, dt*frame),
			scene.map(function(entity) { entity.animate(dt); });
		}

		var render  = createRenderer(context, scene, { modelview: modelview, projection: projection});
		var animate = createAnimator(tick, render);

		requestAnimationFrame(animate);

	});

}



function attachListeners(context, scene) {

	//
	
	// Mesh dropdown
	var dropdown = $('#shapes');
	var solids = {
		cube     : new Mesh(context, shapes.cube(1.8), 'cube'),
		box      : new Mesh(context, shapes.box(2.0, 1.2, 0.9), 'box'),
		sphere   : new Mesh(context, shapes.sphere(1.0, palette.chartreuse), 'sphere'),
		cone     : new Mesh(context, shapes.cone(1.0, 1.2, palette.chartreuse), 'cone'),		
		pyramid  : new Mesh(context, shapes.pyramid(2.0, 1.2, 1.9), 'pyramid'),
		cylinder : new Mesh(context, shapes.cylinder(1.0, 1.2, palette.chartreuse), 'cylinder')
	};

	Object.keys(solids).map(function(shape) { dropdown.append('<option value="' + shape + '">' + shape + '</option>'); });

	for (var model of ['king.obj', 'villa.obj', 'OBJTest2.obj', 'minecraft1.obj', 'gingerbreadhouse.obj']) {
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
										angular:      [0, 0,  0],
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
		scene.uniforms.camera.rotation = [4*π*(e.pageY-offset.top)/$(this).width(), 4*π*(e.pageX-offset.left)/$(this).height(), 0.0];
	});

	// Arrow navigation
	$(document).keydown(function(e) {
		var delta = 0.15;
		if (e.which === KeyEvent.DOM_VK_LEFT) {
			scene[index].body.p[0] -= delta;
		} else if (e.which === KeyEvent.DOM_VK_RIGHT) {
			scene[index].body.p[0] += delta;
		} else if (e.which === KeyEvent.DOM_VK_UP) {
			scene[index].body.p[2] += delta;
		} else if (e.which === KeyEvent.DOM_VK_DOWN) {
			scene[index].body.p[2] -= delta;
		}
	});

}



function createScene(context) {

	//
	var scene = [];

	var light = [1.0, 25.0, 1.0];
	var orb   = new Mesh(context, shapes.sphere(3), 'orb');
	scene.orbindex = scene.push(new Entity({ mass: 1.0, velocity: [0,0,0], acceleration: [0,0,0], angular: [0,2,0], position: light, rotation: [0,0,0], mesh: orb })) - 1;

	scene.uniforms = { camera: new Camera(), light: light };

	return scene;

	
}



function createAnimator(tick, render) {

	//
	// NOTE: Animate should not be called directly (invoke it via requestAnimationFrame)
	var clock = undefined;
	var frame = 0;

	function animate(time) {
		// TODO: Move scene updates to separate function (✓)
		var dt = (time-(clock || time))*0.001; // Time delta (seconds)
		tick(dt, frame);                       //
		render();                              //
		requestAnimationFrame(animate);        // Schedule the next frame
		clock = time;                          // 
		frame++;
	}

	return animate;

}



function createRenderer(context, scene, uniforms) {

	//
	$.extend(scene.uniforms, uniforms); //

	var render = function(time) {

		// 
		// console.log('Rendering...');
		// TODO: Who should be responsible for setting the texture (?)

		context.clear(uniforms.modelview, uniforms.projection);   // Clear the frame and reset matrices
		scene.map(function(entity) {
			// Draw stuff
			scene.uniforms.texture = (entity.mesh.textures||[null])[0];
			entity.render(scene.uniforms);
		});

	};

	return render;

};