// initialise fun stuff
async function OON_init(status, dependencies){
	// extract variables from status
	let {
		canvas,
		context,
	} = status;
	// extract variables from dependencies
	let {
		demonImage,
		captionImage,
		backgroundConfig: bgcfg,
		captionConfig: ccfg,
		demonConfig: dcfg,
	} = dependencies;
	
	canvasSizing(canvas);
	window.addEventListener('resize', () => {
		canvasSizing(canvas);
	});
	
	let {
		A0: bgA0, A1: bgA1,
		f0: bgf0, f1: bgf1,
		bandwidth: bgBandwidth, 
		scale: bgScale,
		offset: bgOffset,
	} = bgcfg;
	let {
		A: cA, f: cf,
		padding: cPadding, 
		offset: cOffset
	} = ccfg;
	let {
		A: dA, f: df,
		padding: dPadding, 
		offset: dOffset
	} = dcfg;
	
	// clear canvas
	// await loadAnimator('./animator/OON_resetFrame.js', STATUS);
	
	// draw canvas background
	await loadAnimator('./animator/OON_tripBackground.js', status, bgBandwidth, bgA0, bgA1, bgf0, bgf1, bgScale, bgOffset);
	
	// render caption and demon
	await loadAnimator('./animator/OON_waver.js', status, captionImage, cA, cf, cPadding, cOffset);
	await loadAnimator('./animator/OON_waver.js', status, demonImage, dA, df, dPadding, dOffset);
	
	console.groupCollapsed('Animation Details');
	console.group('Background'); console.dir(bgcfg); console.groupEnd('Background');
	console.group('Caption'); console.dir(ccfg); console.groupEnd('Caption');
	console.group('Demon'); console.dir(dcfg); console.groupEnd('Demon');
	console.groupEnd('Animation Details');
	
	return;
}