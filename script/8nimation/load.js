// add a dynamic loading field to document 
// (for scripts primarily, but could expand to others in future)
function createDynamicLoadField(){
	let doc = globalThis.document;
	let ldField = doc.createElement('div');
	ldField.id = "8nimation-dynamic-loads";
	doc.body.appendChild(ldField);
	return ldField;
}
//
// ... and immediately call
const DYNAMIC_LOADS = createDynamicLoadField();
//
// to check if something is already loaded into the dynamic loading field
function probeDynamicLoadField(thing){
	// get a list of everything currently loaded
	let loaded = Array.from(DYNAMIC_LOADS.children);
	
	// determine if the new thing is currently loaded
	/*
	just checking if thing is already there with
		loaded.includes(thing)
	doesnt work;
	instead, filter loaded by every element's src:
	if anything shares a src (filtered array's length > 0),
	it must be a dupe
	*/
	let source = thing.src;
	let dupesBySource = loaded.filter(ld => ld.src.includes(source));
	let dupe = dupesBySource.length;
	
	return dupe;
}
// 
// to add things to dynamic loading field
function addToDynamicLoadField(thing){
	// if trying to load a duplicate, 
	// fake a load event and skip actually adding it to the DOM
	if(probeDynamicLoadField(thing)){
		let fakeLdE = new Event('load', {bubbles:0,cancelable:1,composed:0});
		thing.dispatchEvent(fakeLdE);
		return;
	}
	
	DYNAMIC_LOADS.appendChild(thing);
}
//
// to dynamically load scripts in
async function dynamicLoadScript(src){
	// find document
	let doc = globalThis.document;
	
	return new Promise((resolve, reject) => {
		// create script element
		let ld = doc.createElement('script');
		
		// success: resolve (script element)
		ld.onload = e => {
			resolve(ld);
		};
		// failure: reject  (event)
		ld.onerror = reject;
		
		// attempt load script source
		ld.charset = 'utf-8';		// set to correct charset
		ld.src = src;					// assign source
		addToDynamicLoadField(ld);	// append to document 
		                          	// (won't load/error before this step!!)
	});
}

// load images using promises
// (to use Promise.all on array of image loads)
async function asyncImageLoad(src){
	return new Promise((resolve, reject) => {
		// create image
		let image = new Image();
		// success: resolve (image)
		image.onload = e => {
			resolve(image);
		};
		// failure: reject  (event)
		image.onerror = reject;
		
		// attempt load image source
		image.src = src;
	});
}

const TMP_OONIMATION = {
	file: {
		correspondingElement(src){
			let tags = Array.from(DYNAMIC_LOADS.children);
			let ctags = tags.filter(t => t.src.includes(src));
			return ctags.length ? ctags[0] : false;
		},
		// loading tools
		load: {
			// load data from a file
			async data(src){
				let doc = globalThis.document;
				// load in a script
				let data = doc.createElement('script');
				DYNAMIC_LOADS.appendChild(data);
				data.src = src;
				// handle load/fail:
				return new Promise((resolve, reject) => {
					// when it gets its custom event back,
					// resolve the data and remove from DOM
					data.addEventListener('data', e => {
						DYNAMIC_LOADS.removeChild(data);
						resolve(e.detail.data);
					});
					// if it fails to load, reject
					data.onerror = reject;
				});
			},
		},
		// for a file to pack data for loading via load.data()
		/*
		CURRENTLY DOESNT WORK INSIDE ANONYMOUS FUNCTIONS!!!
		(e.g.,
			(function(){...})()
			asyncFunc().then(x => {...})
		&c)
		this isnt a terrible issue for this use case, since most things will be
		sending data from outside any functions, but this is a limitation to
		fixed before using this anywhere else!
		*/
		dataPackage(data){
			// create anon fn and autorun
			return (data => {
				// anon => currentScript is script element this fn called from
				const self = globalThis.document.currentScript;
				console.info('Loading data from', self.src);
				// create a custom event to send data back to loadData fn
				const dataEvent = new CustomEvent('data', {
					detail: {
						data: data,
					},
				});
				// send custom event wrapping data to script calling this fn
				// (which loadData detects and handles)
				self.dispatchEvent(dataEvent);
			})(data);
		},
	},
}

// hack dataPackage into global scope:
// from within a file to load data from, call
// 	OON_DATA(... data ...);
// to load data when called
globalThis.OON_DATA = TMP_OONIMATION.file.dataPackage;

/*
window.getRunningScript = () => {
	return () => {
		return new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0];
	}
}
// */