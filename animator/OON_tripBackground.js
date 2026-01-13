// make a background of mesmerising rainbow flow (more info at bottom of file)
/*
status [OON_Status]: 8nimation status object
bandwidth  [Number]: frequency of ROYGBIV part
                     (percentage as fractional scalar)
magnitude0 [Number]: max distance to travel from origin
                     (percentage as fractional scalar)
magnitude1 [Number]: max distance to travel from orbiting point
                     (percentage as fractional scalar)
frequency0  [Array]: how quickly to orbit origin
                     (array of numbers, in radians per tick)
frequency1  [Array]: how quickly to orbit orbiting point
                     (array of numbers, in radians per tick)
scale      [Number]: resolution scale to render at
                     (percentage as fractional value)
*/

// Math stuff needed in this function
Math.mean=(...x)=>x.length==1&&x[0]?.length?Math.mean(...x[0]):x.reduce((S,n)=>S+n,0)/x.length;
Math.rms=(...x)=>x.length==1&&x[0]?.length?Math.rms(...x[0]):Math.sqrt(x.reduce((S,n)=>S+(n*n),0)/x.length);
Math.stdev = function(...x){
	if(x.length == 1 && Array.isArray(x[0])) x = [...x[0]];
	let xbar = x.reduce((S, n) => S + n, 0) / x.length;
	return Math.sqrt(x.reduce((S, n) => S + (n - xbar) ** 2, 0) / x.length);
}

