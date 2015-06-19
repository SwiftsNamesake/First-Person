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



$(document).ready(function() {

	//
	var canvas  = $('#cvs')[0];
	var context = new Context3D(canvas);

	// Let the context manage the matrices for us (?)
	var modelview  = mat4.create(); //
	var projection = mat4.create(); //
	
	var scene  = createScene(context);
	// this.scene = scene;

	context.loadShaders({ vertex: 'shaders/vertexshader.txt', pixel: 'shaders/pixelshader.txt' }).then(function(context) {

		var tick    = function(dt) { scene.map(function(entity) { entity.body.animate(dt); }); }
		var render  = createRenderer(context, scene, modelview, projection);
		var animate = createAnimator(tick, render);

		requestAnimationFrame(animate);

	});

});



function createScene(context) {

	//
	var yellow  = new Mesh(context, shapes.monochrome([[-1.00,  0.00,  0.00], [0.00,  2.00, -0.58], [1.00, 0.00, 0.00]], palette.yellow),   [0, 0, 0], [0, 0, 0]);
	var purple  = new Mesh(context, shapes.monochrome([[-1.00,  0.00,  0.00], [0.00, -2.00, -0.58], [1.00, 0.00, 0.00]], palette.deeppink), [0, 0, 0], [0, 0, 0]);
	var square  = new Mesh(context, shapes.rectangle(1.0, 1.0, [1.00, 0.52, 0.13, 1.00]), [0, 0, 0], [0, 0, 0]);

	var cube = new Mesh(context, shapes.cube(0.35, {
		top:    palette.orange,
		bottom: palette.darkred,
		front:  palette.black,
		back:   palette.chartreuse,
		left:   palette.purple,
		right:  palette.darkkhaki }), [0, 0, -0.14], [0, 0, 0]);

	var scene = [new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], mesh: yellow }),
	             new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], mesh: purple }),
	             new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], mesh: square }),
	             new Entity({mass: 1.0, velocity: [0,0,-0.8], acceleration: [0,0,0], angular: [0,2,0], mesh: cube   })];

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
		scene.map(function(object) { object.mesh.render(modelviewMatrix, projectionMatrix); }); // Draw stuff

	};

	return render;

};