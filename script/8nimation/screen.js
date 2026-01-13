// properly size the canvas
function canvasSizing(canvas, ...dim){
	// get width, height of page
	let [w, h] = [globalThis.innerWidth, globalThis.innerHeight];
	// read any manual overrides
	dim = Array.from(dim);
	if(dim.length){
		[w, h] = dim;
	}
	
	// apply size
	canvas.style.width = w + 'px';
	canvas.style.height = h + 'px';
	canvas.width = w;
	canvas.height = h;
	
	// center properly
	canvas.style.margin = '0';
	canvas.style.left = '50%';
	canvas.style.top = '50%';
	canvas.style.position = 'absolute';
	canvas.style.transform = 'translate(-50%, -50%)';
}