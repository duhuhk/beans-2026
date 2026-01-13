// animation clockwork
const tickrate = 50;	// tick per 1000ms (dt/dtick=1000ms/tickrate; e.g. 50tick/s -> 20ms/tick)
var t0 = 0;				// ms since start (as of last frame timing update)
var tick = 0;			// ticks since start (as of last frame timing update)
var tickdec = 0;		// decimal part of tick
var dt = 0;				// time passed since last frame
var dtick = 0;			// ticks passed since last frame
// more animation-specific ones
var fps = 0;			// frames per second
var aframe = null;	// animation frame loop

// update the timing trackers
function updateTimes({bundle}={bundle:true}){
	let t = performance.now();
	dt = t - t0;
	dtick = tickrate * dt / 1000;
	fps = 1000 / dt;
	
	t0 = t;
	tickdec += dtick;
	tick += tickdec | 0;
	tickdec -= tickdec|0;
	
	// return a simple clock information bundle
	if(bundle) return {
		tickrate: tickrate,
		tick: tick,
		dt: dt,
		dtick: dtick,
		fps: fps,
		aframe: aframe,
	};
}