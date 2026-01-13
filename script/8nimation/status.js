// status object to pass to animators
//
// contains important animation information such as
// canvas and rendering context,
// current animation timings,
// currently active animators
//
// can optionally set clock and animators properties to point to a custom,
// not automatically updated reference
class OON_Status{
	// if either given in bonus argument of constructor,
	// overwrite the null here
	// - if null, automatically points to default variables
	// - if else, points to given value
	special = {
		clock: null,
		animators: null,
		renderQueue: null,
	}
	constructor(canvas, context, {clock, animators, queue}=OON_Status.defaultSpecials){
		this.canvas = canvas;
		this.context = context;
		
		// update overrides
		if(clock) this.special.clock = clock;
		if(animators && Array.isArray(animators)) this.special.animators = animators;
		if(queue && Array.isArray(queue)) this.special.renderQueue = queue;
	}
	
	// attach width and height to canvas
	get width(){ return this.canvas.width; }
	get height(){ return this.canvas.height; }
	// attach origin to canvas
	get origin(){ return {x: this.canvas.width / 2, y: this.canvas.height / 2}; }
	
	// special case: clock
	get clock(){
		return this.special.clock ? this.special.clock : {
			tickrate: tickrate,
			tick: tick,
			dt: dt,
			dtick: dtick,
			fps: fps,
			aframe: aframe,
		};
	}
	// special case: animators
	get animators(){ return this.special.animators ? this.special.animators : ANIMATORS; }
	// special case: render queue
	get renderQueue(){ return this.special.renderQueue ? this.special.renderQueue : RENDERQUEUE; }
	
	
	
	// -----------------------------------------------------
	// (... just to move it out the way of the constructor)
	static defaultSpecials = {
		clock: null,
		animators: null,
		renderQueue: null,
	}
}