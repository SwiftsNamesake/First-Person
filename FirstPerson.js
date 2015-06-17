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
 
 */



/* Global variables (should be kept to a minimum) */
var projection = mat4.create(); 	// Perspective matrix
var modelview  = mat4.create();	// Model-view matrix 

var bkg = [0.0, 0.0, 0.0]; // Background colour


/* Buffers */
var pyramidVertices;
var pyramidColours;
var cubeVertices;
var cubeColours;
var cubeIndices;

var pyramidMesh;	//
var clock = 0;		// TODO: Fix the timing issues (first call to Tick())

var scene = [];		// Container for meshes (subject to change; should be replaced by a Scene object)


/* InitUserInterface */
function InitUserInterface(context) {

	var canvas = document.getElementById('cvs');
	var debug = document.getElementById('debug');

	/* Colour */
	var colSliders = ['R', 'G', 'B'].map(document.getElementById.bind(document));
	var colValues  = ['valR', 'valG', 'valB'].map(document.getElementById.bind(document));
	
	/* Rotation */
	var rotSliders = comprehension('XYZ', document.getElementById.bind(document));
	var rotValues = comprehension(['valX', 'valY', 'valZ'], document.getElementById.bind(document));

	function onColourSliderChanges() {
		for (var i = 0; i < colSliders.length; i++) {
			bkg[i] = colSliders[i].value / 100.0;
			colValues[i].innerHTML = colSliders[i].value.toString() + '%';
		};

		context.clearColor(bkg[0], bkg[1], bkg[2], 1.0);

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


/* InitWebGL */
function InitWebGL(canvas) {

	//
	var context;

	try {
		context = canvas.getContext('experimental-webcontext');
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;
		return context
	} catch (e) {
		if (!context) {
			console.error('Download a modern browser, you fossil!');
			return undefined;
		} else {
			console.error('Something bad happened.');
		}
	}
}


/* InitTextures */
function InitTextures() {
	
}


/* SetMatrixUniforms */
function SetMatrixUniforms(context, program, projection, modelview) {
	context.uniformMatrix4fv(program.pMatrixUniform, false, projection);
	context.uniformMatrix4fv(program.mvMatrixUniform, false, modelview);
}


/* InitShaders */
function InitShaders(context, psPath, vsPath) {
	
	// TODO: Find a way to get rid of callback chain (elegant asynchronicity)
	// TODO: Find a way to load both shaders in parallel
	// console.log('Creating shader program');
	// var shaderProgram = context.createProgram();

	return shaders.programFromSourceFiles(context, psPath, vsPath).then(function(program) {

		//
		context.useProgram(program);

		// This part is specific to the shaders we're using.
		program.vertexPositionAttribute = context.getAttribLocation(program, 'aVertexPosition');
		context.enableVertexAttribArray(program.vertexPositionAttribute);

		program.vertexColourAttribute = context.getAttribLocation(program, 'aVertexColor');
		context.enableVertexAttribArray(program.vertexColourAttribute)

		program.pMatrixUniform  = context.getUniformLocation(program, 'uPMatrix');
		program.mvMatrixUniform = context.getUniformLocation(program, 'uMVMatrix');

		// createRenderer(context, program, modelview, projection, [{'vertices': vertices, 'colours': colours}])();

		return program;

	});

}



/* InitWorld */
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



/* Begin */
function Begin () {

	/* The cookie is a lie! */
	document.cookie = 'username=Gottlob Frege;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	document.cookie = 'stress=acute;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	// console.log(document.cookie.split(';'));
	
	/* Graphics */
	var canvas  = $('#cvs')[0];      // Complete
	var context = InitWebGL(canvas); // Complete

	InitShaders(context, 'vertexshader.txt', 'pixelshader.txt').then(function (program) {

		InitWorld(context);
		
		/* OpenGL configurations */
		context.clearColor(0.0, 0.0, 0.0, 1.0);
		context.enable(context.DEPTH_TEST);
		
		/* Interface */
		InitUserInterface();

		/* Initiate the render loop */
		clock = new Date().getTime()
		Animate()
		
	});


}


/* Animate */
function Animate () {
	requestAnimationFrame(Animate);
	Tick();
	Render();
}



var cubeRotX = 0.0;
var cubeRotY = 0.0;
var cubeRotZ = 0.0;



/* Render */
function createRenderer(context, modelview, projection, program) {
	
	return function() {

		/* Clear the screen */
		console.log('Rendering...')
		context.viewport(0, 0, context.viewportWidth, context.viewportHeight);
		context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

		/* Update perspective matrix */
		mat4.perspective(45, context.viewportWidth/context.viewportHeight, 0.1, 100.0, projection);
		mat4.identity(modelview);

		/* Draw the meshes */
		for (var i = 0; i < scene.length; i++) {
			scene[i].draw(program);
		};

	}

}



/* Tick */
function Tick () {

	/* Calculate time delta */
	var now = new Date().getTime();
	var dt = (now - clock)/1000.0; /* Time elapsed since previous frame (seconds) */
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
	Begin();
}


/* Constructors */
function Camera () {
	// body...
}


function Scene () {
	// body...
}