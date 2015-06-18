/*
 * Entity.js
 * Bundles a Body and a Mesh and ensures that their rotation and position are the same
 *
 * None
 * June 18 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



var Entity = function(properties) {

	// 
	// TODO: Use $.extend (?)
	this.body = new Body({ position: properties.mesh.position,
						   rotation: properties.mesh.rotation,
						   mass:     properties.mass,
						   velocity: properties.velocity,
						   angular:  properties.angular,
						   acceleration: properties.acceleration,
						   connected: properties.mesh });

	this.mesh = properties.mesh;

	// 'Cache' these property definitions by applying them to the Entity prototype (?)
	Object.defineProperty(this, 'position', { set: function(p) { this.body.p = this.mesh.position = p; return p; },
	                                    	  get: function()  { console.assert(this.body.p === this.mesh.position); return this.body.p; } });

	Object.defineProperty(this, 'rotation', { set: function(r) { this.body.r = this.mesh.rotation = r; return r; },
	                                    	  get: function()  { console.assert(this.body.p === this.mesh.position); return this.body.r; } });

};