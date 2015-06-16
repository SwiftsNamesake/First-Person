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

function Mesh (gl, shape, x, y, z) {

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
					}[type];}

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


};

vertices = vertices.flatten();
colours = (contour ? colours.map(function (rgb) { return [0.0, 0.0, 0.0, 1.0]; }) : colours).flatten();

return {'vertex': vertices , 'colour': colours }[shape];}

this.createCube = function (type) {

	var v = {};

	for (var x = 0.0; x < 2.0; x++) {
		for (var y = 0.0; y < 2.0; y++) {
			for (var z = 0.0; z < 2.0; z++) {
				v['LR'[x]+'BT'[y]+'FB'[z]] = [x*2-1,y*2-1,z*2-1];
			}
		}
	}

	var c = [
		[1.0, 0.0, 0.0, 1.0],
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
		var glBuffer = gl.createBuffer();
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
		gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

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


	this.draw = function (shader) {
		/* Renders the mesh */
		mat4.identity(mvMatrix)
		mat4.translate(mvMatrix, this.p);
		mat4.rotate(mvMatrix, this.r[0], [1, 0, 0]);
		mat4.rotate(mvMatrix, this.r[1], [0, 1, 0]);
		mat4.rotate(mvMatrix, this.r[2], [0, 0, 1]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(shader.vertexPositionAttribute, this.vertexSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colourBuffer);
		gl.vertexAttribPointer(shader.vertexColourAttribute, this.colourSize, gl.FLOAT, false, 0, 0);
		
		SetMatrixUniforms();
		gl.drawArrays(this.primitive, 0, this.vertexNumber);

		// Draw contours
		//gl.bindBuffer(gl.ARRAY_BUFFER, this.contourColourBuffer);
		//gl.vertexAttribPointer(shader.vertexColourAttribute, this.colourSize, gl.FLOAT, false, 0, 0);
		//gl.drawArrays(this.LINE_STRIP, 0, this.vertexNumber);

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
	this.primitive = [gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.LINE_STRIP, gl.LINES][0];
	this.vertexSize = 3; 			/* Items per vertex in the vertex array */
	this.colourSize = 4; 			/* Items per colour in the colour array */
	//this.textureSize = undefined;
	//this.vertexSize = 3;
	this.vertexNumber = this.vertices.length / this.vertexSize;
	
	/* Shaders */
	this.useCustomShaders = false;
	this.vShader = undefined;
	this.pShader = undefined;

}

/*
	
	PROJECT SPEC
	
	Tickmarks (✔) indicate completed tasks.
	Ellipses (...) indicate ongoing tasks.

	* Conceptual: World, Camera, Screen coordinates 

	* Retrieve context
	* Initialize viewport
	* Write and load shaders
		- Nothing fancy (for now)
		- Ambient and point lighting
		- Helper functions (loading, attaching)
		- Consider XMLHttpRequest

	* Initialize buffers
		- Ground
		- A few simple shapes
		- Textures or colours

	* Implement rendering logic
	* Implement animation logic
		- Time handling (timer object, fixed FPS, global state?)
		- Create physics objects (encapsulating state)
		- Acceleration, impacts, forces
		- Jumping

	* Implement input logic
		- WASD for moving around
		- Mouse for looking around
		- Space for jumping
		- Configuration GUI?
	
	* Fun experiments
		- Gaussian blur
		- Warped textures
		- Folded textures
		- Run-time texture binding

	* Good practice
		- Comments, unit labels
		- Optimimizations
		- Organize code into reusable modules (ie. objects)
			-- Encapsulate buffers, shaders, textures behind high-level mesh objects
			-- Matrix

*/