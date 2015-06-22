/*
 *
 * FirstPerson.js
 * My first attempt at creating a first-person
 * 
 * Jonatan Sundqvist
 * January 3 2014
 *
 * Interactive experience using WebGL
 
 * SPEC | -
 *        -
 
 * TODO | - Break up functionality into several scripts
 *          -- Matrix math (role my own or stick with mat4?)
 *          -- Shaders
 *          -- OpenGL boilerplate (context, configurations, etc.)
 *        - Naming scheme (uppercase/lowercase, camelcase, etc.)
 *
 *        - Data bundles (eg. Point, Colour)
 *
 */



$(document).ready(main);



function main() {

	// The cookie is a lie!
	document.cookie = 'username=Gottlob Frege;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	document.cookie = 'stress=acute;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	// console.log(document.cookie.split(';'));
	
	// Graphics
	var canvas  = $('#cvs')[0];          // Complete
	var context = new Context3D(canvas); // Complete

	// Matrices
	var projection = mat4.create(); // Perspective matrix
	var modelview  = mat4.create();	// Model-view matrix

	context.loadShaders({ vertex: 'shaders/vertexshader.txt', pixel: 'shaders/pixelshader.txt' }).then(function(context) {

		var scene = InitWorld(context);    // 
		InitUserInterface(context, scene); // 

		main.scene   = scene;
		main.context = context;

		render  = createRenderer(context, scene, modelview, projection); // 
		animate = createAnimator(scene, render);                         // 
		requestAnimationFrame(animate);                                  // Kick off the animation;

	});

}



function InitUserInterface(context, scene) {

	//
	// TODO: Refactor UI logic
	// TODO: Figure out a better way of attaching UI behaviour to objects

	var background = [0.0, 0.0, 0.0, 1.0]; // Background colour
	var connected  = scene[5];             // Choose a mesh from the scene to connect to the UI

	// TODO: Use jquery
	var canvas = $('#cvs')[0];
	var debug  = $('#debug');

	// Colour
	var colSliders = ['#R', '#G', '#B'].map(function(id) { return $(id)[0]; });
	var colValues  = ['#valR', '#valG', '#valB'].map(function(id) { return $(id)[0]; });

	// Rotation
	var rotSliders = ['#X', '#Y', '#Z'].map(function(id) { return $(id)[0]; });
	var rotValues  = ['#valX', '#valY', '#valZ'].map(function(id) { return $(id)[0]; });

	function onColourSliderChanges() {
		for (var i = 0; i < colSliders.length; i++) {
			background[i] = colSliders[i].value / 100.0;
			colValues[i].innerHTML = colSliders[i].value.toString() + '%';
		};

		context.context.clearColor(background[0], background[1], background[2], 1.0);

	}

	function onRotationSliderChanges() {
		for (var i = 0; i < rotSliders.length; i++) {
			// TODO: Find a better way of keeping body rotation and position in sync with its connected mesh
			connected.body.r[i] = connected.mesh.rotation[i] = rad(rotSliders[i].value);
			rotValues[i].innerHTML = rotSliders[i].value.toString() + '&deg;';
		};
	}

	function onMouseMove () {

		var count = 0;
		
		return function (e) {
			
			// Mouse coordinates relative to the canvas
			var bounds = this.getBoundingClientRect();
			var x = e.clientX - bounds.left;
			var y = e.clientY - bounds.top;
			
			// The canvas' centre coordinates
			var midX = this.width  / 2;
			var midY = this.height / 2;

			// Distance from canvas centre
			var dx = x - midX;
			var dy = y - midY;

			$('#debug #mouseX').html('X: ' + Math.round(180*(dx / midX)) + '&deg;');
			$('#debug #mouseY').html('Y: ' + Math.round(180*(dy / midY)) + '&deg;');

			//connected.ω[0] = dy / (canvas.width/2);
			//connected.ω[1] = 2*(dx / midX);
			//connected.ω[0] = 2*(dy / midY);

			// TODO: Find a better way of keeping body rotation and position in sync with its connected mesh
			connected.rotation[1] = π*(dx / midX);
			connected.rotation[0] = π*(dy / midY);

		}
	}

	// Take the initial positions of the sliders into account
	onColourSliderChanges();
	onRotationSliderChanges();

	for (var i = 0; i < 3; ++i) {
		// Register the event listeners for each slider 
		colSliders[i].addEventListener('change', onColourSliderChanges);
		rotSliders[i].addEventListener('change', onRotationSliderChanges);
	}

	canvas.addEventListener('mousemove', onMouseMove());

}



function InitWorld(context) {

	// Hurry up and fill the buffers, you idle buffoon!
	var scene = []; // Container for meshes (subject to change; should be replaced by a Scene object)

	// Experimental 
	var pyramid = new Mesh(context, shapes.cube(2.3), [0, 0, -5]);  // This isn't actually a pyramid...
	var cube    = new Mesh(context, shapes.cube(1.0), [-2, 1, -2]); //

	for (var i = -4; i < 4; i++) {
		var mesh = new Mesh(context, shapes.cube(0.35), [i, 0, -7], [0.0, 0.0, rad(45.0)]);
		scene.push(new Entity({mesh: mesh, mass: 1.0, velocity:[0.0, -0.4, 0.0],  acceleration: [0.0, 0.0, 0.0], angular: [0.0, 2.0, 0.0]}));
	}

	// Add the meshes to the scene
	scene.push(new Entity({mesh: pyramid, mass: 1.0, velocity: [0.0,  0.0, -5.0], acceleration: [0.0, 0.0, 0.0], angular: [0.0, 0.3, 0.0]}),
	           new Entity({mesh: cube,    mass: 1.0, velocity: [0.0, -0.2, -0.4], acceleration: [0.0, 0.0, 0.0], angular: [0.0, 0.3, 0.0]}));

	return scene;

}



function createAnimator (scene, render) {
	
	// You gotta love closures
	var clock = undefined;

	function animate(time) {
		var dt = (time-(clock || time))*0.001; // Time delta (seconds)
		tick(dt, scene);
		render();

		clock = time;
		requestAnimationFrame(animate);
	};

	return animate;

}



function createRenderer(context, scene, modelview, projection) {
	
	return function() {

		// Clear the screen 
		// console.log('Rendering...');
		context.clear(modelview, projection);

		// Draw the meshes
		for (var i = 0; i < scene.length; i++) {
			scene[i].render(modelview, projection);
		};

	}

}



function tick (dt, scene) {
	// console.log(dt)
	// TODO: Receive dt from requestAnimationFrame callback instead (do away with the clock) (✓)
	//pyramidMesh.rotate(0.0, rad(dt*90/1000.0), 0.0);
	//pyramidMesh.translate(0.0, 0.0, -10*dt/1000.0);
	for (var i = 0; i < scene.length; i++) { scene[i].animate(dt); }

}



// onKeyUp
// onKeyDown
// onMouseUp
// onMouseDown
// onMouseMove



function Camera () {}
function Scene  () {}