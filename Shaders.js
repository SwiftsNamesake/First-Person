/*
 * Shaders.js
 * ?
 *
 * Jonatan H Sundqvist
 * June 16 2015
 * 

 * TODO | - Promises
 *        - Logging (allow toggle), timing, profiling
 *        - Separate request IO from WebGL logic
 *        - Toggle async

 * SPEC | -
 *        -
 *
 */



var shaders = (function() {

	//
	// TODO: 'Global' context object (?)

	var shaders = {};

	// Configurations
	shaders.DEBUG = false;

	// TODO: Allow changing at runtime (?)
	// TODO: Use logging library instead (?)
	if (shaders.DEBUG) {
		shaders.log = console.log.bind(console);
	} else {
		shaders.log = function() {};
	}

	// Methods
	shaders.load = function(context, path, type) {
		// Loads the specified file asynchronously and creates a WebGL shader from it.
		// TODO: How does the complete callback interact with the promise interface of $.ajax (?)
		shaders.log('Attempting to load shader.');
		return $.ajax(path, {
			async: true, //
			// complete: function(xhr, status) { return shaders.oncomplete(xhr, status, context, type); }, // 
			// error:    function(xhr, status, exception) { return shaders.onerror; } // 
		}).then(function(xhr, status)            { return shaders.oncomplete(xhr, status, context, type); },
		        function(xhr, status, exception) { return shaders.onerror; }); // TODO: Rename xhr to response (?)
	};


	shaders.oncomplete = function(xhr, status, context, type) {
		// Handles a single completed shader request (which may have failed)
		if (status == 'success') {
			shaders.log('Successfully loaded shader.')
			shaders.log(typeof xhr); // Seems to be string (not xhr)
			return shaders.create(context, xhr, type);
		} else {
			console.error('Failed to load shader.');
			return undefined; // TODO
		}
	}


	shaders.onerror = function(xhr, status, exception) {
		// TODO: Proper logging and error handling
		console.error('Someone messed up badly.');
	}


	shaders.create = function(context, source, type) {
		// Creates and compiles a WebGL shader object from the source.
		// TODO: Better logging and error handling
		try {
			// TODO: Allow other shader type options (eg. synonyms and abbreviations) (?)
			shaders.log('Creating shader.');
			shaders.log(source);
			var shader = context.createShader({'vertex': context.VERTEX_SHADER, 'pixel': context.FRAGMENT_SHADER}[type]);

			/* Compile and verify */
			context.shaderSource(shader, source);
			context.compileShader(shader);

			if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
				console.error('Faulty compile status'); // TODO: Better message
				console.error(context.getShaderInfoLog(shader));
				return undefined;
			}

			return shader;
		} catch (e) {
			console.error('Something went wrong when attempting to create a shader');
			return undefined; // TODO
		}
	};


	shaders.program = function(context, vertexshader, pixelshader) {
		// Creates a new shader program with the given vertex and pixel shaders
		// TODO: Return promise (?)
		// TODO: Allow either source or path as vertex/fragment arguments
		// TODO: Handle potential errors (?)
		shaders.log('Creating shader program');
		shaders.log(vertexshader, pixelshader);
		var program = context.createProgram();
		context.attachShader(program, vertexshader);
		context.attachShader(program, pixelshader);
		context.linkProgram(program);
		return program;
	}


	shaders.programFromSourceFiles = function(context, pathvertex, pathpixel) {
		//
		// TODO: Handle potential errors
		return $.when(shaders.load(context, pathvertex, 'vertex'), shaders.load(context, pathpixel, 'pixel')).then(function(vertexshader, pixelshader) {
			// shaders.log(vertexshader instanceof String, pixelshader instanceof String);
			return shaders.program(context, vertexshader, pixelshader);
		});
	}

	return shaders;

}());