// make an image waver about the canvas's origin
/*
status [OON_Status]: 8nimation status object
*/
function OON_resetFrame(status){
	let {
		context: ctx,
		width: w,
		height: h,
		renderQueue,
	} = status;
	
	new RenderRequest(() => {
		ctx.clearRect(0,0,w,h);
	}, -1, renderQueue);
}