function OON_tripBackground(status, bandwidth, magnitude0, magnitude1, frequency0, frequency1, scale=1/32, offset=0){
	// extract info
	let {
		context: ctx,
		width: W,
		height: H,
		origin,
		clock,
		renderQueue
	} = status;
	let {
		tick,
		dtick,
		dt,
		// fps,
	} = clock;
	
	// fix resolution scaling
	// (so that the same amount of scaled pixels shown at any resolution)
	// let bgResScale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
	// bgResScale = Math.ceil(bgResScale);
	// scale /= bgResScale;
	// console.log(scale);
	
	// handle lag stuff
	// let fpsGoal = 60;					// minimum FPS to aim for
	// let fpsRatio = fps / fpsGoal;	// how close to goal fps
	// let fpsScale = 1;					// scaling to match best fps
	// if(fpsRatio < 1){
		// fpsScale = Math.ceil(1 / fpsRatio);
		// scale /= fpsScale;
	// }
	
	// create the background buffer
	let buffer = new Uint8ClampedArray(4 * W * H);
	
	// if only one frequency, force into array
	if(typeof frequency0 == 'number') frequency0 = [frequency0];
	if(typeof frequency1 == 'number') frequency1 = [frequency1];
	
	// summate the frequencies
	// lists of trigs
	let cosSet0 = frequency0.map(f => Math.cos(f * (tick + offset)));
	let sinSet0 = frequency0.map(f => Math.sin(f * (tick + offset)));
	let cosSet1 = frequency1.map(f => Math.cos(f * (tick + offset)));
	let sinSet1 = frequency1.map(f => Math.sin(f * (tick + offset)));
	// let mixSet0 = frequency0.map((f, i) => i % 2 ? cosSet0[i] : cosSet1[i]);
	// let mixSet1 = frequency1.map((f, i) => i % 2 ? sinSet0[i] : sinSet1[i]);
	let mixSet0 = frequency0.map((f, i) => i % 2 ? cosSet0[i] : sinSet0[i]);
	let mixSet1 = frequency1.map((f, i) => i % 2 ? cosSet1[i] : sinSet1[i]);
	// sums of trigs
	let cosSum0 = cosSet0.reduce((s,i) => s + i) / frequency0.length;
	let sinSum0 = sinSet0.reduce((s,i) => s + i) / frequency0.length;
	let cosSum1 = cosSet1.reduce((s,i) => s + i) / frequency1.length;
	let sinSum1 = sinSet1.reduce((s,i) => s + i) / frequency1.length;
	let mixSum0 = mixSet0.reduce((s,i) => s + i) / frequency0.length;
	let mixSum1 = mixSet1.reduce((s,i) => s + i) / frequency1.length;
	
	// function to get radial scaling component
	const rFn = s => (Math.mean(s) / (1 - Math.stdev(s)));
	
	/*	DISTANCE TO LINE PASSING THROUGH ORIGIN AT ANGLE A
	for an angle a => f(x) = x * tan(a) determined by central point (x0, y0)
		and 
	for some point (xf, yf) of which to find the distance to the line of f(x),
	
	the function g(x) = ((xf - x) / tan(a)) + yf
	is the line perpendicular to f(x) which intercepts (xf, yf)
	
	the closest point on f(x) to (xf, yf) is the intersection of f(x) & g(x) =>
		x' = (cos(a))^2 * (xf + yf * tan(a)),
		y' = g(x') = f(x')
		
	the distance from the central line (f(x)) is therefore
	d = sqrt((xf - x')^2 + (yf - y')^2)
	*/
	
	// positioning stuff
	//
	// position of orbit point
	let {x:x0, y:y0} = origin;
	x0 += magnitude0 * (W / 2) * (rFn(cosSet0));
	y0 += magnitude0 * (H / 2) * (rFn(sinSet0));
	//
	// position around orbit point
	let x1 = x0 + magnitude1 * (W / 2) * (rFn(cosSet1));
	let y1 = y0 + magnitude1 * (H / 2) * (rFn(sinSet1));
	//
	// determine angle that rays point at
	let a = Math.atan2(y1 - origin.y, x1 - origin.x);
	a %= Math.PI * 2;
	//
	// miscellaneous pre-computes
	let cosa2 = Math.cos(a) ** 2;
	let tana = Math.tan(a);
	
	// color channel stuff
	const roff = 0;
	const goff = 2.0943951023931953;	// 2 * Math.PI / 3
	const boff = 4.1887902047863905;	// 4 * Math.PI / 3
	const cMin = 64;	// minimum channel value
	const cMax = 192;	// maximum channel value
	// const channelValue = t => Math.trunc(cMin + ((cMax-cMin)/2 + ((cMax -cMin)/2 * rFn(mixSet1))) * (1 + Math.cos(t)) / 2);
	// USING ^ WITH A mixSet FOR VARIATION DOESNT WORK WELL!
	// all channels use same variance, so greys out easily!!
	// (effectively, scaling brightness by multiplying all channels)
	const channelValue = t => Math.trunc(cMin + (cMax-cMin) * (1 + Math.cos(t)) / 2);
	
	// vary bandwidth for color spectrum
	let scaledBandwidth = bandwidth * (2 + rFn(mixSet0) / 10) / 2;
	// ... but limit just how low it can go (very fast white pulses otherwise)
	scaledBandwidth = Math.min(bandwidth / Math.E, scaledBandwidth);
	
	// how much of an effect should 1 tick have on spectrum shift?
	const tickScale = 1 / 8;
	let tickChannelPhase = tick * (1 + rFn(mixSet1) * tickScale) * tickScale * scaledBandwidth;	// w/ variance
	// let tickChannelPhase = tick * tickScale * scaledBandwidth;	// w/o variance
	tickChannelPhase %= 2 * Math.PI;
	
	// find distance to central line for each pixel,
	// then get relevant color values and write to background buffer
	for(let xf = 0; xf < W * scale; xf++){
		for(let yf = 0; yf < H * scale; yf++){
			let x = cosa2 * (xf + yf * tana);
			let y = x * tana;
			let d = Math.sqrt((xf - origin.x - x) ** 2 + (yf - origin.y - y) ** 2);
			
			// make color channel values
			let rgbt = d * scaledBandwidth + tickChannelPhase;
			let [rValue, gValue, bValue] = [
				channelValue(rgbt + roff),
				channelValue(rgbt + goff),
				channelValue(rgbt + boff),
			];
			
			// for square section (side length = scale),
			// write channel values to appropriate indices
			for (let i = 0; i < 1 / scale; i++){
				for(let j = 0; j < 1 / scale; j++){
					// prevent wrapping around at edge (when scale not a power of 2)
					if(xf / scale + i >= W) continue;	
					
					// find red index, then color the pixel
					let rIndex = 4 * (((xf + W * yf) / scale) + i + W * j);
					// let rIndex = 4 * (Math.trunc((xf + W * yf) / scale) + i + W * j);
					buffer[rIndex + 0] = rValue;
					buffer[rIndex + 1] = gValue;
					buffer[rIndex + 2] = bValue;
					buffer[rIndex + 3] = 255;
				}
			}
		}
	}
	
	// compile buffer into ImageData
	let bufferImageData = new ImageData(buffer, W, H);
	// request to render buffer to canvas
	new RenderRequest(() => {
		ctx.putImageData(bufferImageData, 0, 0);
		
		/*
		// debug angle line
		let rscalek = Math.sqrt(W ** 2 + H ** 2) / 2;
		ctx.strokeStyle = 'black';
		ctx.setLineDash([1, 4]);
		ctx.beginPath();
		ctx.moveTo(origin.x - rscalek * Math.cos(a), origin.y - rscalek * Math.sin(a));
		ctx.lineTo(origin.x + rscalek * Math.cos(a), origin.y + rscalek * Math.sin(a));
		ctx.closePath();
		ctx.stroke();
		// distance to (x0, y0)
		let rscale0 = 0.5 * Math.sqrt((magnitude0 * W * (rFn(cosSet0))) ** 2 + (magnitude0 * H * (rFn(sinSet0))) ** 2);
		ctx.strokeStyle = 'red';
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.arc(origin.x, origin.y, rscale0, 0, 7);
		ctx.moveTo(origin.x, origin.y);
		ctx.lineTo(x0, y0);
		ctx.closePath();
		ctx.stroke();
		// distance to (x1, y1)
		let rscale1 = 0.5 * Math.sqrt((magnitude1 * W * (rFn(cosSet1))) ** 2 + (magnitude1 * H * (rFn(sinSet1))) ** 2);
		ctx.strokeStyle = 'cyan';
		ctx.beginPath();
		ctx.arc(x0, y0, rscale1, 0, 7);
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.closePath();
		ctx.stroke();
		// distance from (x1, y1) to (xf, yf)
		// ctx.strokeStyle = 'black';
		// ctx.beginPath();
		// ctx.arc(x1, y1, 5, 0, 7);
		// ctx.closePath();
		// ctx.stroke();
		// */
	}, 0, renderQueue);
}

