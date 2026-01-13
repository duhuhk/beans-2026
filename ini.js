// MAKE SURE INITIALISATION FUNCTION IS LOADED FIRST!!
// ITS CURRENTLY STORED IN ./init.js,
// AND IS NAMED OON_init

// create a configuration object
function GENERATE_INI(){
	// screen stuff
	let cvs = document.getElementById('8nimation-canvas');
	let ctx = cvs.getContext('2d');
	
	// this gets returned
	let ini = new OON_Config(cvs, ctx, OON_init);
	// OON_init is a function in ./script/init.js,
	// which must be loaded separately
	
	// begin preparations for animators
	//
	// frequencies for animators
	let fCount = 8;		// how many frequencies to stack
	let fNorm = 1 / 128;	// scalar for frequency normalisation
	let bgFrequencies0 = new Array(fCount).fill(0).map(i => Math.random() * fNorm);
	let bgFrequencies1 = new Array(fCount).fill(0).map(i => Math.random() * fNorm);
	let captionFrequencies = new Array(fCount).fill(0).map(i => Math.random() * fNorm);
	let demonFrequencies = new Array(fCount).fill(0).map(i => Math.random() * fNorm);
	//
	// directions for object spin (to prevent all going same direction)
	let bgDirection0 = Math.sign(Math.random() - 0.5);
	let bgDirection1 = Math.sign(Math.random() - 0.5);
	let captionDirection = Math.sign(Math.random() - 0.5);
	let demonDirection = Math.sign(Math.random() - 0.5);
	//
	// scaling stuff for screen
	// (so that larger screens scale down to correct number of pixels)
	let bgResScale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
	bgResScale = Math.ceil(bgResScale);
	//
	// configurations for animators
	let bgcfg = {	// background (OON_tripBackground)
		A0: 1/10,
		A1: 1/30,
		// f0: new Array(fCount).fill(0).map(i => (Math.random() - Math.random()) * fNorm * 3/2),
		// f1: new Array(fCount).fill(0).map(i => (Math.random() - Math.random()) * fNorm * 3),
		f0: new Array(fCount).fill(0).map(i => bgDirection0 * Math.random() * fNorm * 3/2),
		f1: new Array(fCount).fill(0).map(i => bgDirection1 * Math.random() * fNorm * 3),
		offset: Math.random() * 2048,
		
		bandwidth: 3/5,
		// scale: 1/32,
		scale: 1/32 / bgResScale,
	};
	let ccfg = {	// caption (OON_waver)
		A: 3/2,
		f: new Array(fCount).fill(0).map(i => captionDirection * Math.random() * fNorm),
		padding: 1/4,
		offset: 4096,
	};
	let dcfg = {	// demon (OON_waver)
		A: 3/2,
		f: new Array(fCount).fill(0).map(i => demonDirection * Math.random() * fNorm),
		padding: 1/4,
		offset: 4096 + Math.PI / 2,
	};

	// push dependencies
	ini.require('demonImage', asyncImageLoad('./resource/image/demon.png'));
	ini.require('captionImage', asyncImageLoad('./resource/image/caption.png'));
	ini.require('backgroundConfig', bgcfg);
	ini.require('captionConfig', ccfg);
	ini.require('demonConfig', dcfg);
	
	return ini;
}

// package data for loading
OON_DATA(GENERATE_INI());