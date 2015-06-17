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



/* Global variables (should be kept to a minimum) */
var render; // Initialised with createRenderer later on (bad approach?)

var pyramidMesh;	//
var clock = 0;		// TODO: Fix the timing issues (first call to Tick())

var scene = [];		// Container for meshes (subject to change; should be replaced by a Scene object)



function InitUserInterface(context) {

	//
	// TODO: Refactor UI logic

	var background = [0.0, 0.0, 0.0]; // Background colour

	// TODO: Use jquery
	var canvas = $('#cvs')[0];
	var debug  = $('#debug')[0];

	/* Colour */
	var colSliders = ['#R', '#G', '#B'].map(function(id) { return $(id)[0]; });
	var colValues  = ['#valR', '#valG', '#valB'].map(function(id) { return $(id)[0]; });

	/* Rotation */
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
			pyramidMesh.r[i] = rad(rotSliders[i].value);
			rotValues[i].innerHTML = rotSliders[i].value.toString() + '&deg;';
		};
	}

	function onMouseMove () {

		var count = 0;
		
		return function (e) {
			
			/* Mouse coordinates relative to the canvas */
			var bounds = this.getBoundingClientRect();
			var x = e.clientX - bounds.left;
			var y = e.clientY - bounds.top;
			
			/* The canvas' centre coordinates */
			var midX = this.width  / 2;
			var midY = this.height / 2;

			/* Distance from canvas centre */
			var dx = x - midX;
			var dy = y - midY;

			debug.children[0].innerHTML = 'X: ' + Math.round(180*(dx / midX)) + '&deg;';
			debug.children[1].innerHTML = 'Y: ' + Math.round(180*(dy / midY)) + '&deg;';

			//pyramidMesh.ω[0] = dy / (canvas.width/2);
			//pyramidMesh.ω[1] = 2*(dx / midX);
			//pyramidMesh.ω[0] = 2*(dy / midY);

			pyramidMesh.r[1] = π*(dx / midX);
			pyramidMesh.r[0] = π*(dy / midY);

		}
	}

	/* Take the initial positions of the sliders into account */
	onColourSliderChanges();
	onRotationSliderChanges();

	for (var i = 0; i < 3; ++i) {
		/* Register the event listeners for each slider */
		colSliders[i].addEventListener('change', onColourSliderChanges);
		rotSliders[i].addEventListener('change', onRotationSliderChanges);
	}

	canvas.addEventListener('mousemove', onMouseMove());

}


function InitTextures() {
	
}



function InitWorld(context) {
	/* Hurry up and fill the buffers, you idle buffoon! */

	/* Experimental */
	pyramidMesh = new Mesh(context, '', 0, 0, -5);
	pyramidMesh.ω = [ 0.0, 0.3, 0.0 ];
	//pyramidMesh.setVelocity(0.0, 0.0, -5.0);
	//pyramidMesh.ω = [0.0, rad(20.0), rad(180.0)];

	anotherMesh = new Mesh(context, '', -2, 1, -2);
	anotherMesh.setVelocity(0.0, -0.2, -0.4);
	anotherMesh.ω = [ 0.0, 0.3, 0.0 ];

	for (var i = -4; i < 4; i++) {
		mesh = new Mesh(context, '', i, 0, -7);
		mesh.setVelocity(0.0, -0.4, 0.0);
		mesh.setRotation(0.0, 0.0, rad(45.0));
		mesh.ω = [0.0, 2.0, 0.0];
		scene.push(mesh);
	}

	scene.push(pyramidMesh, anotherMesh); // Add the meshes to the scene

}



function begin () {

	/* The cookie is a lie! */
	document.cookie = 'username=Gottlob Frege;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	document.cookie = 'stress=acute;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	// console.log(document.cookie.split(';'));
	
	/* Graphics */
	var canvas  = $('#cvs')[0];      // Complete
	var context = new Context3D(canvas); // Complete

	/* Matrices */
	var projection = mat4.create(); // Perspective matrix
	var modelview  = mat4.create();	// Model-view matrix 

	context.loadShaders({ vertex: 'vertexshader.txt', pixel: 'pixelshader.txt'}).then(function(context) {

		InitWorld(context);
		InitUserInterface(context);

		render = createRenderer(context, modelview, projection);

		clock = new Date().getTime()
		animate()

	});

}



function animate () {
	requestAnimationFrame(animate);
	tick();
	render();
}



// TODO: Move this
var cubeRotX = 0.0;
var cubeRotY = 0.0;
var cubeRotZ = 0.0;



function createRenderer(context, modelview, projection) {
	
	return function() {

		/* Clear the screen */
		console.log('Rendering...')
		context.clear(modelview, projection);

		/* Draw the meshes */
		for (var i = 0; i < scene.length; i++) {
			scene[i].draw(modelview, projection);
		};

	}

}



function tick () {

	/* Calculate time delta */
	var now = new Date().getTime(); // 
	var dt = (now - clock)/1000.0;  // Time elapsed since previous frame (seconds)
	clock = now;

	//pyramidMesh.rotate(0.0, rad(dt*90/1000.0), 0.0);
	//pyramidMesh.translate(0.0, 0.0, -10*dt/1000.0);
	
	for (var i = 0; i < scene.length; i++) {
		scene[i].animate(dt);
	}

}



/* onKeyUp */
/* onKeyDown */
/* onMouseUp */
/* onMouseDown */
/* onMouseMove */



window.onload = function () {
	begin();
}



/* Constructors */
function Camera () {
	// body...
}



function Scene () {
	// body...
}