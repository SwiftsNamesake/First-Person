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



var Body = function(properties) {

	// mass, velocity, acceleration, angular, connected
	// TODO: Accept single object as argument (?)
	// TODO: Read position and rotation from connected Mesh (✓)

	// Physics and animation
	this.p = properties.position || [0.0, 0.0, 0.0];     // Position (units) 
	this.r = properties.rotation || [0.0, 0.0, 0.0];     // Rotation (radians) 
	this.v = properties.velocity || [0.0, 0.0, 0.0];     // Velocity (units per second)
	this.ω = properties.angular  || [0.0, 0.0, 0.0];     // Angular velocity (radians per second) 
	this.a = properties.acceleration || [0.0, 0.0, 0.0]; // Acceleration (units per second per second) 
	
	this.m = properties.mass || 1.0;

	this.connected = properties.connected || console.log('Body was not given a connected Mesh'); //


	this.animate = function(dt) {

		//
		this.p[0] += this.v[0]*dt + 0.5*this.a[0]*dt*dt;
		this.p[1] += this.v[1]*dt + 0.5*this.a[1]*dt*dt;
		this.p[2] += this.v[2]*dt + 0.5*this.a[2]*dt*dt;

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
		this.connected.position = this.p;
		this.connected.rotation = this.r;

	};

};