/*	A MORE DETAILED OVERVIEW OF WHAT THIS DOES
The background is composed of a rainbow gradient pointed at angle α from the
origin.
Angle α is the angle between the origin and point B.
Point B orbits around point A at a distance of magnitude1 scaled by the sum
of cosines (x) and sines (y) of frequencies frequency1.
Point A orbits around the origin at a distance of magnitude0 scaled by the
sum of cosines (x) and sines (y) of frequencies frequency0.

...

The actual rainbow gradient is more complicated. Its orientation spins
apparently randomly, obviously, but it also grows and shrinks in what I'm
going to call its 'bandwidth', for lack of a better term (it's technically
another frequency, but there are too many of those here).

Explaining from square one how a pixel's color is decided:
The function 
	c(t) = m + (M - m) * (1 + cos(t)) / 2,
where
	t = some arbitrary variable,
	m = the minimum value of the channel,
	M = the maximum value of the channel,
determines the value of a pixel's color channel.
The values m and M are constant, but t depends on 4 things: 
	the bandwidth, scaled by mixed sinusoids of frequency0,
	the distance of the pixel to the 'key line',
	the current tick, and
	the channel phase offset.
The 'key line' is an imaginary line passing through the origin at angle α,
and the channel phase offset is a constant which separates the red, green,
and blue channels by 1/3 of a period (multiples of 2pi/3).

...

In summary, the rainbow gradient has a period which shrinks and grows as
the bandwidth gets scaled by the mixed sinusoids. It's functionally 1-D,
with its origin offset by the current tick. It rotates about the center at
seemingly random, and the distance a pixel is from the 'key line' determines
how far from the gradient's origin it is considered to be. Because its
origin is offset by the tick, even though the gradient only rotates (not
translates) about the origin, it appears to have no center on the screen.
*/