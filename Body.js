/*
 * Body.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - Should Body objects be completely disconnected from Meshes?
 *          -- If not, its rotation and position has to be kept in sync somehow (maybe with another wrapper object?)
 *          -- User-friendliness, queries (like names, should probably be delegated to high-level wrapper object)
 *
 *        - Physics, collisions, bounding boxes, 
 *        - Vector object

 * SPEC | -
 *        -
 *
 */



var Body = function(mass, velocity, acceleration, angular, connected) {

	//
	// TODO: Accept single object as argument (?)
	// TODO: Read position and rotation from connected Mesh (✓)

	// Physics and animation
	this.p = connected.position || [0.0, 0.0, 0.0]; // Position (units) 
	this.r = connected.rotation || [0.0, 0.0, 0.0]; // Rotation (radians) 
	this.v = velocity || [0.0, 0.0, 0.0]; // Velocity (units per second) 
	this.ω = angular  || [0.0, 0.0, 0.0]; // Angular velocity (radians per second) 
	this.a = acceleration || [0.0, 0.0, 0.0]; // Acceleration (units per second per second) 
	
	this.m = mass || 1.0;


	this.animate = function(dt) {

		//
		this.p[0] += this.v[0]*dt + 0.5*this.a[0]*dt*dt 
		this.p[1] += this.v[1]*dt + 0.5*this.a[1]*dt*dt 
		this.p[2] += this.v[2]*dt + 0.5*this.a[2]*dt*dt 

		//
		this.v[0] += this.a[0]*dt;
		this.v[1] += this.a[1]*dt;
		this.v[2] += this.a[2]*dt;

		//
		this.r[0] += this.ω[0]*dt;
		this.r[1] += this.ω[1]*dt;
		this.r[2] += this.ω[2]*dt;

		// Update connected mesh
		// TODO: Better way of syncing
		connected.position = this.p;
		connected.rotation = this.r;

	};

};



var Entity = function(body, mesh) {
	// Test class that bundles a Body and a Mesh and ensures that their rotation and position are the same
	// TODO: Add different coordinate systems (?)
	this.body = body;
	this.mesh = mesh;

	Object.defineProperty(this, 'position', { set: function(p) { this.body.p = this.mesh.position = p; return p; },
	                                    	  get: function()  { return this.body.p; } });

	Object.defineProperty(this, 'rotation', { set: function(r) { this.body.r = this.mesh.rotation = r; return r; },
	                                    	  get: function()  { return this.body.r; } });

};