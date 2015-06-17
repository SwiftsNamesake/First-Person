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
var gl;
var shaderProgram;

var pMatrix = mat4.create(); 	// Perspective matrix
var mvMatrix = mat4.create();	// Model-view matrix 

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
function InitUserInterface() {

	var canvas = document.getElementById('cvs');
	var debug = document.getElementById('debug');

	/* Colour */
	var colSliders = 'RGB'.map(document.getElementById.bind(document));
	var colValues  = ['valR', 'valG', 'valB'].map(document.getElementById.bind(document));
	
	/* Rotation */
	var rotSliders = comprehension('XYZ', document.getElementById.bind(document));
	var rotValues = comprehension(['valX', 'valY', 'valZ'], document.getElementById.bind(document));

	function onColourSliderChanges() {
		for (var i = 0; i < colSliders.length; i++) {
			bkg[i] = colSliders[i].value / 100.0;
			colValues[i].innerHTML = colSliders[i].value.toString() + '%';
		};

		gl.clearColor(bkg[0], bkg[1], bkg[2], 1.0);

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
	try {
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
		if (!gl) {
			alert('Download a modern browser, you fossil!');
		}
	}
}


/* InitTextures */
function InitTextures() {
	
}


/* SetMatrixUniforms */
function SetMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/* InitShaders */
function InitShaders(onloaded) {
	
	// TODO: Find a way to get rid of callback chain (elegant asynchronicity)
	// TODO: Find a way to load both shaders in parallel
	loadShader(gl, 'http://localhost:8000/Web%20Dev/WebGL/First%20Person/pixelshader.txt', 'p', function (pixelShader) {
		loadShader(gl, 'http://localhost:8000/Web%20Dev/WebGL/First%20Person/vertexshader.txt', 'v', function(vertexShader) {
			shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, pixelShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { console.log('Could not initialize shaders'); }

			gl.useProgram(shaderProgram);

			shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

			shaderProgram.vertexColourAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
			gl.enableVertexAttribArray(shaderProgram.vertexColourAttribute)

			shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
			shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');

			onloaded(pixelShader, vertexShader); // Invoke callback

		});
	});


}


/* InitWorld */
function InitWorld() {
	/* Hurry up and fill the buffers, you idle buffoon! */

	/* Experimental */
	pyramidMesh = new Mesh(gl, '', 0, 0, -5);
	pyramidMesh.ω = [ 0.0, 0.3, 0.0 ];
	//pyramidMesh.setVelocity(0.0, 0.0, -5.0);
	//pyramidMesh.ω = [0.0, rad(20.0), rad(180.0)];

	anotherMesh = new Mesh(gl, '', -2, 1, -2);
	anotherMesh.setVelocity(0.0, -0.2, -0.4);
	anotherMesh.ω = [ 0.0, 0.3, 0.0 ];

	for (var i = -4; i < 4; i++) {
		mesh = new Mesh(gl, '', i, 0, -7);
		mesh.setVelocity(0.0, -0.4, 0.0);
		mesh.setRotation(0.0, 0.0, rad(45.0));
		mesh.ω = [0.0, 2.0, 0.0];
		scene.push(mesh);
	}

	scene.push(pyramidMesh, anotherMesh); // Add the meshes to the scene

}

/* loadShader */
function loadShader (gl, URI, type, onloaded) {

	/* Retrieve shader file */
	var request = new XMLHttpRequest();
	request.open('GET', URI, true);

	// TODO: Wait for shader to load (preferrably without jamming the UI)
	// TODO: Look into promises (return a promise or take callback as argument?)
	// TODO: Bite the bullet and embed shaders in HTML (?)
	request.onreadystatechange = function() {
		if (request.status != 200) {
			console.error('Unable to load shader from file. Status: ' + status.toString());
			return null;
		} else {
			console.log('Shader loaded successfully.');
		}

		/* Create GL shader from the source */
		shaderType = { 'p': gl.FRAGMENT_SHADER,
		               'v': gl.VERTEX_SHADER }[type];

		if (shaderType == undefined) {
			console.error('Invalid shader type (%s)', type) // TODO: Check if JS has this type of string interpolation
			// return null; // TODO: Return values have no use in this type of callback
		}

		var shader = gl.createShader(shaderType); // Attach shader to request object

		/* Compile and verify */
		gl.shaderSource(shader, request.response);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(shader));
		}

		onloaded(shader)

	}

	request.send();

	return request;
	
}

/* Begin */
function Begin () {

	/* The cookie is a lie! */
	document.cookie = 'username=Gottlob Frege;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	document.cookie = 'stress=acute;expires=Thu, 31 Dec 2014 12:00:00 GMT;path=/';
	console.log(document.cookie.split(';'));
	
	/* Graphics */
	var canvas = document.getElementById('cvs'); // Complete
	InitWebGL(canvas); // Complete

	// Complete (still working on async issues)
	InitShaders(function (ps, vs) {

		InitWorld();
		
		/* OpenGL configurations */
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
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
function Render () {
	
	/* Clear the screen */
	console.log('Rendering...')
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/* Update perspective matrix */
	mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);

	/* Draw the meshes */
	for (var i = 0; i < scene.length; i++) {
		scene[i].draw(shaderProgram);
	};

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