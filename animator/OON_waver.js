// make an image waver about the canvas's origin
/*
status [OON_Status]: 8nimation status object
image       [Image]: image to render
magnitude  [Number]: max distance to waver from origin
                     (percentage as fractional scalar)
frequency   [Array]: how quickly to waver
                     (array of numbers, in radians per tick)
padding    [Number]: minimum distance to maintain between image & canvas border
                     (percentage as fractional scalar)
offset     [Number]: phase offset (default 0)
*/
function OON_waver(status, image, magnitude, frequency, padding, offset=0){
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
		dt
	} = clock;
	
	// if only one frequency, force into array
	if(typeof frequency == 'number') frequency = [frequency];
	// summate the frequencies
	let sigmaCos = frequency.map(f => Math.cos(f * (tick + offset)));
	sigmaCos = sigmaCos.reduce((s,i) => s + i);
	sigmaCos /= frequency.length;
	let sigmaSin = frequency.map(f => Math.sin(f * (tick + offset)));
	sigmaSin = sigmaSin.reduce((s,i) => s + i);
	sigmaSin /= frequency.length;
	let sigmaMix = frequency.map((f, i) => i % 2 ? Math.cos(f * tick) : Math.sin(f * tick));
	sigmaMix = sigmaMix.reduce((s,i) => s + i);
	sigmaMix /= frequency.length;
	
	// determine scaling of image
	let {width: w, height: h} = image;
	let scale = Math.min(W / w, H / h);
	// scale /= 2;
	scale = Math.trunc(scale);
	// if scales to be too small, scale to a power of 2 divisor
	if(scale < 1){
		scale = Math.min(w / W, h / H);
		let pows = 0;
		while(scale > 0){
			scale >>= 1;
			pows++;
		}
		// scale = 1 / (2 * (2 ** pows));
		scale = 1 / (2 ** pows);
	}
	scale *= 1 + sigmaMix;
	
	// determine positioning of image
	let [x, y] = [origin.x - 0.5 * (scale * w), origin.y - 0.5 * (scale * h)];
	// add wavering
	x += magnitude * W / 2 * sigmaCos;
	y += magnitude * H / 2 * sigmaSin;
	// check if in-bounds
	// if out, only move back to the average of desired and allowed position
	if(x < padding * W) x = (x + padding * W) / 2;
	if(y < padding * H) y = (y + padding * H) / 2;
	if(x + scale * w > (1 - padding) * W) x = (x + (1 - padding) * W - scale * w) / 2;
	if(y + scale * h > (1 - padding) * H) y = (y + (1 - padding) * H - scale * h) / 2;
	
	// request a render of the image at the wavering position
	new RenderRequest(() => {
		ctx.drawImage(image, x, y, scale * w, scale * h);
	}, scale * h, renderQueue);
}