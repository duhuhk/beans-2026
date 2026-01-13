(async function autorun(){
	// load ini data
	let ini = await TMP_OONIMATION.file.load.data('./ini.js');
	
	// extract canvas stuff
	let {canvas: cvs, context: ctx} = ini;
	
	// create default status object
	let status = new OON_Status(cvs, ctx);
		
	// wait for all dependencies to load in ...
	let dependencies = await ini.resolveDependencies();
	// ... then initialise ...
	await ini.init(status, dependencies);
	// ... and finally kickstart the fun stuff
	aframe = globalThis.requestAnimationFrame(animate);
})();