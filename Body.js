/*
 * Body.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - Should Body objects be completely disconnected from Meshes?
 *        - Physics, collisions, bounding boxes, 
 *        - Vector object

 * SPEC | -
 *        -
 *
 */



var Body = function(mass, position, rotation, velocity, acceleration, angular, connected) {

	//
	// TODO: Read position and rotation from connected Mesh (?)
	
	// Physics and animation
	this.p = position || [0.0, 0.0, 0.0]; /* Position (units) */
	this.r = rotation || [0.0, 0.0, 0.0]; /* Rotation (radians) */
	this.v = velocity || [0.0, 0.0, 0.0]; /* Velocity (units per second) */
	this.ω = angular  || [0.0, 0.0, 0.0]; /* Angular velocity (radians per second) */
	this.a = acceleration || [0.0, 0.0, 0.0]; /* Acceleration (units per second per second) */
	
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
		connected.position = this.p;
		connected.rotation = this.r;

	};

};